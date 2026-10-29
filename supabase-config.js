window.LINGUAFLASH_SUPABASE = {
  url: "https://ybfpcmriyaeqpdvnmpld.supabase.co",
  anonKey: "sb_publishable_syqfvbzlsdSz8tiJyn09CA_RiJDFnVZ"
};

// Load the optional HQ English audio layer. It only takes over when a matching
// pre-generated file exists in Supabase; otherwise the existing browser TTS remains active.
(function(){
  if (typeof document === 'undefined') return;

  if (!document.querySelector('script[data-lf-hq-english-audio]')) {
    var audioScript = document.createElement('script');
    audioScript.src = './english-hq-audio-v1.js?v=70';
    audioScript.defer = true;
    audioScript.setAttribute('data-lf-hq-english-audio', '1');
    (document.head || document.documentElement).appendChild(audioScript);
  }

  if (!document.querySelector('script[data-lf-hq-audio-admin]')) {
    var adminScript = document.createElement('script');
    adminScript.src = './english-audio-admin-v1.js?v=70';
    adminScript.defer = true;
    adminScript.setAttribute('data-lf-hq-audio-admin', '1');
    (document.head || document.documentElement).appendChild(adminScript);
  }
})();