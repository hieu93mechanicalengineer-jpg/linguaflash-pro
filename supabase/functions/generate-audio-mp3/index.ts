import { createClient } from "jsr:@supabase/supabase-js@2.119.0";

// The HeyGen API emits mono MP3 directly. Never encode WAV in a Supabase worker:
// CPU-bound lamejs previously exceeded the Edge Functions 2-second CPU budget.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization,apikey,content-type,x-client-info",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};
const response = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const norm = (s: unknown) => String(s ?? "").replace(/\s+/g, " ").trim();
const safe = (s: unknown) => norm(s).toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-|-+$/g, "").slice(0, 95) || "item";
const isMp3 = (a: Uint8Array) =>
  a.length > 4 && ((a[0] === 73 && a[1] === 68 && a[2] === 51) ||
  (a[0] === 255 && (a[1] & 224) === 224));
const isDictionary = (s: string) => /dictionary|trilingual|từ điển|词典/i.test(s);

type AudioRequest = { audio_key?: string; text?: string; lesson_id?: string; content_type?: string };
type Existing = {
  audio_key: string; storage_path: string; source_text: string; provider?: string;
  model?: string; voice_id?: string | null; duration_seconds?: number | null;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return response({ error: "POST only" }, 405);

  const base = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const heygenKey = Deno.env.get("HEYGEN_API_KEY");
  if (!base || !serviceKey) return response({ error: "Server configuration missing" }, 500);

  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return response({ error: "Authentication required" }, 401);
  const client = createClient(base, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: { user }, error: authError } = await client.auth.getUser(token);
  if (authError || !user) return response({ error: "Invalid user session" }, 401);
  const { data: admin, error: adminError } = await client.from("linguaflash_admins")
    .select("role").eq("user_id", user.id).maybeSingle();
  if (adminError || !admin) return response({ error: "Administrator required" }, 403);

  let body: { language?: string; items?: AudioRequest[] };
  try { body = await req.json(); }
  catch { return response({ error: "Invalid JSON" }, 400); }
  const lang = body.language;
  if (lang !== "en" && lang !== "zh") return response({ error: "language must be en or zh" }, 400);
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 4)
    return response({ error: "1–4 items are required per request" }, 400);

  const table = lang === "en" ? "english_audio_manifest" : "chinese_audio_manifest";
  const bucket = lang === "en" ? "english-audio" : "chinese-audio";
  const voice = lang === "en" ? "83548de556df48ba8c09c42a57c51d85"
    : "6c364011f30747c9a0a89eec3787cadc";
  const locale = lang === "en" ? "en-US" : "zh-CN";
  const model = "heygen-voice-1-turbo-free";
  const results: Record<string, unknown>[] = [];

  for (const item of body.items) {
    const id = norm(item?.audio_key), lesson = norm(item?.lesson_id);
    const type = norm(item?.content_type || "lesson"), text = norm(item?.text);
    if (!id || !lesson || !text || text.length > 2000 || isDictionary(lesson) || isDictionary(type)) {
      results.push({ ok: false, audio_key: id, error: "Invalid item or excluded dictionary" });
      continue;
    }

    try {
      const { data: exact, error: exactError } = await client.from(table)
        .select("audio_key,storage_path,source_text,provider,model,voice_id,duration_seconds")
        .eq("audio_key", id).maybeSingle();
      if (exactError) throw exactError;
      const exactMatch = exact && norm(exact.source_text) === text ? exact as Existing : null;

      // A previously completed request is idempotent. A WAV is playable but
      // requires a separate offline FFmpeg migration; never regenerate it or
      // transcode in the CPU-limited Edge Function.
      if (exactMatch?.storage_path?.toLowerCase().endsWith(".mp3")) {
        results.push({ ok: true, skipped: true, audio_key: id, path: exactMatch.storage_path, format: "mp3" });
        continue;
      }
      if (exactMatch?.storage_path?.toLowerCase().endsWith(".wav")) {
        results.push({ ok: true, skipped: true, conversion_pending: true, audio_key: id,
          path: exactMatch.storage_path, format: "wav" });
        continue;
      }

      const { data: matches, error: findError } = await client.from(table)
        .select("audio_key,storage_path,source_text,provider,model,voice_id,duration_seconds")
        .eq("source_text", text).eq("locale", locale).limit(20);
      if (findError) throw findError;
      const reuse = ((matches || []) as Existing[]).find(r => r.storage_path?.toLowerCase().endsWith(".mp3")) ||
        ((matches || []) as Existing[]).find(r => r.storage_path?.toLowerCase().endsWith(".wav"));

      const save = async (path: string, source?: Existing | null, duration?: number | null) => {
        const { error } = await client.from(table).upsert({
          audio_key: id, lesson_id: lesson, content_type: type, source_text: text, locale,
          generated_speed: 1, provider: source?.provider || "heygen",
          model: source?.model || model, voice_id: source?.voice_id || voice,
          storage_path: path, duration_seconds: source?.duration_seconds ?? duration ?? null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "audio_key" });
        if (error) throw error;
      };

      if (reuse?.storage_path) {
        await save(reuse.storage_path, reuse);
        const pending = reuse.storage_path.toLowerCase().endsWith(".wav");
        results.push({ ok: true, skipped: true, conversion_pending: pending, reused: true,
          audio_key: id, path: reuse.storage_path, format: pending ? "wav" : "mp3" });
        continue;
      }

      const path = safe(lesson) + "/" + safe(type) + "/" + safe(id) + ".mp3";
      // Recover after upload-success / manifest-failure without regenerating.
      const { data: stored } = await client.storage.from(bucket).info(path);
      if (stored) {
        await save(path);
        results.push({ ok: true, skipped: true, audio_key: id, path, format: "mp3", recovered: true });
        continue;
      }

      if (!heygenKey) throw Error("HEYGEN_API_KEY is not configured");
      const tts = await fetch("https://api.heygen.com/v3/models/audio/tts/stream", {
        method: "POST",
        headers: { "X-Api-Key": heygenKey, "Content-Type": "application/json", "Accept": "audio/mpeg" },
        body: JSON.stringify({
          model, voice_id: voice, text, language: lang,
          output_format: { encoding: "mp3", sample_rate_hertz: 24000,
            num_channels: 1, bitrate_bps: 64000 },
        }),
      });
      if (!tts.ok) {
        const message = (await tts.text()).slice(0, 500);
        const error = new Error("HeyGen HTTP " + tts.status + ": " + message);
        results.push({ ok: false, audio_key: id, error: error.message,
          status: tts.status, retry_after: tts.headers.get("Retry-After") });
        continue;
      }
      const bytes = new Uint8Array(await tts.arrayBuffer());
      if (!isMp3(bytes)) throw Error("HeyGen did not return valid MP3 bytes; no file saved");
      const { error: uploadError } = await client.storage.from(bucket).upload(path, bytes, {
        contentType: "audio/mpeg", upsert: false, cacheControl: "31536000",
      });
      if (uploadError) throw uploadError;
      await save(path);
      results.push({ ok: true, audio_key: id, path, bytes: bytes.length,
        bitrate_kbps: 64, channels: 1, sample_rate_hz: 24000 });
    } catch (e) {
      results.push({ ok: false, audio_key: id, error: String((e as Error)?.message || e) });
    }
  }

  return response({
    ok: results.every(r => r.ok), generated: results.filter(r => r.ok && !r.skipped).length,
    skipped: results.filter(r => r.skipped).length, failed: results.filter(r => !r.ok).length,
    bitrate_kbps: 64, channels: 1, results,
  });
});
