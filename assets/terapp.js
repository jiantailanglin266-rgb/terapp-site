/* ============================================================
   TERAPP Official Brand Site — Shared Vanilla JS
   グローバルchrome(header/footer/feathers/breadcrumb)の注入 + 共通挙動
   各ページは <script> で window.TERAPP_PAGE = {...} を先に定義する
     id        : 現在ページID(ナビのactive表示に使用)
     breadcrumb: [{name, href?}, ...]  (最後はcurrent、hrefなし)
     feathers  : 'high' | 'low' | 'none'  (羽の密度。省略時 'default')
   ============================================================ */
(function(){
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PAGE = window.TERAPP_PAGE || {};

  /* ---- SNSリンク（本番では NEXT_PUBLIC_*_URL 等の環境変数/設定で管理。
          未確定のものは空文字にして自動的に非表示。架空URLは設定しない）---- */
  /* 公式SNS。URLはここに入れるだけで全ページのアイコンが有効化される。
     未設定（空文字）の間は「準備中」リンク(#)として表示される。架空URLは入れない。 */
  var SOCIAL = {
    instagram: '',   // 例: 'https://www.instagram.com/xxxx'  (NEXT_PUBLIC_INSTAGRAM_URL)
    youtube:   '',   // 例: 'https://www.youtube.com/@xxxx'   (NEXT_PUBLIC_YOUTUBE_URL)
    tiktok:    ''    // 例: 'https://www.tiktok.com/@xxxx'    (NEXT_PUBLIC_TIKTOK_URL)
  };
  window.TERAPP_SOCIAL = SOCIAL;

  var NAV = [
    {label:'CONCEPT',    href:'concept.html',    id:'concept'},
    {label:'PRODUCTS',   href:'products.html',   id:'products'},
    {label:'TECHNOLOGY', href:'technology.html', id:'technology'},
    {label:'HOW TO USE', href:'how-to-use.html', id:'how-to-use'},
    {label:'JOURNAL',    href:'journal.html',    id:'journal'},
    {label:'FAQ',        href:'faq.html',        id:'faq'},
    {label:'CONTACT',    href:'contact.html',    id:'contact'}
  ];

  var SOCIAL_ICONS = {
    instagram:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="18" height="18"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    tiktok:'<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M16 3c.3 2.1 1.6 3.7 3.7 4v2.7c-1.4 0-2.7-.4-3.7-1.1v5.9a5.5 5.5 0 11-5.5-5.5c.3 0 .6 0 .9.1v2.8a2.7 2.7 0 102 2.6V3H16z"/></svg>',
    youtube:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="18" height="18"><rect x="2.5" y="5.5" width="19" height="13" rx="3.5"/><path d="M10 9.2l5 2.8-5 2.8z" fill="currentColor" stroke="none"/></svg>',
    x:'<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M17.5 3h3l-6.6 7.5L21.7 21h-5.8l-4.5-5.9L6.1 21H3l7-8L2.7 3h5.9l4.1 5.4zM16.4 19.2h1.6L7.7 4.7H6z"/></svg>',
    line:'<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 3C6.9 3 3 6.4 3 10.5c0 3.7 3.1 6.8 7.4 7.4.3.1.7.2.8.5.1.3 0 .7 0 .9l-.1.8c0 .2-.2.9.8.5s5.3-3.1 7.2-5.3c1.3-1.4 1.9-2.9 1.9-4.8C21 6.4 17.1 3 12 3z"/></svg>'
  };

  var SOCIAL_LABELS = {instagram:'Instagram',youtube:'YouTube',tiktok:'TikTok',x:'X',line:'LINE'};
  /* 常時表示。URLがあれば新規タブで開く外部リンク、無ければ「準備中」リンク(#)。 */
  function socialLinksHTML(cls){
    return Object.keys(SOCIAL).map(function(k){
      var url = SOCIAL[k];
      var attrs = url
        ? ' href="'+url+'" target="_blank" rel="noopener noreferrer"'
        : ' href="#" aria-disabled="true" title="準備中"';
      var label = 'TERAPP '+SOCIAL_LABELS[k] + (url ? '' : '（準備中）');
      return '<a'+attrs+' class="'+(cls||'')+'" aria-label="'+label+'" data-social="'+k+'" data-ev="sns_click">'+SOCIAL_ICONS[k]+'</a>';
    }).join('');
  }
  window.terappSocialHTML = socialLinksHTML; // 各ページのSNS枠から再利用

  var BRAND_MARK = '<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><defs><linearGradient id="bm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E99AAD"/><stop offset="1" stop-color="#C9A86A"/></linearGradient></defs><circle cx="16" cy="16" r="13" fill="none" stroke="url(#bm)" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="url(#bm)"/></svg>';

  /* ============================================================
     1. Inject global chrome
     ============================================================ */
  function el(html){ var d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstChild; }

  // Skip link
  if(!document.querySelector('.skip-link')){
    var sk = el('<a href="#main" class="skip-link">本文へスキップ</a>');
    document.body.insertBefore(sk, document.body.firstChild);
  }

  // Background decor (四隅ボタニカル + アンビエントグロー + きらめき)
  if(!document.getElementById('bg-decor')){
    var sparkPos = [[12,20],[26,64],[44,14],[62,40],[78,72],[88,28],[36,84],[70,10]];
    var sparks = sparkPos.map(function(p,i){
      return '<span class="bd-spark" style="left:'+p[0]+'vw;top:'+p[1]+'vh;--sd:'+(4+i%4)+'s;--sdl:'+(i*0.5)+'s"></span>';
    }).join('');
    var bgDecor = el(
      '<div id="bg-decor" aria-hidden="true">'+
        '<span class="bd-glow g1"></span><span class="bd-glow g2"></span><span class="bd-glow g3"></span><span class="bd-glow g4"></span>'+
        '<img class="bd-corner c-tl" src="assets/ornament-corner.svg" alt="" width="480" height="480">'+
        '<img class="bd-corner c-tr" src="assets/ornament-corner.svg" alt="" width="480" height="480">'+
        '<img class="bd-corner c-bl" src="assets/ornament-corner.svg" alt="" width="480" height="480">'+
        '<img class="bd-corner c-br" src="assets/ornament-corner.svg" alt="" width="480" height="480">'+
        sparks +
      '</div>'
    );
    document.body.insertBefore(bgDecor, document.body.firstChild);
  }

  // Scroll progress bar
  var progress = el('<div class="scroll-progress" aria-hidden="true"></div>');
  document.body.appendChild(progress);

  // Header
  var navHTML = NAV.map(function(n){
    var cur = (n.id===PAGE.id) ? ' aria-current="page"' : '';
    return '<a href="'+n.href+'"'+cur+'>'+n.label+'</a>';
  }).join('');
  var header = el(
    '<header class="thdr" id="thdr">'+
      '<a href="index.html" class="brand" aria-label="TERAPP ホーム"><img class="brand-logo" src="assets/terapp-logo.png" alt="TERAPP" width="692" height="335"></a>'+
      '<nav class="nav" aria-label="メインナビゲーション">'+navHTML+
        '<span class="nav-social" aria-label="公式SNS">'+socialLinksHTML('nav-soc')+'</span>'+
        '<a href="products.html" class="nav-cta" data-ev="purchase_click">購入する</a>'+
      '</nav>'+
      '<button class="burger" id="burger" aria-label="メニューを開く" aria-expanded="false" aria-controls="drawer"><span></span><span></span><span></span></button>'+
    '</header>'
  );
  document.body.insertBefore(header, document.body.firstChild.nextSibling);

  // Mobile drawer
  var drawerLinks = NAV.map(function(n){ return '<a href="'+n.href+'" data-close>'+n.label+'</a>'; }).join('');
  var drawer = el(
    '<div class="drawer" id="drawer" aria-hidden="true" role="dialog" aria-modal="true" aria-label="メニュー">'+
      drawerLinks+
      '<a href="stores.html" data-close>STORES</a>'+
      '<a href="company.html" data-close>COMPANY</a>'+
      '<a href="products.html" class="nav-cta" data-close data-ev="purchase_click">購入する</a>'+
      '<div class="dr-social">'+socialLinksHTML()+'</div>'+
    '</div>'
  );
  document.body.appendChild(drawer);

  // Feathers layer
  var feathers = el('<div id="feathers" aria-hidden="true"></div>');
  document.body.appendChild(feathers);

  // Back to top
  var toTop = el('<button class="to-top" aria-label="ページトップへ戻る"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>');
  document.body.appendChild(toTop);

  // Page fade overlay (for internal navigation)
  var pageFade = el('<div class="page-fade" aria-hidden="true"><span class="pf-logo">TERAPP</span></div>');
  document.body.appendChild(pageFade);

  // Footer
  var footer = el(
    '<footer class="tftr">'+
      '<div class="ftr-wrap">'+
        '<div class="ftr-col ftr-brand">'+
          '<a href="index.html" class="foot-brand"><img src="assets/terapp-logo.png" alt="TERAPP" width="692" height="335"></a>'+
          '<p>目に見えない力で、毎日のコンディションを整える。テラヘルツの可能性を、美容とコンディショニングへ。</p>'+
          '<div class="ftr-social">'+socialLinksHTML()+'</div>'+
        '</div>'+
        '<div class="ftr-col"><h4>Brand</h4><ul>'+
          '<li><a href="concept.html">ブランドについて</a></li>'+
          '<li><a href="products.html">商品一覧</a></li>'+
          '<li><a href="technology.html">テクノロジー</a></li>'+
          '<li><a href="how-to-use.html">使い方</a></li>'+
          '<li><a href="beauty.html">美容</a></li>'+
          '<li><a href="conditioning.html">コンディショニング</a></li>'+
        '</ul></div>'+
        '<div class="ftr-col"><h4>Information</h4><ul>'+
          '<li><a href="journal.html">ニュース・コラム</a></li>'+
          '<li><a href="faq.html">よくある質問</a></li>'+
          '<li><a href="stores.html">取扱店舗</a></li>'+
          '<li><a href="company.html">会社・事業者情報</a></li>'+
          '<li><a href="contact.html">お問い合わせ</a></li>'+
        '</ul></div>'+
        '<div class="ftr-col"><h4>Legal</h4><ul>'+
          '<li><a href="legal-tokushoho.html">特定商取引法に基づく表記</a></li>'+
          '<li><a href="legal-privacy.html">プライバシーポリシー</a></li>'+
          '<li><a href="legal-terms.html">利用規約</a></li>'+
          '<li><a href="legal-returns.html">返品・交換について</a></li>'+
          '<li><a href="sitemap.html">サイトマップ</a></li>'+
        '</ul></div>'+
      '</div>'+
      '<p class="ftr-copy">&copy; <span id="ftr-year"></span> TERAPP. All Rights Reserved.</p>'+
    '</footer>'
  );
  document.body.appendChild(footer);
  var yEl = document.getElementById('ftr-year'); if(yEl) yEl.textContent = new Date().getFullYear();

  // Breadcrumbs (inject into placeholder #breadcrumbs if present, or after header on sub pages)
  if(PAGE.breadcrumb && PAGE.breadcrumb.length){
    var crumbHTML = '<nav class="breadcrumbs" aria-label="パンくずリスト">'+
      '<a href="index.html">HOME</a>'+
      PAGE.breadcrumb.map(function(c){
        var sep = '<span class="sep" aria-hidden="true">›</span>';
        if(c.href) return sep+'<a href="'+c.href+'">'+c.name+'</a>';
        return sep+'<span aria-current="page">'+c.name+'</span>';
      }).join('')+
    '</nav>';
    var ph = document.getElementById('breadcrumbs');
    if(ph){ ph.outerHTML = crumbHTML; }
  }

  /* ============================================================
     2. Behaviours
     ============================================================ */
  /* ---- Analytics ---- */
  function track(ev, params){ try{ if(window.dataLayer){ var o={event:ev}; if(params) for(var k in params)o[k]=params[k]; window.dataLayer.push(o); } }catch(e){} }
  window.terappTrack = track;
  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-ev]');
    if(t){ track(t.getAttribute('data-ev')); }
  });

  /* ---- Header scroll state + progress + back-to-top ---- */
  var hdr = document.getElementById('thdr');
  function onScroll(){
    var y = window.scrollY;
    hdr.classList.toggle('scrolled', y > 40);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h>0 ? (y/h*100) : 0) + '%';
    toTop.classList.toggle('show', y > window.innerHeight*0.8);
  }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  toTop.addEventListener('click', function(){ window.scrollTo({top:0, behavior: reduce?'auto':'smooth'}); });

  /* ---- Mobile drawer + focus trap + scroll lock ---- */
  var burger = document.getElementById('burger');
  var drawerEl = document.getElementById('drawer');
  var lastFocus = null;
  function setDrawer(open){
    burger.classList.toggle('open', open);
    drawerEl.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    drawerEl.setAttribute('aria-hidden', !open);
    burger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    document.body.style.overflow = open ? 'hidden' : '';
    if(open){ lastFocus = document.activeElement; var f=drawerEl.querySelector('a'); if(f) f.focus(); }
    else if(lastFocus){ lastFocus.focus(); }
  }
  burger.addEventListener('click', function(){ setDrawer(!drawerEl.classList.contains('open')); });
  drawerEl.querySelectorAll('[data-close]').forEach(function(a){ a.addEventListener('click', function(){ setDrawer(false); }); });
  document.addEventListener('keydown', function(e){
    if(!drawerEl.classList.contains('open')) return;
    if(e.key==='Escape'){ setDrawer(false); return; }
    if(e.key==='Tab'){
      var f = drawerEl.querySelectorAll('a,button'); if(!f.length) return;
      var first=f[0], last=f[f.length-1];
      if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
    }
  });

  /* ---- Internal page transition (fade wipe) ---- */
  if(!reduce){
    document.addEventListener('click', function(e){
      var a = e.target.closest('a');
      if(!a) return;
      var href = a.getAttribute('href');
      if(!href || href.charAt(0)==='#' || a.target==='_blank' || a.hasAttribute('data-social') || href.indexOf('http')===0 || href.indexOf('tel:')===0 || href.indexOf('mailto:')===0) return;
      if(a.hasAttribute('data-close')) return; // drawer handles its own
      e.preventDefault();
      pageFade.classList.add('run');
      var logo = pageFade.querySelector('.pf-logo');
      if(logo){ logo.style.transition='opacity .4s'; logo.style.opacity=0; setTimeout(function(){logo.style.opacity=1;},200); }
      setTimeout(function(){ window.location.href = href; }, 500);
    });
    // reset on back/forward (pageshow)
    window.addEventListener('pageshow', function(){ pageFade.classList.remove('run'); });
  }

  /* ---- Falling gold feathers (density by page) ---- */
  (function(){
    if(reduce) return;
    var density = PAGE.feathers || 'default';
    if(density==='none') return;
    var isMobile = window.innerWidth < 720;
    var MAX = density==='high' ? (isMobile?5:12) : density==='low' ? (isMobile?2:4) : (isMobile?3:7);
    var interval = density==='high' ? 2000 : density==='low' ? 4200 : 2800;
    var SIZES = [16,22,30];
    var svgNS = 'http://www.w3.org/2000/svg';
    var active = true;
    document.addEventListener('visibilitychange', function(){ active = !document.hidden; });
    function rnd(a,b){ return a + Math.random()*(b-a); }
    function spawn(){
      if(!active || feathers.childElementCount >= MAX) return;
      var wrap = document.createElement('div'); wrap.className='feather';
      var size = SIZES[Math.floor(Math.random()*SIZES.length)];
      var dur = rnd(9,15);
      wrap.style.left = rnd(2,96)+'vw';
      wrap.style.width = size+'px';
      wrap.style.setProperty('--fx', rnd(-70,70)+'px');
      wrap.style.setProperty('--fr', (rnd(140,320)*(Math.random()<.5?-1:1))+'deg');
      wrap.style.setProperty('--fo', rnd(.3,.6).toFixed(2));
      if(Math.random()<.3) wrap.style.filter='blur(1px)';
      wrap.style.animation = 'feather-fall '+dur.toFixed(1)+'s cubic-bezier(.45,.05,.55,.95) forwards';
      var svg = document.createElementNS(svgNS,'svg');
      svg.setAttribute('viewBox','0 0 24 48'); svg.setAttribute('width',size); svg.setAttribute('height',size*2);
      var p = document.createElementNS(svgNS,'path');
      p.setAttribute('d','M12 1C7 9 5 18 5 27c0 8 3 15 7 20 4-5 7-12 7-20 0-9-2-18-7-26z');
      p.setAttribute('fill','none'); p.setAttribute('stroke', Math.random()<.4 ? '#E9D29A' : '#C9A85F'); p.setAttribute('stroke-width','1');
      var spine = document.createElementNS(svgNS,'path');
      spine.setAttribute('d','M12 3v42'); spine.setAttribute('stroke','#E9D29A'); spine.setAttribute('stroke-width','.7'); spine.setAttribute('opacity','.7');
      svg.appendChild(p); svg.appendChild(spine); wrap.appendChild(svg);
      wrap.addEventListener('animationend', function(){ wrap.remove(); });
      feathers.appendChild(wrap);
    }
    spawn();
    setInterval(function(){ if(Math.random()<.85) spawn(); }, interval);
  })();

  /* ---- Dual marquee (auto-fill if #mq1/#mq2 exist) ---- */
  (function(){
    var mq1 = document.getElementById('mq1'), mq2 = document.getElementById('mq2');
    if(!mq1 && !mq2) return;
    var row1 = (PAGE.marquee1)||['BEAUTY','TERAHERTZ','CONDITIONING','DAILY CARE','INVISIBLE POSSIBILITY','TERAPP','貼る美容習慣','毎日のコンディショニング'];
    var row2 = (PAGE.marquee2)||['LIFT UP PATCH','FACE LINE CARE','NECK & DÉCOLLETÉ','BEAUTY ROUTINE','JAPANESE BEAUTY TECHNOLOGY','自分らしい美しさへ','テラヘルツの可能性'];
    function build(elm, items){
      if(!elm) return;
      var half = items.map(function(t){ return '<span class="mq-item">'+t+'<span class="mq-star">✦</span></span>'; }).join('');
      elm.innerHTML = half+half;
    }
    build(mq1,row1); build(mq2,row2);
  })();

  /* ---- Reveal on scroll ---- */
  (function(){
    var els = document.querySelectorAll('.reveal, .freq-band');
    if(reduce || !('IntersectionObserver' in window)){ els.forEach(function(el){ el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    }, {threshold:.14, rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(el){ io.observe(el); });
  })();

  /* ---- Share buttons (data-share container) ---- */
  (function(){
    document.querySelectorAll('[data-share]').forEach(function(box){
      var url = encodeURIComponent(location.href);
      var title = encodeURIComponent(document.title);
      box.innerHTML =
        '<span class="share-label">Share</span>'+
        '<a href="https://twitter.com/intent/tweet?url='+url+'&text='+title+'" target="_blank" rel="noopener" aria-label="Xでシェア" data-ev="share_click"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M17.5 3h3l-6.6 7.5L21.7 21h-5.8l-4.5-5.9L6.1 21H3l7-8L2.7 3h5.9l4.1 5.4zM16.4 19.2h1.6L7.7 4.7H6z"/></svg></a>'+
        '<a href="https://social-plugins.line.me/lineit/share?url='+url+'" target="_blank" rel="noopener" aria-label="LINEで送る" data-ev="share_click"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20l1.2-3.3A7 7 0 1112 19a8 8 0 01-3-.6z"/></svg></a>'+
        '<a href="https://www.facebook.com/sharer/sharer.php?u='+url+'" target="_blank" rel="noopener" aria-label="Facebookでシェア" data-ev="share_click"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 8h2V5h-2a3 3 0 00-3 3v2H9v3h2v6h3v-6h2l1-3h-3V8a1 1 0 011-1z"/></svg></a>'+
        '<button type="button" aria-label="URLをコピー" data-copy><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg></button>'+
        '<span class="copied" hidden>コピーしました</span>';
    });
    document.addEventListener('click', function(e){
      var wsBtn = e.target.closest('[data-share] a[aria-label]');
      // native share on supported devices for the X button (progressive)
      var copyBtn = e.target.closest('[data-copy]');
      if(copyBtn){
        var box = copyBtn.closest('[data-share]');
        var msg = box.querySelector('.copied');
        function done(){ if(msg){ msg.hidden=false; setTimeout(function(){msg.hidden=true;},1800);} track('share_click'); }
        if(navigator.share){ navigator.share({title:document.title, url:location.href}).then(done).catch(function(){}); }
        else if(navigator.clipboard){ navigator.clipboard.writeText(location.href).then(done).catch(done); }
        else { done(); }
      }
    });
  })();

  /* ---- FAQ accordion + search (if present) ---- */
  (function(){
    var list = document.querySelector('.faq-list'); if(!list) return;
    document.querySelectorAll('.faq-list').forEach(function(l){
      l.addEventListener('click', function(e){
        var btn = e.target.closest('.faq-q'); if(!btn) return;
        var item = btn.parentElement;
        var panel = item.querySelector('.faq-a');
        var open = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', open);
        panel.style.maxHeight = open ? (panel.scrollHeight+'px') : '0px';
        if(open) track('faq_open');
      });
    });
    var search = document.getElementById('faq-search-input');
    if(search){
      var empty = document.querySelector('.faq-empty');
      search.addEventListener('input', function(){
        var q = search.value.trim().toLowerCase();
        var anyVisible = 0;
        document.querySelectorAll('.faq-item').forEach(function(it){
          var txt = it.textContent.toLowerCase();
          var show = !q || txt.indexOf(q)>-1;
          it.style.display = show ? '' : 'none';
          if(show) anyVisible++;
        });
        document.querySelectorAll('.faq-cat-title').forEach(function(t){
          // hide category title if no visible items follow before next title
          var sib = t.nextElementSibling, hasVisible=false;
          while(sib && !sib.classList.contains('faq-cat-title')){
            if(sib.classList.contains('faq-list')){
              sib.querySelectorAll('.faq-item').forEach(function(i){ if(i.style.display!=='none') hasVisible=true; });
            }
            sib = sib.nextElementSibling;
          }
          t.style.display = hasVisible ? '' : 'none';
        });
        if(empty) empty.style.display = anyVisible ? 'none' : 'block';
      });
    }
  })();

  /* ---- Tabs (if present) ---- */
  (function(){
    var tabGroups = document.querySelectorAll('[data-tabs]');
    tabGroups.forEach(function(group){
      var btns = group.querySelectorAll('.tab-btn');
      btns.forEach(function(btn){
        btn.addEventListener('click', function(){
          var target = btn.getAttribute('data-tab');
          btns.forEach(function(b){ b.setAttribute('aria-selected', b===btn); });
          group.querySelectorAll('.tab-panel').forEach(function(p){
            p.classList.toggle('active', p.getAttribute('data-panel')===target);
          });
        });
      });
    });
  })();

  /* ---- Contact form (client validation + fake submit) ---- */
  (function(){
    var form = document.getElementById('contact-form'); if(!form) return;
    var success = document.getElementById('contact-success');
    var submitting = false;
    function setError(field, on){ field.classList.toggle('invalid', on); }
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if(submitting) return;
      var ok = true;
      form.querySelectorAll('.field[data-required]').forEach(function(field){
        var input = field.querySelector('input,select,textarea');
        var val = input ? input.value.trim() : '';
        var bad = !val;
        if(input && input.type==='email' && val){ bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val); }
        setError(field, bad); if(bad) ok=false;
      });
      var consent = form.querySelector('#consent');
      var consentField = consent ? consent.closest('.field, .consent-field') : null;
      if(consent && !consent.checked){ ok=false; if(consentField) consentField.classList.add('invalid'); }
      else if(consentField){ consentField.classList.remove('invalid'); }
      if(!ok){ var firstBad = form.querySelector('.invalid'); if(firstBad) firstBad.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'}); return; }
      // 二重送信防止
      submitting = true;
      var btn = form.querySelector('.form-submit');
      var orig = btn ? btn.textContent : '';
      if(btn){ btn.disabled=true; btn.textContent='送信中…'; }
      track('contact_submit');
      // NOTE: 実送信は未実装。バックエンド(環境変数 CONTACT_EMAIL 宛)接続後に fetch 実装。
      setTimeout(function(){
        form.style.display='none';
        if(success){ success.classList.add('show'); success.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'}); }
        if(btn){ btn.disabled=false; btn.textContent=orig; }
        submitting=false;
      }, 900);
    });
    // 種別開始トラッキング
    var typeSel = form.querySelector('#c-type');
    if(typeSel) typeSel.addEventListener('change', function(){ track('contact_start'); }, {once:true});
  })();

  /* ---- Video controls (if present) ---- */
  (function(){
    document.querySelectorAll('.video-band').forEach(function(band){
      var video = band.querySelector('video'); if(!video) return;
      var playBtn = band.querySelector('[data-video-play]');
      var muteBtn = band.querySelector('[data-video-mute]');
      // pause offscreen
      if('IntersectionObserver' in window){
        var io = new IntersectionObserver(function(es){ es.forEach(function(en){
          if(!en.isIntersecting && !video.paused){ video.pause(); }
        }); }, {threshold:.25});
        io.observe(video);
      }
      if(playBtn) playBtn.addEventListener('click', function(){
        if(video.paused){ video.play(); track('video_play'); } else { video.pause(); }
      });
      if(muteBtn) muteBtn.addEventListener('click', function(){ video.muted=!video.muted; });
      video.addEventListener('ended', function(){ track('video_complete'); });
    });
  })();

  /* ---- Flash intro (top page, first visit in session) ---- */
  (function(){
    if(reduce || PAGE.id!=='home') return;
    try{ if(sessionStorage.getItem('terapp_intro')) return; sessionStorage.setItem('terapp_intro','1'); }catch(e){}
    var intro = el('<div class="flash-intro" aria-hidden="true"><span class="fi-glow"></span><span class="fi-line"></span><img class="fi-logo" src="assets/terapp-logo.png" alt="TERAPP"></div>');
    document.body.appendChild(intro);
    requestAnimationFrame(function(){ intro.classList.add('run'); });
    setTimeout(function(){ intro.classList.add('done'); }, 1500);
    setTimeout(function(){ intro.remove(); }, 2100);
  })();

})();
