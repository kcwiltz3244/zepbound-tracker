(function(){
  'use strict';
  function getView(id){return id?document.getElementById(id):null;}
  function openView(viewId){
    var target=getView(viewId);
    if(!target){alert('That section could not be opened.');return;}
    document.querySelectorAll('.view').forEach(function(v){v.classList.toggle('active',v.id===viewId);});
    document.querySelectorAll('.nav-item[data-view]').forEach(function(b){b.classList.toggle('active',b.dataset.view===viewId);});
    closeMore();
    window.scrollTo({top:0,behavior:'smooth'});
    try{history.replaceState(null,'','#'+viewId);}catch(_){ }
    document.dispatchEvent(new CustomEvent('mzj:view-opened',{detail:{viewId:viewId}}));
    if(viewId==='journalView'){
      try{
        if(typeof window.renderJournal==='function')window.renderJournal();
        var date=document.getElementById('journalEntryDate');
        if(date&&!date.value)date.value=new Date().toISOString().slice(0,10);
      }catch(err){console.warn('Journal refresh warning',err);}
    }
  }
  function openMore(){
    var d=document.getElementById('moreMenuDialog'); if(!d)return;
    try{if(typeof d.showModal==='function')d.showModal();else d.setAttribute('open','');}
    catch(_){d.setAttribute('open','');d.style.display='block';}
  }
  function closeMore(){
    var d=document.getElementById('moreMenuDialog'); if(!d)return;
    try{if(typeof d.close==='function'&&d.open)d.close();}catch(_){ }
    d.removeAttribute('open'); d.style.display='';
  }
  function ensureJournalButton(){
    var d=document.getElementById('moreMenuDialog'); if(!d||d.querySelector('[data-v12-view="journalView"]'))return;
    var host=d.querySelector('.v12-more-grid')||d.querySelector('section')||d;
    var b=document.createElement('button'); b.type='button'; b.dataset.v12View='journalView';
    b.innerHTML='<span>📖</span><strong>Journal</strong><small>Mood, appetite and notes</small>';
    host.appendChild(b);
  }
  function bind(){
    ensureJournalButton();
    document.addEventListener('click',function(e){
      var more=e.target.closest('#moreNavBtn'); if(more){e.preventDefault();openMore();return;}
      var close=e.target.closest('#closeMoreMenuBtn'); if(close){e.preventDefault();closeMore();return;}
      var route=e.target.closest('[data-v12-view]'); if(route){e.preventDefault();openView(route.dataset.v12View);return;}
      var nav=e.target.closest('.nav-item[data-view]'); if(nav){e.preventDefault();openView(nav.dataset.view);return;}
      var home=e.target.closest('.return-home-button'); if(home){e.preventDefault();openView('homeView');}
    });
    var d=document.getElementById('moreMenuDialog');
    if(d)d.addEventListener('click',function(e){if(e.target===d)closeMore();});
    window.mzjNavigate=openView; window.mzjOpenMore=openMore;
    var hash=location.hash.replace('#',''); if(hash&&getView(hash))openView(hash);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
