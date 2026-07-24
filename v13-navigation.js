(function(){
  'use strict';

  function getView(id){ return id ? document.getElementById(id) : null; }

  function openView(viewId){
    var target = getView(viewId);
    if(!target){
      alert('That section could not be opened.');
      return;
    }
    document.querySelectorAll('.view').forEach(function(view){
      view.classList.toggle('active', view.id === viewId);
    });
    document.querySelectorAll('.nav-item[data-view]').forEach(function(button){
      button.classList.toggle('active', button.dataset.view === viewId);
    });
    window.scrollTo({top:0, behavior:'smooth'});
    try { history.replaceState(null, '', '#' + viewId); } catch (_) {}
    document.dispatchEvent(new CustomEvent('mzj:view-opened',{detail:{viewId:viewId}}));
  }

  function openMore(){
    var dialog = document.getElementById('moreMenuDialog');
    if(!dialog) return;
    try {
      if(typeof dialog.showModal === 'function') dialog.showModal();
      else {
        dialog.setAttribute('open','');
        dialog.style.display='block';
      }
    } catch (_) {
      dialog.setAttribute('open','');
      dialog.style.display='block';
    }
  }

  function closeMore(){
    var dialog = document.getElementById('moreMenuDialog');
    if(!dialog) return;
    try { if(typeof dialog.close === 'function') dialog.close(); }
    catch (_) {}
    dialog.removeAttribute('open');
    dialog.style.display='';
  }

  function bind(){
    document.querySelectorAll('.nav-item[data-view]').forEach(function(button){
      button.onclick=function(){ openView(button.dataset.view); };
    });

    var moreButton=document.getElementById('moreNavBtn');
    if(moreButton) moreButton.onclick=openMore;

    var closeButton=document.getElementById('closeMoreMenuBtn');
    if(closeButton) closeButton.onclick=closeMore;

    document.querySelectorAll('[data-v12-view]').forEach(function(button){
      button.onclick=function(){
        var viewId=button.dataset.v12View;
        closeMore();
        openView(viewId);
      };
    });

    var settings=document.getElementById('v12SettingsBtn');
    if(settings) settings.onclick=function(){
      closeMore();
      var original=document.getElementById('settingsBtn');
      if(original) original.click();
    };

    var dialog=document.getElementById('moreMenuDialog');
    if(dialog){
      dialog.addEventListener('click',function(event){
        if(event.target===dialog) closeMore();
      });
    }

    window.mzjNavigate=openView;
    window.mzjOpenMore=openMore;
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind,{once:true});
  else bind();
})();
