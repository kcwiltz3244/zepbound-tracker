(function(){
  'use strict';
  const VERSION='13.0.0-dev.11';
  const PREFIXES=['mzjV7','mzjV8','mzjV9','mzjV10','mzjV11','mzjV12','mzjV13','zepboundProcess'];
  const CONFIG_KEY='mzjV13CloudConfig';
  const META_KEY='mzjV13FoundationMeta';
  const JOURNAL_KEY='mzjV13ChangeJournal';
  const CLOCK_KEY='mzjV13CloudClock';
  const DEVICE_KEY='mzjV13DeviceId';
  const INTERNAL_KEYS=new Set([CONFIG_KEY,META_KEY,JOURNAL_KEY,CLOCK_KEY,DEVICE_KEY,'mzjV13Errors']);
  const isSyncableKey=key=>typeof key==='string'&&PREFIXES.some(p=>key.startsWith(p))&&!INTERNAL_KEYS.has(key);
  let applyingCloud=false;
  const PHOTO_DB='mzjProgressPhotos';
  const PHOTO_STORE='photos';
  const $=id=>document.getElementById(id);
  const parse=(v,f=null)=>{try{return JSON.parse(v)}catch{return f}};
  const appKeys=()=>Object.keys(localStorage).filter(isSyncableKey).sort();
  function setStatus(text){if($('v13StatusText'))$('v13StatusText').textContent=text;}
  function download(name,data,type='application/json'){
    const url=URL.createObjectURL(new Blob([data],{type}));
    const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  function openDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(PHOTO_DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(PHOTO_STORE))r.result.createObjectStore(PHOTO_STORE)};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});}
  function blobToDataURL(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob)});}
  function dataURLToBlob(url){const [h,b]=url.split(',');const mime=(h.match(/data:([^;]+)/)||[])[1]||'application/octet-stream';const raw=atob(b);const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return new Blob([bytes],{type:mime});}
  async function getPhotos(){try{const db=await openDb();const result=await new Promise((resolve,reject)=>{const tx=db.transaction(PHOTO_STORE,'readonly');const s=tx.objectStore(PHOTO_STORE);const kr=s.getAllKeys(),vr=s.getAll();tx.oncomplete=async()=>{const out=[];for(let i=0;i<kr.result.length;i++){const blob=vr.result[i];if(blob)out.push({key:String(kr.result[i]),type:blob.type||'application/octet-stream',data:await blobToDataURL(blob)});}resolve(out)};tx.onerror=()=>reject(tx.error)});db.close();return result}catch(e){console.error('Photo backup error',e);return [];}}
  async function replacePhotos(photos){const db=await openDb();await new Promise((resolve,reject)=>{const tx=db.transaction(PHOTO_STORE,'readwrite');tx.objectStore(PHOTO_STORE).clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});for(const p of photos||[]){await new Promise((resolve,reject)=>{const tx=db.transaction(PHOTO_STORE,'readwrite');tx.objectStore(PHOTO_STORE).put(dataURLToBlob(p.data),p.key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});}db.close();}
  async function makeBackup(silent=false){
    const btn=$('v13BackupBtn');if(btn){btn.disabled=true;btn.textContent='Preparing backup…'}
    try{const storage={};appKeys().forEach(k=>storage[k]=parse(localStorage.getItem(k),localStorage.getItem(k)));const photos=await getPhotos();const createdAt=new Date().toISOString();const backup={format:'my-zepbound-journey-backup',schemaVersion:2,createdAt,app:{name:'My Zepbound Journey',version:VERSION,channel:'Development'},integrity:{localStorageKeys:Object.keys(storage).length,photoCount:photos.length},storage,photos};download(`My_Zepbound_Journey_Backup_${createdAt.slice(0,10)}.json`,JSON.stringify(backup,null,2));const meta=parse(localStorage.getItem(META_KEY),{})||{};meta.lastBackupAt=createdAt;localStorage.setItem(META_KEY,JSON.stringify(meta));if(!silent)alert(`Backup created successfully.\n\n${Object.keys(storage).length} data sections\n${photos.length} saved photos`);return backup;}catch(e){alert(`Backup could not be created.\n\n${e.message}`);throw e;}finally{if(btn){btn.disabled=false;btn.textContent='Complete backup'}}
  }
  function normalize(raw){if(raw&&raw.format==='my-zepbound-journey-backup')return raw;if(raw&&typeof raw==='object'&&!Array.isArray(raw)){const storage={};Object.keys(raw).filter(k=>PREFIXES.some(p=>k.startsWith(p))).forEach(k=>storage[k]=parse(raw[k],raw[k]));if(Object.keys(storage).length)return{format:'my-zepbound-journey-backup',schemaVersion:2,createdAt:new Date().toISOString(),storage,photos:[]};}throw new Error('This is not a recognized Zepbound backup file.');}
  async function restoreFile(file){if(!file)return;try{const backup=normalize(JSON.parse(await file.text()));if(!backup.storage||typeof backup.storage!=='object')throw new Error('The backup has no data section.');if(!confirm(`Restore this backup?\n\nData sections: ${Object.keys(backup.storage).length}\nPhotos: ${(backup.photos||[]).length}\n\nA safety backup downloads first.`))return;await makeBackup(true);appKeys().forEach(k=>localStorage.removeItem(k));Object.entries(backup.storage).forEach(([k,v])=>localStorage.setItem(k,typeof v==='string'?v:JSON.stringify(v)));await replacePhotos(backup.photos||[]);alert('Restore completed. The app will reload.');location.reload();}catch(e){alert(`Restore stopped safely.\n\n${e.message}`);}finally{if($('v13RestoreFile'))$('v13RestoreFile').value='';}}
  function ensureModals(){if(!$('v13DiagnosticsModal'))document.body.insertAdjacentHTML('beforeend',`<div class="v13-modal" id="v13DiagnosticsModal" hidden><section><header><div><span class="v13-dev-badge">DEVELOPMENT</span><h2>Version 13 Diagnostics</h2></div><button id="v13CloseDiagnostics" type="button">×</button></header><div class="v13-diag-grid" id="v13DiagGrid"></div><h3>Recent errors</h3><div class="v13-errors" id="v13ErrorList"></div><button id="v13RefreshDiagnostics" type="button">Refresh</button></section></div><div class="v13-modal" id="v13CloudModal" hidden><section><header><div><span class="v13-dev-badge">PRIVATE CONNECTION</span><h2>Cloud setup</h2></div><button id="v13CloseCloud" type="button">×</button></header><label>Cloudflare Worker address<input id="v13ApiUrl" type="url" placeholder="https://my-zepbound-sync.your-name.workers.dev"></label><label>Private access token<input id="v13ApiToken" type="password" autocomplete="off"></label><p class="v13-cloud-note">Enter the same address and token on the laptop and iPhone.</p><button id="v13SaveCloud" type="button">Save and test connection</button></section></div>`);}
  function diagnostics(){ensureModals();const config=parse(localStorage.getItem(CONFIG_KEY),{})||{};const meta=parse(localStorage.getItem(META_KEY),{})||{};const rows=[['App version',VERSION],['Connection',navigator.onLine?'Online':'Offline'],['Cloud configured',config.apiUrl&&config.token?'Yes':'No'],['Data sections',appKeys().length],['Last backup',meta.lastBackupAt?new Date(meta.lastBackupAt).toLocaleString():'None'],['Service worker',navigator.serviceWorker?.controller?'Active':'Waiting']];$('v13DiagGrid').innerHTML=rows.map(([a,b])=>`<article><small>${a}</small><strong>${String(b)}</strong></article>`).join('');$('v13ErrorList').innerHTML='<p>Safety controls are operating independently of the main app script.</p>';$('v13DiagnosticsModal').hidden=false;}
  function openCloud(){ensureModals();const c=parse(localStorage.getItem(CONFIG_KEY),{})||{};$('v13ApiUrl').value=c.apiUrl||'';$('v13ApiToken').value=c.token||'';$('v13CloudModal').hidden=false;}
  async function saveCloud(){const apiUrl=$('v13ApiUrl').value.trim().replace(/\/$/,'');const token=$('v13ApiToken').value.trim();if(!apiUrl||!token){alert('Enter the Worker address and access token.');return;}try{const r=await fetch(apiUrl+'/api/health',{headers:{Authorization:'Bearer '+token}});if(!r.ok)throw new Error(`Connection failed (${r.status})`);localStorage.setItem(CONFIG_KEY,JSON.stringify({apiUrl,token}));$('v13CloudModal').hidden=true;setStatus('Cloud connected · ready to synchronize');alert('Cloud connection accepted.');}catch(e){alert(`Connection was not accepted.\n\n${e.message}`);}}
  function deviceId(){let id=localStorage.getItem(DEVICE_KEY);if(!id){id=(crypto.randomUUID?crypto.randomUUID():'device-'+Date.now()+'-'+Math.random().toString(36).slice(2));originalSetItem.call(localStorage,DEVICE_KEY,id);}return id;}
  function readJournal(){const j=parse(localStorage.getItem(JOURNAL_KEY),{})||{};for(const key of Object.keys(j)){if(!isSyncableKey(key))delete j[key];}return j;}
  function writeJournal(j){originalSetItem.call(localStorage,JOURNAL_KEY,JSON.stringify(j));}
  function readClock(){const c=parse(localStorage.getItem(CLOCK_KEY),{})||{};for(const key of Object.keys(c)){if(!isSyncableKey(key))delete c[key];}return c;}
  function writeClock(c){originalSetItem.call(localStorage,CLOCK_KEY,JSON.stringify(c));}
  function recordChange(key,value,deleted=false){if(applyingCloud||!isSyncableKey(key))return;const j=readJournal();j[key]={key,value:deleted?null:(typeof value==='string'?parse(value,value):value),updatedAt:new Date().toISOString(),deviceId:deviceId(),deleted:Boolean(deleted)};writeJournal(j);}
  const originalSetItem=Storage.prototype.setItem;
  const originalRemoveItem=Storage.prototype.removeItem;
  if(!window.__mzjV13StorageWrapped){
    Storage.prototype.setItem=function(key,value){originalSetItem.call(this,key,value);if(this===localStorage)recordChange(String(key),value,false);};
    Storage.prototype.removeItem=function(key){originalRemoveItem.call(this,key);if(this===localStorage)recordChange(String(key),null,true);};
    window.__mzjV13StorageWrapped=true;
  }
  async function api(c,path,options={}){const headers={...(options.headers||{}),Authorization:'Bearer '+c.token};if(options.body&&!headers['Content-Type'])headers['Content-Type']='application/json';const r=await fetch(c.apiUrl+path,{...options,headers});if(!r.ok){let detail='';try{detail=(await r.json()).detail||''}catch{}throw new Error(`Cloud request failed (${r.status})${detail?': '+detail:''}`);}if(r.status===204)return null;return r.json();}
  async function sync(){
    const c=parse(localStorage.getItem(CONFIG_KEY),{})||{};
    if(!c.apiUrl||!c.token){openCloud();return;}
    const btn=$('v13SyncBtn');if(btn){btn.disabled=true;btn.textContent='Synchronizing…';}
    setStatus('Synchronizing with Cloudflare…');
    try{
      let cloud=((await api(c,'/api/records')).records||[]).filter(r=>isSyncableKey(r.key));
      const cloudMap=Object.fromEntries(cloud.map(r=>[r.key,r]));
      const clock=readClock();
      let journal=readJournal();
      applyingCloud=true;
      try{
        for(const rec of cloud){
          const pending=journal[rec.key];
          const localStamp=clock[rec.key]||'';
          if(pending)continue;
          if(!localStamp||rec.updated_at>localStamp){
            if(rec.deleted)originalRemoveItem.call(localStorage,rec.key);
            else originalSetItem.call(localStorage,rec.key,typeof rec.value==='string'?rec.value:JSON.stringify(rec.value));
            clock[rec.key]=rec.updated_at;
          }
        }
      }finally{applyingCloud=false;}
      for(const key of appKeys()){
        if(!cloudMap[key]&&!journal[key]){
          const raw=localStorage.getItem(key);
          journal[key]={key,value:parse(raw,raw),updatedAt:new Date().toISOString(),deviceId:deviceId(),deleted:false};
        }
      }
      writeJournal(journal);
      for(const [key,item] of Object.entries(journal)){
        await api(c,'/api/records',{method:'POST',body:JSON.stringify(item)});
        clock[key]=item.updatedAt;
        delete journal[key];
        writeJournal(journal);
      }
      writeClock(clock);
      cloud=((await api(c,'/api/records')).records||[]).filter(r=>isSyncableKey(r.key));
      applyingCloud=true;
      try{
        for(const rec of cloud){
          if(rec.deleted)originalRemoveItem.call(localStorage,rec.key);
          else originalSetItem.call(localStorage,rec.key,typeof rec.value==='string'?rec.value:JSON.stringify(rec.value));
          clock[rec.key]=rec.updated_at;
        }
      }finally{applyingCloud=false;}
      writeClock(clock);
      setStatus(`Synchronized · ${cloud.length} cloud records`);
      alert(`Synchronization completed.

${cloud.length} data sections are stored in Cloudflare.`);
      setTimeout(()=>location.reload(),250);
    }catch(e){console.error('Sync failed',e);setStatus('Synchronization error · local data remains safe');alert(`Synchronization stopped safely.

${e.message}

Your information remains on this device.`);}finally{if(btn){btn.disabled=false;btn.textContent='Sync now';}}
  }
  window.MZJFoundation={...(window.MZJFoundation||{}),version:VERSION,recordChange,syncNow:sync};
  function bind(){ensureModals();setStatus((parse(localStorage.getItem(CONFIG_KEY),{})||{}).apiUrl?'Cloud configured · ready':'Cloud connection needs setup');const pairs=[['v13BackupBtn',()=>makeBackup()],['v13RestoreBtn',()=>$('v13RestoreFile')?.click()],['v13DiagnosticsBtn',diagnostics],['v13CloudSetupBtn',openCloud],['v13SyncBtn',sync],['v13CloseDiagnostics',()=>{$('v13DiagnosticsModal').hidden=true}],['v13RefreshDiagnostics',diagnostics],['v13CloseCloud',()=>{$('v13CloudModal').hidden=true}],['v13SaveCloud',saveCloud]];for(const [id,fn] of pairs){const el=$(id);if(el&&!el.dataset.v13Bound){el.addEventListener('click',fn);el.dataset.v13Bound='yes';}}const input=$('v13RestoreFile');if(input&&!input.dataset.v13Bound){input.addEventListener('change',e=>restoreFile(e.target.files?.[0]));input.dataset.v13Bound='yes';}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
  window.V13SafetyControls={makeBackup,restoreFile,diagnostics};
})();
