(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const data = window.PASSPORT_DATA;
  const storage = {get(key) {try{return localStorage.getItem(key);}catch{return null;}},set(key,value){try{localStorage.setItem(key,value);}catch{}}};
  const themeButton = $('#theme-toggle');
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    $('meta[name="theme-color"]').content = theme === 'dark' ? '#050505' : '#faf8f3';
    $('link[rel="icon"]').href = `assets/mark-${theme}.svg`;
  }
  setTheme(storage.get('passport-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  themeButton.addEventListener('click', () => {const theme=document.documentElement.dataset.theme === 'dark'?'light':'dark';setTheme(theme);storage.set('passport-theme',theme);});
  const params=new URLSearchParams(location.search);
  const routeMatch=location.pathname.match(/\/passport\/([^/]+)\/?$/);
  let lot=params.get('lot') || (routeMatch ? routeMatch[1] : data.lotId);
  try {lot=decodeURIComponent(lot);} catch {lot='invalid';}
  if(lot !== data.lotId){$('#passport-shell').hidden=true;$('#unavailable').hidden=false;document.title='Record unavailable | Uncompromised';return;}
  const sections=$$('.record-section');
  const links=$$('.jump-nav a');
  const header=$('.site-header');
  function updateHeaderHeight(){document.documentElement.style.setProperty('--header-height',header.offsetHeight+'px');}
  updateHeaderHeight();
  if('ResizeObserver' in window)new ResizeObserver(updateHeaderHeight).observe(header);
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  let navigationTarget=null;
  let navigationTimer;
  let scrollPending=false;
  function setActiveSection(section) {
    links.forEach(link=>{if(link.hash==='#'+section.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  }
  function finishNavigation(){navigationTarget=null;clearTimeout(navigationTimer);}
  function followAnchor(hash, updateHistory=false) {
    let target;
    try{target=document.getElementById(decodeURIComponent(hash.slice(1)));}catch{return;}
    if(!target)return;
    const disclosure=target.matches('details')?target:target.closest('details');
    if(disclosure)disclosure.open=true;
    const section=target.matches('.record-section')?target:target.closest('.record-section');
    if(section){section.open=true;setActiveSection(section);navigationTarget=section;}
    else finishNavigation();
    if(updateHistory && location.hash!==hash)history.pushState(null,'',hash);
    requestAnimationFrame(()=>{
      const position=Math.max(0,window.scrollY+target.getBoundingClientRect().top-header.offsetHeight-12);
      window.scrollTo({top:position,behavior:reduced()?'instant':'smooth'});
      clearTimeout(navigationTimer);navigationTimer=setTimeout(finishNavigation,reduced()?50:1200);
    });
  }
  $$('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
    const hash=link.getAttribute('href');if(hash.length<2)return;
    event.preventDefault();followAnchor(hash,true);
  }));
  window.addEventListener('hashchange',()=>followAnchor(location.hash));
  window.addEventListener('popstate',()=>{if(location.hash)followAnchor(location.hash);});
  if(location.hash)setTimeout(()=>followAnchor(location.hash),30);
  function updateProgress(trackSection=true){
    if(trackSection){
      let current=navigationTarget || sections[0];
      if(!navigationTarget){
        const readingLine=header.offsetHeight+20;
        sections.forEach(section=>{if(section.getBoundingClientRect().top<=readingLine)current=section;});
        if(window.innerHeight+window.scrollY >= document.documentElement.scrollHeight-8)current=sections.at(-1);
      }
      setActiveSection(current);
    }
    scrollPending=false;
  }
  window.addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(()=>updateProgress());}},{passive:true});
  window.addEventListener('scrollend',finishNavigation);
  window.addEventListener('wheel',finishNavigation,{passive:true});
  window.addEventListener('touchstart',finishNavigation,{passive:true});
  window.addEventListener('resize',()=>updateProgress(false));
  sections.forEach(section=>{
    section.querySelector('summary').addEventListener('click',()=>{finishNavigation();setActiveSection(section);});
    section.addEventListener('toggle',()=>updateProgress(false));
  });
  updateProgress();
  const photoDialog=$('#photo-dialog');const mapDialog=$('#map-dialog');
  const photos=data.events.filter(event=>event.photo);let photoIndex=0;let opener=null;let specialPhoto=false;
  function openDialog(dialog,trigger){opener=trigger;dialog.showModal();document.body.style.overflow='hidden';dialog.querySelector('[data-close-dialog]').focus();}
  $$('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  $$('dialog').forEach(dialog=>{
    dialog.addEventListener('close',()=>{document.body.style.overflow='';if(opener && opener.isConnected)opener.focus({preventScroll:true});});
    dialog.addEventListener('click',event=>{if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();}});
  });
  function renderPhoto(event){
    const img=$('#lightbox-image');img.src=event.photo;img.alt=event.photoCaption || event.description;
    const fullSrc=event.photo.replace('assets/', 'assets/full/').replace('.jpg','.webp');
    const requestedPhoto=event.photo;img.dataset.photo=requestedPhoto;
    const full=new Image();full.onload=()=>{if(img.dataset.photo===requestedPhoto)img.src=fullSrc;};full.src=fullSrc;
    $('#photo-counter').textContent=specialPhoto?'Grower photograph':`Event photograph ${photoIndex+1} / ${photos.length}`;
    $('#photo-date').textContent=event.date;$('#photo-title').textContent=event.category;$('#photo-description').textContent=event.photoCaption || event.description;
    const farmCoordinates=`Farm location · ${data.farm.lat.toFixed(6)}° N, ${data.farm.lon.toFixed(6)}° E`;
    $('#photo-meta').textContent=[farmCoordinates,event.shared?'Shared-crop entry':null].filter(Boolean).join(' · ');
    $('#photo-prev').hidden=specialPhoto;$('#photo-next').hidden=specialPhoto;
    $('#photo-prev').disabled=photoIndex===0;$('#photo-next').disabled=photoIndex===photos.length-1;
  }
  $$('[data-photo-id]').forEach(button=>button.addEventListener('click',()=>{photoIndex=photos.findIndex(event=>event.id===button.dataset.photoId);specialPhoto=false;renderPhoto(photos[photoIndex]);openDialog(photoDialog,button);}));
  function movePhoto(direction){if(specialPhoto)return;const next=photoIndex+direction;if(next<0||next>=photos.length)return;photoIndex=next;renderPhoto(photos[photoIndex]);$('#live-status').textContent=`Photograph ${photoIndex+1} of ${photos.length}: ${photos[photoIndex].category}`;}
  $('#photo-prev').addEventListener('click',()=>movePhoto(-1));$('#photo-next').addEventListener('click',()=>movePhoto(1));
  photoDialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();movePhoto(-1);}if(event.key==='ArrowRight'){event.preventDefault();movePhoto(1);}});
  let touchX=null;
  $('.lightbox-stage').addEventListener('touchstart',event=>{touchX=event.touches.length===1?event.touches[0].clientX:null;},{passive:true});
  $('.lightbox-stage').addEventListener('touchend',event=>{if(touchX!==null){const dx=event.changedTouches[0].clientX-touchX;if(Math.abs(dx)>60)movePhoto(dx<0?1:-1);}touchX=null;},{passive:true});
  $('[data-grower-photo]').addEventListener('click',event=>{specialPhoto=true;renderPhoto({photo:'assets/field-06.jpg',date:'26 Dec 2025',category:'The people behind the crop',description:'A member of the field team beside the crop at Sarai.'});openDialog(photoDialog,event.currentTarget);});
  $('[data-open-map]').addEventListener('click',event=>{
    openDialog(mapDialog,event.currentTarget);
    if(!$('#interactive-map iframe')){const frame=document.createElement('iframe');frame.title='Interactive OpenStreetMap showing Sarai 1 farm';frame.referrerPolicy='no-referrer';frame.loading='lazy';frame.src='https://www.openstreetmap.org/export/embed.html?bbox=73.9489%2C24.5936%2C73.9729%2C24.6096&layer=mapnik&marker=24.601660%2C73.960907';$('#interactive-map').append(frame);}
  });
  const disclosures=[...sections,$('#time-log')];
  $('#time-log').addEventListener('toggle',()=>updateProgress(false));
  const printState=new Map();
  window.addEventListener('beforeprint',()=>disclosures.forEach(s=>{printState.set(s,s.open);s.open=true;}));
  window.addEventListener('afterprint',()=>disclosures.forEach(s=>{s.open=printState.get(s)??s.open;}));
  $$('img').forEach(img=>img.addEventListener('error',()=>{if(img.id==='lightbox-image'){img.alt='Photograph unavailable. The activity record remains available below.';return;}if(img.closest('.event-photo')){img.closest('.event-photo').classList.add('image-unavailable');img.alt='Photograph unavailable';}}));
})();
