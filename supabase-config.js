window.LINGUAFLASH_SUPABASE = {
  url: "https://ybfpcmriyaeqpdvnmpld.supabase.co",
  anonKey: "sb_publishable_syqfvbzlsdSz8tiJyn09CA_RiJDFnVZ"
};

// Load the optional HQ English audio layer. It only takes over when a matching
// pre-generated file exists in Supabase; otherwise the existing browser TTS remains active.
(function(){
  if (typeof document === 'undefined') return;
  if (document.querySelector('script[data-lf-hq-english-audio]')) return;
  var script = document.createElement('script');
  script.src = './english-hq-audio-v1.js?v=70';
  script.defer = true;
  script.setAttribute('data-lf-hq-english-audio', '1');
  (document.head || document.documentElement).appendChild(script);
})();