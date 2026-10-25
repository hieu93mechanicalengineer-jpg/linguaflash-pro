/* LinguaFlash Cloud Sync v2
   - Progress is stored per card when the v2 Supabase schema exists.
   - Small account metadata remains one row per user.
   - Automatically falls back to legacy linguaflash_user_state until migration is applied.
*/
(function(){
  'use strict';

  const K={
    cards:'linguaflash_user_cards_v2',
    progress:'linguaflash_card_progress_v2',
    stats:'linguaflash_stats_huyen_anh_v5_correct_excel',
    topics:'linguaflash_custom_topics_v1',
    goals:'linguaflash_daily_goals_v1',
    daily:'linguaflash_daily_progress_v1',
    srs:'linguaflash_srs_settings_v1'
  };
  const TRACKED_KEYS=Object.values(K);
  const LEGACY_TABLE='linguaflash_user_state';
  const META_TABLE='linguaflash_user_meta';
  const PROGRESS_TABLE='linguaflash_card_progress';
  const PAGE_SIZE=1000;
  const WRITE_BATCH=400;

  let client=null,session=null,syncTimer=null,pollTimer=null,syncing=false,initialized=false;
  let syncMode='legacy';
  let lastMetaSnapshot='';
  let lastProgressSnapshot=new Map();

  function config(){return window.LINGUAFLASH_SUPABASE||{};}
  function configured(){const c=config();return /^https:\/\//.test(c.url||'')&&String(c.anonKey||'').length>20&&!/YOUR_|PASTE_|example/i.test((c.url||'')+(c.anonKey||''));}
  function parseJSON(raw,fallback){try{return raw?JSON.parse(raw):fallback;}catch(_){return fallback;}}
  function clone(v,fallback){try{return JSON.parse(JSON.stringify(v));}catch(_){return fallback;}}
  function collectState(){
    const data={};
    TRACKED_KEYS.forEach(k=>{const raw=localStorage.getItem(k);if(raw!=null)data[k]=parseJSON(raw,raw);});
    return {schemaVersion:2,data,clientUpdatedAt:new Date().toISOString()};
  }
  function collectMetaState(){
    const full=collectState();
    const data={...full.data};
    delete data[K.progress];
    return {schemaVersion:2,data,clientUpdatedAt:full.clientUpdatedAt};
  }
  function applyState(state){
    const data=(state&&state.data)||{};
    TRACKED_KEYS.forEach(k=>{if(Object.prototype.hasOwnProperty.call(data,k))localStorage.setItem(k,JSON.stringify(data[k]));else localStorage.removeItem(k);});
    try{if(typeof customTopics!=='undefined')customTopics=parseJSON(localStorage.getItem(K.topics),'[]')||[];}catch(_){}
    try{if(typeof loadData==='function')loadData();}catch(e){console.warn('Reload data after cloud:',e);}
    try{if(typeof loadDailyGoalSettings==='function')loadDailyGoalSettings();}catch(_){}
    try{if(typeof refreshAppHome==='function')refreshAppHome();}catch(_){}
  }
  function progressScore(p){return Number(p?.lastReviewedAt||p?.lastReview||0)||((Number(p?.repetitions||0)*1e8)+(Number(p?.reviewCount||0)*1e7)+(Number(p?.nextReview||0)>0?1:0));}
  function mergeProgress(local={},cloud={}){const out={...cloud};Object.entries(local||{}).forEach(([id,p])=>{if(!out[id]||progressScore(p)>=progressScore(out[id]))out[id]=p;});return out;}
  function mergeCards(local=[],cloud=[]){const map=new Map();(cloud||[]).forEach(c=>{if(c&&c.id)map.set(c.id,c);});(local||[]).forEach(c=>{if(c&&c.id)map.set(c.id,{...(map.get(c.id)||{}),...c});});return [...map.values()];}
  function mergeTopics(local=[],cloud=[]){const map=new Map();[...(cloud||[]),...(local||[])].forEach(x=>{const key=typeof x==='string'?x:JSON.stringify(x);if(key)map.set(key,x);});return [...map.values()];}
  function mergeDaily(local={},cloud={}){if(!local?.day)return cloud||{};if(!cloud?.day)return local||{};if(local.day!==cloud.day)return local.day>cloud.day?local:cloud;return {...cloud,...local,newIds:[...new Set([...(cloud.newIds||[]),...(local.newIds||[])])],reviewIds:[...new Set([...(cloud.reviewIds||[]),...(local.reviewIds||[])])]};}
  function mergeState(localState,cloudState){
    const l=localState?.data||{},c=cloudState?.data||{},d={...c};
    d[K.cards]=mergeCards(l[K.cards]||[],c[K.cards]||[]);
    d[K.progress]=mergeProgress(l[K.progress]||{},c[K.progress]||{});
    d[K.topics]=mergeTopics(l[K.topics]||[],c[K.topics]||[]);
    d[K.daily]=mergeDaily(l[K.daily]||{},c[K.daily]||{});
    const ls=l[K.stats]||{},cs=c[K.stats]||{};
    const dialogueQuizProgress=mergeProgress(ls.dialogueQuizProgress||{},cs.dialogueQuizProgress||{});
    d[K.stats]={...cs,...ls,dialogueQuizProgress,totalReviews:Math.max(Number(ls.totalReviews||0),Number(cs.totalReviews||0)),streak:Math.max(Number(ls.streak||1),Number(cs.streak||1))};
    d[K.goals]=Object.keys(c[K.goals]||{}).length?c[K.goals]:(l[K.goals]||{});
    d[K.srs]=Object.keys(c[K.srs]||{}).length?c[K.srs]:(l[K.srs]||{});
    return {schemaVersion:2,data:d,clientUpdatedAt:new Date().toISOString()};
  }

  function metaSnapshot(){try{return JSON.stringify(collectMetaState().data);}catch(_){return '';}}
  function progressObject(){return parseJSON(localStorage.getItem(K.progress)||'{}',{})||{};}
  function progressSnapshotMap(obj=progressObject()){const m=new Map();Object.entries(obj).forEach(([id,p])=>m.set(id,JSON.stringify(p)));return m;}
  function captureSnapshots(){lastMetaSnapshot=metaSnapshot();lastProgressSnapshot=progressSnapshotMap();}

  function setMessage(text,type='info'){const el=document.getElementById('lfAuthMessage');if(!el)return;el.textContent=text||'';el.className='lf-auth-message'+(text?' show '+type:'');}
  function setStatus(text,type=''){['lfCloudStatusPill','lfUserSyncStatus'].forEach(id=>{const el=document.getElementById(id);if(el){el.textContent=text;el.className='lf-cloud-pill '+type;}});}
  function displayName(user){return user?.user_metadata?.full_name||user?.user_metadata?.name||(user?.email||'').split('@')[0]||'Người học';}
  function escapeHtml(v){return String(v||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function humanError(err){const m=String(err?.message||err||'Có lỗi xảy ra.');if(/Invalid login credentials/i.test(m))return 'Email hoặc mật khẩu không đúng.';if(/Email not confirmed/i.test(m))return 'Email chưa được xác nhận. Hãy kiểm tra hộp thư.';if(/User already registered/i.test(m))return 'Email này đã được đăng ký.';if(/Password should be/i.test(m))return 'Mật khẩu chưa đạt yêu cầu.';if(/rate limit/i.test(m))return 'Bạn thao tác quá nhanh. Hãy thử lại sau ít phút.';return m;}
  function updateUI(){
    const logged=!!session?.user,cfg=configured();
    const guest=document.getElementById('lfGuestAuthArea'),userbox=document.getElementById('lfUserBox'),warn=document.getElementById('lfConfigWarning');
    if(warn)warn.style.display=cfg?'none':'block';if(guest)guest.style.display=logged?'none':'block';if(userbox)userbox.classList.toggle('show',logged);
    const hbtn=document.getElementById('lfAccountHeaderBtn'),homeBtn=document.getElementById('lfCloudHomeBtn'),homeText=document.getElementById('lfCloudHomeText');
    if(logged){
      const name=displayName(session.user),n=document.getElementById('lfUserName'),e=document.getElementById('lfUserEmail');if(n)n.textContent=name;if(e)e.textContent=session.user.email||'';
      if(hbtn)hbtn.innerHTML='👤 <span class="lf-account-label">'+escapeHtml(name)+'</span>';if(homeBtn)homeBtn.textContent='Tài khoản';
      if(homeText)homeText.textContent=syncMode==='v2'?'Tiến độ được đồng bộ theo từng thẻ để tiết kiệm dữ liệu và mở rộng tốt hơn.':'Tiến độ của bạn đang được đồng bộ. Bạn có thể đăng nhập trên thiết bị khác để học tiếp.';
      setStatus(syncMode==='v2'?'Đã kết nối · Sync v2':'Đã kết nối','online');
    }else{
      if(hbtn)hbtn.innerHTML='👤 <span class="lf-account-label">Tài khoản</span>';if(homeBtn)homeBtn.textContent='Đăng nhập / Đăng ký';
      if(homeText)homeText.textContent=cfg?'Bạn vẫn có thể học thử trên máy này. Đăng nhập để lưu tiến độ và học tiếp trên thiết bị khác.':'Đang ở chế độ dùng thử trên máy này. Chủ website chưa kết nối dịch vụ tài khoản cloud.';
      setStatus(cfg?'Chưa đăng nhập':'Chế độ cục bộ','');
    }
  }

  function missingTableError(error){const s=String(error?.code||'')+' '+String(error?.message||'')+' '+String(error?.details||'');return /42P01|PGRST205|does not exist|schema cache/i.test(s);}
  async function detectV2(){
    try{
      const a=await client.from(META_TABLE).select('user_id').limit(1);if(a.error){if(missingTableError(a.error))return false;throw a.error;}
      const b=await client.from(PROGRESS_TABLE).select('card_id').limit(1);if(b.error){if(missingTableError(b.error))return false;throw b.error;}
      return true;
    }catch(e){if(missingTableError(e))return false;console.warn('Sync v2 detection:',e);return false;}
  }

  async function readLegacyState(){
    const {data,error}=await client.from(LEGACY_TABLE).select('state,updated_at').eq('user_id',session.user.id).maybeSingle();
    if(error)throw error;return data||null;
  }
  async function pushLegacyState(state){const payload={user_id:session.user.id,state:state||collectState(),updated_at:new Date().toISOString()};const {error}=await client.from(LEGACY_TABLE).upsert(payload,{onConflict:'user_id'});if(error)throw error;}

  async function readAllProgressRows(){
    const out={};let offset=0;
    while(true){
      const {data,error}=await client.from(PROGRESS_TABLE).select('card_id,progress,updated_at').eq('user_id',session.user.id).range(offset,offset+PAGE_SIZE-1);
      if(error)throw error;
      (data||[]).forEach(row=>{if(row?.card_id)out[row.card_id]=row.progress||{};});
      if(!data||data.length<PAGE_SIZE)break;offset+=PAGE_SIZE;
    }
    return out;
  }
  async function readV2State(){
    const [{data:meta,error:metaError},progress]=await Promise.all([
      client.from(META_TABLE).select('state,updated_at').eq('user_id',session.user.id).maybeSingle(),
      readAllProgressRows()
    ]);
    if(metaError)throw metaError;
    const state=meta?.state&&typeof meta.state==='object'?clone(meta.state,{schemaVersion:2,data:{}}):{schemaVersion:2,data:{}};
    state.data=state.data||{};state.data[K.progress]=progress;state.schemaVersion=2;
    return {exists:!!meta||Object.keys(progress).length>0,state};
  }
  async function upsertMeta(state){
    const metaData={...(state?.data||{})};delete metaData[K.progress];
    const metaState={schemaVersion:2,data:metaData,clientUpdatedAt:new Date().toISOString()};
    const {error}=await client.from(META_TABLE).upsert({user_id:session.user.id,state:metaState,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(error)throw error;
  }
  async function upsertProgressEntries(entries){
    if(!entries.length)return;
    for(let i=0;i<entries.length;i+=WRITE_BATCH){
      const now=new Date().toISOString();
      const rows=entries.slice(i,i+WRITE_BATCH).map(([card_id,progress])=>({user_id:session.user.id,card_id,progress,updated_at:now}));
      const {error}=await client.from(PROGRESS_TABLE).upsert(rows,{onConflict:'user_id,card_id'});if(error)throw error;
    }
  }
  async function deleteProgressIds(ids){
    for(let i=0;i<ids.length;i+=WRITE_BATCH){const part=ids.slice(i,i+WRITE_BATCH);const {error}=await client.from(PROGRESS_TABLE).delete().eq('user_id',session.user.id).in('card_id',part);if(error)throw error;}
  }
  async function pushWholeV2(state){await upsertMeta(state);await upsertProgressEntries(Object.entries(state?.data?.[K.progress]||{}));}

  async function pullMergeLegacy(){
    const local=collectState();const data=await readLegacyState();
    if(!data){await pushLegacyState(local);applyState(local);}else{const merged=mergeState(local,data.state||{});applyState(merged);await pushLegacyState(merged);}
    captureSnapshots();setStatus('Đã đồng bộ','online');
  }
  async function pullMergeV2(){
    const local=collectState();
    const [v2,legacy]=await Promise.all([readV2State(),readLegacyState().catch(()=>null)]);
    let cloud=v2.exists?v2.state:null;
    if(legacy?.state)cloud=cloud?mergeState(cloud,legacy.state):legacy.state;
    const merged=cloud?mergeState(local,cloud):local;
    applyState(merged);
    await pushWholeV2(merged);
    captureSnapshots();setStatus('Đã đồng bộ · Sync v2','online');
  }
  async function pullMerge(){
    if(!client||!session?.user)return;
    setStatus('Đang đồng bộ…','syncing');
    syncMode=await detectV2()?'v2':'legacy';updateUI();
    if(syncMode==='v2')await pullMergeV2();else await pullMergeLegacy();
  }

  async function syncV2Delta(){
    const currentMeta=metaSnapshot();
    const progress=progressObject();
    const currentProgress=progressSnapshotMap(progress);
    const changed=[];const removed=[];
    currentProgress.forEach((snap,id)=>{if(lastProgressSnapshot.get(id)!==snap)changed.push([id,progress[id]]);});
    lastProgressSnapshot.forEach((_snap,id)=>{if(!currentProgress.has(id))removed.push(id);});
    if(currentMeta!==lastMetaSnapshot)await upsertMeta(collectState());
    if(changed.length)await upsertProgressEntries(changed);
    if(removed.length)await deleteProgressIds(removed);
    lastMetaSnapshot=currentMeta;lastProgressSnapshot=currentProgress;
  }
  async function syncNow(showToastMsg=false){
    if(syncing||!client||!session?.user)return;syncing=true;clearTimeout(syncTimer);
    try{
      setStatus('Đang đồng bộ…','syncing');
      if(syncMode==='v2')await syncV2Delta();else await pushLegacyState(collectState());
      if(syncMode==='legacy')captureSnapshots();
      setStatus(syncMode==='v2'?'Đã đồng bộ · Sync v2':'Đã đồng bộ','online');
      if(showToastMsg&&typeof showToast==='function')showToast(syncMode==='v2'?'Đã đồng bộ phần thay đổi lên tài khoản.':'Đã đồng bộ tiến độ lên tài khoản.','☁️');
    }catch(e){console.warn('Cloud sync:',e);setStatus('Lỗi đồng bộ','error');if(showToastMsg)setMessage(humanError(e),'error');}
    finally{syncing=false;}
  }
  function queueSync(){if(!session?.user)return;clearTimeout(syncTimer);syncTimer=setTimeout(()=>syncNow(false),650);}
  window.lfQueueCloudSync=queueSync;window.lfSyncNow=syncNow;
  window.lfCloudSyncMode=()=>syncMode;

  window.lfOpenAuthModal=function(){document.getElementById('lfAuthOverlay')?.classList.add('open');updateUI();};
  window.lfCloseAuthModal=function(){document.getElementById('lfAuthOverlay')?.classList.remove('open');setMessage('');};
  window.lfSetAuthMode=function(mode){
    const login=mode==='login',recovery=mode==='recovery';
    document.getElementById('lfLoginTab')?.classList.toggle('active',login);document.getElementById('lfRegisterTab')?.classList.toggle('active',!login&&!recovery);
    document.getElementById('lfLoginForm')?.classList.toggle('active',login);document.getElementById('lfRegisterForm')?.classList.toggle('active',!login&&!recovery);document.getElementById('lfRecoveryBox')?.classList.toggle('active',recovery);
    if(recovery){const g=document.getElementById('lfGuestAuthArea');if(g)g.style.display='none';document.getElementById('lfUserBox')?.classList.remove('show');}setMessage('');
  };
  window.lfLogin=async function(ev){ev.preventDefault();if(!client){setMessage('Chưa cấu hình dịch vụ tài khoản.','error');return;}const email=document.getElementById('lfLoginEmail').value.trim(),password=document.getElementById('lfLoginPassword').value,b=document.getElementById('lfLoginSubmit');b.disabled=true;setMessage('Đang đăng nhập…','info');try{const {data,error}=await client.auth.signInWithPassword({email,password});if(error)throw error;session=data.session;updateUI();await pullMerge();setMessage('Đăng nhập thành công. Tiến độ đã được đồng bộ.','ok');}catch(e){setMessage(humanError(e),'error');}finally{b.disabled=false;}};
  window.lfRegister=async function(ev){ev.preventDefault();if(!client){setMessage('Chưa cấu hình dịch vụ tài khoản.','error');return;}const name=document.getElementById('lfRegisterName').value.trim(),email=document.getElementById('lfRegisterEmail').value.trim(),password=document.getElementById('lfRegisterPassword').value,password2=document.getElementById('lfRegisterPassword2').value;if(password!==password2){setMessage('Hai mật khẩu chưa giống nhau.','error');return;}const b=document.getElementById('lfRegisterSubmit');b.disabled=true;setMessage('Đang tạo tài khoản…','info');try{const {data,error}=await client.auth.signUp({email,password,options:{data:{full_name:name},emailRedirectTo:location.origin+location.pathname}});if(error)throw error;if(data.session){session=data.session;updateUI();await pullMerge();setMessage('Tạo tài khoản thành công. Dữ liệu trên máy này đã được gắn với tài khoản.','ok');}else setMessage('Tài khoản đã được tạo. Hãy kiểm tra email để xác nhận rồi đăng nhập.','ok');}catch(e){setMessage(humanError(e),'error');}finally{b.disabled=false;}};
  window.lfForgotPassword=async function(){if(!client){setMessage('Chưa cấu hình dịch vụ tài khoản.','error');return;}const email=(document.getElementById('lfLoginEmail').value||'').trim();if(!email){setMessage('Nhập email ở ô đăng nhập trước.','info');return;}setMessage('Đang gửi hướng dẫn đặt lại mật khẩu…','info');try{const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});if(error)throw error;setMessage('Đã gửi email đặt lại mật khẩu. Hãy kiểm tra hộp thư.','ok');}catch(e){setMessage(humanError(e),'error');}};
  window.lfSetNewPassword=async function(ev){ev.preventDefault();const p=document.getElementById('lfNewPassword').value,p2=document.getElementById('lfNewPassword2').value;if(p!==p2){setMessage('Hai mật khẩu chưa giống nhau.','error');return;}try{const {error}=await client.auth.updateUser({password:p});if(error)throw error;setMessage('Đã đổi mật khẩu.','ok');lfSetAuthMode('login');}catch(e){setMessage(humanError(e),'error');}};
  function clearPersonalLocalData(){TRACKED_KEYS.forEach(k=>localStorage.removeItem(k));try{if(typeof customTopics!=='undefined')customTopics=[];}catch(_){}captureSnapshots();}
  window.lfLogout=async function(){if(!client)return;try{await syncNow(false);const {error}=await client.auth.signOut();if(error)throw error;session=null;clearPersonalLocalData();updateUI();if(typeof loadData==='function')loadData();if(typeof loadDailyGoalSettings==='function')loadDailyGoalSettings();lfCloseAuthModal();if(typeof showToast==='function')showToast('Đã đăng xuất. Dữ liệu tài khoản đã được xóa khỏi máy này.','👋');}catch(e){setMessage(humanError(e),'error');}};

  async function init(){
    if(initialized)return;initialized=true;updateUI();
    if(!configured()||!window.supabase?.createClient){if(configured()&&!window.supabase)setMessage('Không tải được thư viện Supabase. Hãy kiểm tra kết nối Internet.','error');return;}
    const c=config();client=window.supabase.createClient(c.url,c.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    const {data}=await client.auth.getSession();session=data?.session||null;updateUI();
    if(session?.user){try{await pullMerge();}catch(e){console.warn(e);setStatus('Lỗi đồng bộ','error');}}
    client.auth.onAuthStateChange((event,newSession)=>{session=newSession||null;updateUI();if(event==='PASSWORD_RECOVERY'){lfOpenAuthModal();lfSetAuthMode('recovery');}else if(event==='SIGNED_IN'&&session?.user){setTimeout(()=>pullMerge().catch(e=>{console.warn(e);setStatus('Lỗi đồng bộ','error');}),0);}else if(event==='SIGNED_OUT'){session=null;updateUI();}});
    pollTimer=setInterval(()=>{if(!session?.user||syncing)return;const metaChanged=metaSnapshot()!==lastMetaSnapshot;const cur=progressSnapshotMap();let progressChanged=cur.size!==lastProgressSnapshot.size;if(!progressChanged){for(const [id,snap] of cur){if(lastProgressSnapshot.get(id)!==snap){progressChanged=true;break;}}}if(metaChanged||progressChanged)queueSync();},5000);
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&session?.user)syncNow(false);});
    window.addEventListener('pagehide',()=>{if(session?.user)syncNow(false);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
