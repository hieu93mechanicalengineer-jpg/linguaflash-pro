/* LinguaFlash Admin Dashboard v1
   Visible only to users present in public.linguaflash_admins.
   Displays aggregate learning/account metrics only; no learner emails or personal data.
*/
(() => {
  'use strict';

  const ADMIN_TABLE = 'linguaflash_admins';
  const STATS_RPC = 'linguaflash_admin_dashboard_stats';
  let client = null;
  let session = null;
  let adminRole = null;
  let latestStats = null;
  let refreshing = false;

  function configured() {
    const c = window.LINGUAFLASH_SUPABASE || {};
    return /^https:\/\//.test(c.url || '') && String(c.anonKey || '').length > 20 && !/YOUR_|PASTE_|example/i.test((c.url || '') + (c.anonKey || ''));
  }

  function fmt(value) {
    const n = Number(value || 0);
    return Number.isFinite(n) ? n.toLocaleString('vi-VN') : '0';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);
  }

  function injectStyles() {
    if (document.getElementById('lfAdminStyles')) return;
    const style = document.createElement('style');
    style.id = 'lfAdminStyles';
    style.textContent = `
      #lfAdminOverlay{position:fixed;inset:0;z-index:99995;background:rgba(15,23,42,.62);display:none;align-items:flex-start;justify-content:center;padding:18px;overflow:auto}
      #lfAdminOverlay.open{display:flex}
      .lf-admin-shell{width:min(980px,100%);margin:auto;background:#f8fafc;border-radius:24px;box-shadow:0 24px 70px rgba(15,23,42,.3);overflow:hidden}
      .lf-admin-head{background:linear-gradient(135deg,#312e81,#4f46e5);color:#fff;padding:22px;display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
      .lf-admin-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
      .lf-admin-stat{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:15px}
      .lf-admin-stat .v{font-size:1.75rem;font-weight:800;color:#0f172a;line-height:1.05}
      .lf-admin-stat .l{font-size:.76rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.04em;margin-top:7px}
      .lf-admin-chart{height:130px;display:flex;align-items:flex-end;gap:5px;border-bottom:1px solid #cbd5e1;padding-top:12px}
      .lf-admin-bar-wrap{flex:1;min-width:0;height:100%;display:flex;align-items:flex-end;justify-content:center;position:relative}
      .lf-admin-bar{width:70%;min-width:5px;border-radius:6px 6px 0 0;background:linear-gradient(180deg,#6366f1,#4f46e5);min-height:3px}
      .lf-admin-bar-tip{display:none;position:absolute;bottom:calc(100% + 4px);background:#0f172a;color:#fff;font-size:10px;border-radius:6px;padding:3px 5px;white-space:nowrap}
      .lf-admin-bar-wrap:hover .lf-admin-bar-tip{display:block}
      @media(max-width:700px){.lf-admin-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.lf-admin-head{padding:18px}.lf-admin-shell{border-radius:18px}}
      @media(max-width:430px){.lf-admin-grid{grid-template-columns:1fr 1fr}.lf-admin-stat{padding:12px}.lf-admin-stat .v{font-size:1.45rem}}
    `;
    document.head.appendChild(style);
  }

  function ensureHomeCard() {
    if (!adminRole) return null;
    let card = document.getElementById('lfAdminHomeCard');
    if (card) return card;
    const cloud = document.getElementById('lfCloudHomeCard');
    const home = document.getElementById('tab-home');
    if (!home) return null;
    card = document.createElement('div');
    card.id = 'lfAdminHomeCard';
    card.className = 'app-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4';
    if (cloud) cloud.insertAdjacentElement('afterend', card);
    else home.appendChild(card);
    card.innerHTML = `
      <div class="min-w-0">
        <div class="font-extrabold text-slate-900">🛠 Admin Dashboard</div>
        <div id="lfAdminHomeSummary" class="text-sm text-slate-600 mt-1">Đang tải thống kê hệ thống…</div>
      </div>
      <button type="button" class="app-primary-btn shrink-0" onclick="lfOpenAdminDashboard()">Mở Dashboard</button>`;
    return card;
  }

  function removeAdminUi() {
    document.getElementById('lfAdminHomeCard')?.remove();
    document.getElementById('lfAdminOverlay')?.remove();
    adminRole = null;
    latestStats = null;
  }

  function ensureOverlay() {
    injectStyles();
    let overlay = document.getElementById('lfAdminOverlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'lfAdminOverlay';
    overlay.innerHTML = `
      <div class="lf-admin-shell">
        <div class="lf-admin-head">
          <div>
            <div class="text-xs font-extrabold tracking-[.14em] uppercase text-indigo-200">LINGUAFLASH ADMIN</div>
            <div class="text-2xl font-extrabold mt-1">Tổng quan hệ thống</div>
            <div id="lfAdminGenerated" class="text-sm text-indigo-100 mt-1">Số liệu tổng hợp, không hiển thị email người học.</div>
          </div>
          <button type="button" onclick="lfCloseAdminDashboard()" class="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 font-bold">✕</button>
        </div>
        <div class="p-4 sm:p-5 space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="text-sm text-slate-600">Hoạt động = tài khoản có thay đổi progress, metadata hoặc phiên học.</div>
            <button id="lfAdminRefreshBtn" type="button" onclick="lfRefreshAdminDashboard()" class="px-3 py-2 rounded-xl bg-white border border-slate-200 font-bold text-sm text-slate-700">↻ Làm mới</button>
          </div>
          <div id="lfAdminStatsGrid" class="lf-admin-grid"></div>
          <div class="bg-white border border-slate-200 rounded-2xl p-4">
            <div class="font-extrabold text-slate-900">Đăng ký mới · 14 ngày gần nhất</div>
            <div id="lfAdminSignupChart" class="lf-admin-chart mt-3"></div>
            <div id="lfAdminChartLabels" class="flex justify-between text-[10px] text-slate-400 mt-1"></div>
          </div>
          <div class="rounded-2xl bg-indigo-50 border border-indigo-100 p-4 text-sm text-indigo-900">
            Dashboard chỉ đọc dữ liệu tổng hợp. Quyền admin được kiểm tra ở Supabase, không dựa vào tên hay metadata người dùng trên trình duyệt.
          </div>
        </div>
      </div>`;
    overlay.addEventListener('click', event => { if (event.target === overlay) window.lfCloseAdminDashboard(); });
    document.body.appendChild(overlay);
    return overlay;
  }

  function statCard(value, label) {
    return `<div class="lf-admin-stat"><div class="v">${escapeHtml(fmt(value))}</div><div class="l">${escapeHtml(label)}</div></div>`;
  }

  function renderStats(stats) {
    latestStats = stats || {};
    const homeSummary = document.getElementById('lfAdminHomeSummary');
    if (homeSummary) homeSummary.textContent = `${fmt(stats.total_users)} tài khoản · ${fmt(stats.active_7d)} hoạt động 7 ngày · ${fmt(stats.progress_rows)} thẻ có progress`;

    const grid = document.getElementById('lfAdminStatsGrid');
    if (grid) grid.innerHTML = [
      statCard(stats.total_users, 'Tổng tài khoản'),
      statCard(stats.confirmed_users, 'Đã xác nhận'),
      statCard(stats.new_today, 'Đăng ký hôm nay'),
      statCard(stats.new_7d, 'Đăng ký 7 ngày'),
      statCard(stats.new_30d, 'Đăng ký 30 ngày'),
      statCard(stats.active_1d, 'Hoạt động 24 giờ'),
      statCard(stats.active_7d, 'Hoạt động 7 ngày'),
      statCard(stats.active_30d, 'Hoạt động 30 ngày'),
      statCard(stats.users_with_progress, 'Người có tiến độ'),
      statCard(stats.progress_rows, 'Thẻ có progress'),
      statCard(stats.total_reviews, 'Tổng lượt ôn')
    ].join('');

    const daily = Array.isArray(stats.daily_signups) ? stats.daily_signups : [];
    const max = Math.max(1, ...daily.map(item => Number(item.count || 0)));
    const chart = document.getElementById('lfAdminSignupChart');
    if (chart) chart.innerHTML = daily.map(item => {
      const count = Number(item.count || 0);
      const h = count ? Math.max(8, Math.round((count / max) * 100)) : 3;
      const day = String(item.day || '').slice(5);
      return `<div class="lf-admin-bar-wrap"><div class="lf-admin-bar-tip">${escapeHtml(day)} · ${count}</div><div class="lf-admin-bar" style="height:${h}%"></div></div>`;
    }).join('');
    const labels = document.getElementById('lfAdminChartLabels');
    if (labels && daily.length) labels.innerHTML = `<span>${escapeHtml(String(daily[0].day || '').slice(5))}</span><span>${escapeHtml(String(daily[daily.length - 1].day || '').slice(5))}</span>`;

    const generated = document.getElementById('lfAdminGenerated');
    if (generated && stats.generated_at) {
      const d = new Date(stats.generated_at);
      generated.textContent = `Cập nhật ${d.toLocaleString('vi-VN')} · múi giờ thống kê: Việt Nam`;
    }
  }

  async function fetchStats() {
    if (!client || !session?.user || !adminRole || refreshing) return latestStats;
    refreshing = true;
    const btn = document.getElementById('lfAdminRefreshBtn');
    if (btn) btn.disabled = true;
    try {
      const { data, error } = await client.rpc(STATS_RPC);
      if (error) throw error;
      renderStats(data || {});
      return data || {};
    } catch (err) {
      console.warn('Admin dashboard stats:', err);
      const homeSummary = document.getElementById('lfAdminHomeSummary');
      if (homeSummary) homeSummary.textContent = 'Không tải được thống kê. Hãy thử lại.';
      return null;
    } finally {
      refreshing = false;
      if (btn) btn.disabled = false;
    }
  }

  async function checkAdmin() {
    if (!client || !session?.user) { removeAdminUi(); return false; }
    const { data, error } = await client.from(ADMIN_TABLE).select('role').maybeSingle();
    if (error || !data?.role) { removeAdminUi(); return false; }
    adminRole = data.role;
    ensureHomeCard();
    ensureOverlay();
    await fetchStats();
    return true;
  }

  async function init() {
    if (!configured() || !window.supabase?.createClient) return;
    const c = window.LINGUAFLASH_SUPABASE;
    client = window.supabase.createClient(c.url, c.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    const { data } = await client.auth.getSession();
    session = data?.session || null;
    await checkAdmin();
    client.auth.onAuthStateChange((event, newSession) => {
      session = newSession || null;
      if (event === 'SIGNED_OUT') removeAdminUi();
      else if (session?.user) setTimeout(() => checkAdmin().catch(err => console.warn('Admin check:', err)), 0);
    });
  }

  window.lfOpenAdminDashboard = async function() {
    if (!adminRole) return;
    ensureOverlay().classList.add('open');
    await fetchStats();
  };
  window.lfCloseAdminDashboard = function() { document.getElementById('lfAdminOverlay')?.classList.remove('open'); };
  window.lfRefreshAdminDashboard = fetchStats;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
