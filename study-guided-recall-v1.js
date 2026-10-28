/* LinguaFlash legacy guided recall compatibility shim v54
   The old module used to auto-open Chunk Mode for new sentence cards and reveal
   the target answer. Chunk Mode now lives in study-chunk-mode-v1.js and Hint
   Ladder lives in study-hint-ladder-v2.js. Keep this file as a safe no-op for
   older cached pages that may still request it.
*/
(() => {
  'use strict';
  window.__LF_GUIDED_RECALL_V1__ = true;

  function cleanupLegacyChunk() {
    document.getElementById('lfChunkPanel')?.remove();
    document.getElementById('lfGuidedRecallStyles')?.remove();
  }

  cleanupLegacyChunk();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cleanupLegacyChunk, { once: true });
  }

  const observer = new MutationObserver(() => cleanupLegacyChunk());
  try { observer.observe(document.documentElement, { childList: true, subtree: true }); } catch (_) {}
})();
