window.LINGUAFLASH_SUPABASE = {
  url: "https://ybfpcmriyaeqpdvnmpld.supabase.co",
  anonKey: "sb_publishable_syqfvbzlsdSz8tiJyn09CA_RiJDFnVZ"
};

// HQ English audio layer: safe fallback to existing browser TTS when no stored file exists.
(function(){
  if (typeof document === 'undefined') return;

  function addScript(attr, src) {
    if (document.querySelector('script[' + attr + ']')) return;
    var script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.setAttribute(attr, '1');
    (document.head || document.documentElement).appendChild(script);
  }

  addScript('data-lf-hq-english-audio', './english-hq-audio-v1.js?v=72');

  // The admin generator needs the Supabase browser library and the persisted login
  // session. supabase-config.js loads earlier than both, so wait until they are ready.
  var tries = 0;
  var timer = setInterval(function(){
    tries += 1;
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      clearInterval(timer);
      addScript('data-lf-hq-audio-admin', './english-audio-admin-v1.js?v=72');
      return;
    }
    if (tries >= 40) clearInterval(timer);
  }, 250);
})();