/* LinguaFlash · Desktop lesson bootstrap bridge v2
   Evaluates the shared workspace with Unit 2 + Class 158 Health injected before
   the legacy direct workspace script runs; that later script exits via its guard.
*/
(() => {
  'use strict';
  if (window.__LF51_DESKTOP_UNIT2_BRIDGE_V1__) return;
  window.__LF51_DESKTOP_UNIT2_BRIDGE_V1__ = true;
  if (typeof window.LF51InjectUnit2IntoWorkspaceSource !== 'function') return;
  if (window.__LF51_DESKTOP_WORKSPACE_V1__) return;

  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', './english-51talk-desktop-workspace-v1.js?v=88', false);
    xhr.send(null);
    if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) {
      let code = window.LF51InjectUnit2IntoWorkspaceSource(xhr.responseText);
      if (typeof window.LF51InjectClass158HealthIntoWorkspaceSource === 'function') {
        code = window.LF51InjectClass158HealthIntoWorkspaceSource(code);
      }
      Function(`${code}\n//# sourceURL=english-51talk-desktop-workspace-lessons-v88.js`)();
      document.documentElement.dataset.lf51Unit2Desktop = '88';
      document.documentElement.dataset.lf51Health158Desktop = '88';
    }
  } catch (error) {
    console.warn('LinguaFlash desktop lesson bridge fallback:', error);
  }
})();
