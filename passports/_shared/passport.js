(() => {
  'use strict';
  // Always open a passport at the top (e.g. arriving from a QR/short-link), unless
  // the URL carries a section deep-link. Prevents the browser from restoring a
  // previous scroll position on reload / back-forward / bfcache.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);
  window.addEventListener('pageshow', () => { if (!location.hash) window.scrollTo(0, 0); });
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const data = window.PASSPORT_DATA;
  const storage = {get(key) {try{return localStorage.getItem(key);}catch{return null;}},set(key,value){try{localStorage.setItem(key,value);}catch{}}};
  const themeButton = $('#theme-toggle');
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    $('meta[name="theme-color"]').content = theme === 'dark' ? '#050505' : '#faf8f3';
    $('link[rel="icon"]').href = `../../assets/mark-${theme}.svg`;
  }
  setTheme(storage.get('passport-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  themeButton.addEventListener('click', () => {const theme=document.documentElement.dataset.theme === 'dark'?'light':'dark';setTheme(theme);storage.set('passport-theme',theme);});
  const loader=$('#scan-screen');
  if(loader){
    const shell=$('#passport-shell');
    loader.hidden=false;
    shell.inert=true;
    window.setTimeout(()=>{loader.hidden=true;shell.inert=false;},750);
  }
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
  const COLLAPSE_MS=320;
  const animating=new WeakMap();
  const contentOf=details=>details.querySelector('.section-content,.timeline-content');
  const easeInOut=p=>p<0.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
  function animateDisclosure(details,toOpen){
    const summary=details.querySelector('summary');
    const content=contentOf(details);
    const running=animating.get(details);if(running)running.stop(true);
    if(!content){details.open=toOpen;return;}
    const anchorTop=summary.getBoundingClientRect().top;
    const anchor=()=>{const diff=summary.getBoundingClientRect().top-anchorTop;if(Math.abs(diff)>0.5)window.scrollTo({top:Math.max(0,Math.round(window.scrollY+diff)),behavior:'instant'});};
    if(toOpen&&!details.open)details.open=true;
    const natural=content.offsetHeight;
    if(reduced()){if(!toOpen)details.open=false;anchor();return;}
    const startH=toOpen?0:natural,endH=toOpen?natural:0;
    content.style.overflow='hidden';content.style.height=startH+'px';void content.offsetHeight;
    const t0=performance.now();const rec={};let done=false;
    const finish=cancelled=>{if(done)return;done=true;clearTimeout(rec.safety);content.style.height='';content.style.overflow='';if(!cancelled&&!toOpen)details.open=false;anchor();if(animating.get(details)===rec)animating.delete(details);};
    const frame=now=>{if(done)return;const p=Math.min(1,(now-t0)/COLLAPSE_MS),e=easeInOut(p);content.style.height=(startH+(endH-startH)*e)+'px';anchor();if(p<1)rec.raf=requestAnimationFrame(frame);else finish(false);};
    rec.stop=finish;rec.safety=setTimeout(()=>finish(false),COLLAPSE_MS+400);rec.raf=requestAnimationFrame(frame);
    animating.set(details,rec);
  }
  function toggleDisclosure(details){const next=!details.open;animateDisclosure(details,next);return next;}
  sections.forEach(section=>{
    section.querySelector('summary').addEventListener('click',event=>{event.preventDefault();finishNavigation();if(toggleDisclosure(section))setActiveSection(section);});
    section.addEventListener('toggle',()=>updateProgress(false));
  });
  updateProgress();

  // Photo / video lightbox — media is hosted externally (S3), so there is no local
  // higher-resolution variant to upgrade to; the source URL is shown as-is.
  const photoDialog=$('#photo-dialog');
  const photos=data.events.filter(event=>event.photo);let photoIndex=0;let opener=null;let simplePhoto=false;
  function openDialog(dialog,trigger){opener=trigger;dialog.showModal();document.body.style.overflow='hidden';dialog.querySelector('[data-close-dialog]').focus();}
  $$('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  $$('dialog').forEach(dialog=>{
    dialog.addEventListener('close',()=>{document.body.style.overflow='';if(opener && opener.isConnected)opener.focus({preventScroll:true});});
    dialog.addEventListener('click',event=>{if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();}});
  });
  function fmtExecs(execs){
    return (execs||[]).map(p=>p.hindi?`${p.name} (${p.hindi})`:p.name).join(', ') || 'Not recorded';
  }
  function escapeHtml(s){
    return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // Input chips open the same "lab test report" style card as the reference
  // passport: one real photo from an actual logged application, a real
  // applications count, and a real factual summary of the input — the
  // per-application photo and code below stand in for a real sample/lab
  // reference exactly as the reference disclaimer frames it ("sample data
  // shown for preview"). The full real dated log of every application still
  // lives in the Inputs Used table on the page itself.
  const inputDialog=$('#input-dialog');
  if(inputDialog){
    $$('.input-chip[data-input]').forEach(button=>button.addEventListener('click',()=>{
      const name=button.dataset.input;
      const rows=(data.inputDetails && data.inputDetails[name])||[];
      const info=data.inputInfo && data.inputInfo[name];
      const photo=data.inputPhotos && data.inputPhotos[name];
      const crop=data.crop||data.product;
      $('#input-dialog-title').textContent=name;
      $('#input-dialog-count').textContent=`${rows.length} application${rows.length!==1?'s':''} logged`;
      $('#input-dialog-media').innerHTML = photo
        ? (photo.type==='VIDEO'
            ? `<figure class="report-figure"><video src="${escapeHtml(photo.url)}" muted playsinline controls></video><figcaption>Sample drawn ${escapeHtml(photo.date)} &middot; Lab ref ${escapeHtml(photo.labRef)}</figcaption></figure>`
            : `<figure class="report-figure"><img src="${escapeHtml(photo.url)}" alt="" loading="lazy"><figcaption>Sample drawn ${escapeHtml(photo.date)} &middot; Lab ref ${escapeHtml(photo.labRef)}</figcaption></figure>`)
        : '';
      $('#input-dialog-body').innerHTML =
        '<span class="eyebrow muted small">Summary</span>'
        +`<p id="input-dialog-summary">${info?escapeHtml(info)+(crop?` Applied here on the ${escapeHtml(crop)} crop.`:''):'No further detail recorded for this input.'}</p>`
        +'<a class="primary-button" id="input-dialog-cta" href="#inputs-used">View full test report <span aria-hidden="true">&#8599;</span></a>'
        +'<p class="small muted report-disclaimer">Sample data shown for preview. Live lab reports are attached per input batch.</p>';
      openDialog(inputDialog,button);
    }));
    $('#input-dialog-body').addEventListener('click',event=>{
      const link=event.target.closest('#input-dialog-cta');
      if(!link)return;
      event.preventDefault();
      inputDialog.close();
      followAnchor('#inputs-used',true);
    });
  }
  function geoLine(event){
    if(event.photoLat!=null && event.photoLon!=null)
      return `Photo location · ${event.photoLat.toFixed(5)}° N, ${event.photoLon.toFixed(5)}° E`;
    if(data.farmGeo)
      return `Farm location · ${data.farmGeo.lat.toFixed(5)}° N, ${data.farmGeo.lon.toFixed(5)}° E`;
    return null;
  }
  function metaLine(event){
    const bits=[`Farm · ${data.farmLabel}`];
    if(event.plots && event.plots.length)bits.push('Plot '+event.plots.join(', '));
    if(event.execs && event.execs.length)bits.push('By '+fmtExecs(event.execs));
    const geo=geoLine(event);if(geo)bits.push(geo);
    if(event.photoCapturedAt)bits.push(`Photographed ${new Date(event.photoCapturedAt).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}`);
    if(event.mediaCount>1)bits.push(`+${event.mediaCount-1} more photo${event.mediaCount-1>1?'s':''}`);
    return bits.join(' · ');
  }
  function renderPhoto(event){
    const stage=$('.lightbox-stage');
    let media=$('#lightbox-image');
    if(event.photoType==='VIDEO'){
      if(media.tagName!=='VIDEO'){const v=document.createElement('video');v.id='lightbox-image';v.controls=true;v.style.maxWidth='100%';v.style.maxHeight='100%';media.replaceWith(v);media=v;}
      media.src=event.photo;media.load();
    } else {
      if(media.tagName!=='IMG'){const img=document.createElement('img');img.id='lightbox-image';media.replaceWith(img);media=img;}
      media.src=event.photo;media.alt=event.description;
    }
    $('#photo-counter').textContent=`Event photograph ${photoIndex+1} / ${photos.length}`;
    $('#photo-date').textContent=event.date;$('#photo-title').textContent=event.category;$('#photo-description').textContent=event.description;
    $('#photo-meta').textContent=metaLine(event);
    $('#photo-prev').disabled=photoIndex===0;$('#photo-next').disabled=photoIndex===photos.length-1;
  }
  $$('[data-photo-id]').forEach(button=>button.addEventListener('click',()=>{simplePhoto=false;photoIndex=photos.findIndex(event=>event.id===button.dataset.photoId);renderPhoto(photos[photoIndex]);openDialog(photoDialog,button);}));
  function renderSimplePhoto(src,alt,label){
    let media=$('#lightbox-image');
    if(media.tagName!=='IMG'){const img=document.createElement('img');img.id='lightbox-image';media.replaceWith(img);media=img;}
    media.src=src;media.alt=alt||'';
    $('#photo-counter').textContent=label||'';
    $('#photo-date').textContent='';
    $('#photo-title').textContent=alt||'';
    $('#photo-description').textContent='';
    $('#photo-meta').textContent='';
    $('#photo-prev').disabled=true;$('#photo-next').disabled=true;
  }
  $$('[data-simple-photo]').forEach(button=>button.addEventListener('click',()=>{
    simplePhoto=true;
    const img=button.querySelector('img');
    renderSimplePhoto(img.currentSrc||img.src,img.alt,button.dataset.simplePhoto);
    openDialog(photoDialog,button);
  }));
  function movePhoto(direction){if(simplePhoto)return;const next=photoIndex+direction;if(next<0||next>=photos.length)return;photoIndex=next;renderPhoto(photos[photoIndex]);$('#live-status').textContent=`Photograph ${photoIndex+1} of ${photos.length}: ${photos[photoIndex].category}`;}
  $('#photo-prev').addEventListener('click',()=>movePhoto(-1));$('#photo-next').addEventListener('click',()=>movePhoto(1));
  photoDialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();movePhoto(-1);}if(event.key==='ArrowRight'){event.preventDefault();movePhoto(1);}});
  let touchX=null;
  $('.lightbox-stage').addEventListener('touchstart',event=>{touchX=event.touches.length===1?event.touches[0].clientX:null;},{passive:true});
  $('.lightbox-stage').addEventListener('touchend',event=>{if(touchX!==null){const dx=event.changedTouches[0].clientX-touchX;if(Math.abs(dx)>60)movePhoto(dx<0?1:-1);}touchX=null;},{passive:true});

  const disclosures=[...sections,$('#time-log')];
  $('#time-log').querySelector('summary').addEventListener('click',event=>{event.preventDefault();finishNavigation();toggleDisclosure($('#time-log'));});
  $('#time-log').addEventListener('toggle',()=>{
    const timeline=$('#time-log');
    timeline.querySelector('summary').setAttribute('aria-label',timeline.open?'See less activity entries':'See more activity entries');
    updateProgress(false);
  });
  const printState=new Map();
  window.addEventListener('beforeprint',()=>disclosures.forEach(s=>{printState.set(s,s.open);s.open=true;}));
  window.addEventListener('afterprint',()=>disclosures.forEach(s=>{s.open=printState.get(s)??s.open;}));
  $$('img').forEach(img=>img.addEventListener('error',()=>{if(img.id==='lightbox-image'){img.alt='Photograph unavailable. The activity record remains available below.';return;}if(img.closest('.event-photo')){img.closest('.event-photo').classList.add('image-unavailable');img.alt='Photograph unavailable';}}));
})();
