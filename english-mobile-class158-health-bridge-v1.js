/* LinguaFlash · Class 158 Health mobile workspace bridge v1 */
(() => {
  'use strict';
  if (window.__LF51_MOBILE_CLASS158_HEALTH_BRIDGE_V1__) return;
  window.__LF51_MOBILE_CLASS158_HEALTH_BRIDGE_V1__ = true;
  if (typeof window.LF51InjectClass158HealthIntoWorkspaceSource !== 'function') return;

  const originalFetch = window.fetch.bind(window);
  window.fetch = async function(input, init) {
    const url = typeof input === 'string' ? input : String(input?.url || '');
    const response = await originalFetch(input, init);
    if (!/english-51talk-desktop-workspace-v1\.js(?:\?|$)/.test(url) || !response?.ok) return response;
    try {
      const code = await response.clone().text();
      const injected = window.LF51InjectClass158HealthIntoWorkspaceSource(code);
      if (injected === code) return response;
      const headers = new Headers(response.headers);
      headers.set('content-type', 'application/javascript; charset=utf-8');
      headers.delete('content-length');
      headers.delete('content-encoding');
      return new Response(injected, {status:response.status,statusText:response.statusText,headers});
    } catch (_) {
      return response;
    }
  };
})();
