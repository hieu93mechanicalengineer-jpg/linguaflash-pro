/* LinguaFlash · Unit 2 desktop bootstrap bridge v1
   Evaluates the shared workspace with Unit 2 injected before the legacy direct
   workspace script runs; that later script then exits via its existing guard.
*/
(() => {
  'use strict';
  if (window.__LF51_DESKTOP_UNIT2_BRIDGE_V1__) return;
  window.__LF51_DESKTOP_UNIT2_BRIDGE_V1__ = true;
  if (typeof window.LF51InjectUnit2IntoWorkspaceSource !== 'function') return;
  if (window.__LF51_DESKTOP_WORKSPACE_V1__) return;

  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', './english-51talk-desktop-workspace-v1.js?v=87', false);
    xhr.send(null);
    if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) {
      const code = window.LF51InjectUnit2IntoWorkspaceSource(xhr.responseText);
      Function(`${code}\n//# sourceURL=english-51talk-desktop-workspace-unit2-v87.js`)();
      document.documentElement.dataset.lf51Unit2Desktop = '87';
    }
  } catch (error) {
    console.warn('LinguaFlash Unit 2 desktop bridge fallback:', error);
  }
})();
