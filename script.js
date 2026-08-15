(function(){
"use strict";

var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine = window.matchMedia('(pointer: fine)').matches;

/* =========================================================
   TAB NAVIGATION
   ========================================================= */
var views = Array.prototype.slice.call(document.querySelectorAll('.view'));
var tabLinks = Array.prototype.slice.call(document.querySelectorAll('[data-tab-link]'));
var navTabs = Array.prototype.slice.call(document.querySelectorAll('.nav-tab'));
var glider = document.getElementById('navGlider');
var mobileMenu = document.getElementById('mobileMenu');
var navBurger = document.getElementById('navBurger');

function validTarget(t){
  return views.some(function(v){ return v.dataset.view === t; });
}

function setActiveView(target, opts){
  opts = opts || {};
  if(!validTarget(target)) target = 'home';

  views.forEach(function(v){
    v.classList.toggle('active', v.dataset.view === target);
  });

  navTabs.forEach(function(btn){
    btn.classList.toggle('active', btn.dataset.target === target);
  });

  moveGlider(target);

  if(!opts.skipHash){
    history.pushState(null, '', '#' + target);
  }

  if(!opts.skipScroll){
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  mobileMenu.classList.remove('open');
  navBurger.classList.remove('open');
  navBurger.setAttribute('aria-expanded', 'false');

  // re-run reveal check for the freshly visible section
  requestAnimationFrame(checkReveals);
}

function moveGlider(target){
  var activeBtn = navTabs.filter(function(b){ return b.dataset.target === target; })[0];
  if(!activeBtn || !glider) return;
  glider.style.width = activeBtn.offsetWidth + 'px';
  glider.style.transform = 'translateX(' + activeBtn.offsetLeft + 'px)';
}

tabLinks.forEach(function(link){
  link.addEventListener('click', function(e){
    var target = link.dataset.target;
    if(!target) return;
    e.preventDefault();
    setActiveView(target);
  });
});

window.addEventListener('popstate', function(){
  var hash = window.location.hash.replace('#','') || 'home';
  setActiveView(hash, { skipHash:true });
});

window.addEventListener('resize', function(){
  var current = document.querySelector('.nav-tab.active');
  if(current) moveGlider(current.dataset.target);
});

// initial view from hash
(function initView(){
  var hash = window.location.hash.replace('#','') || 'home';
  setActiveView(hash, { skipHash:true, skipScroll:true });
})();

/* mobile burger */
navBurger.addEventListener('click', function(){
  var open = mobileMenu.classList.toggle('open');
  navBurger.classList.toggle('open', open);
  navBurger.setAttribute('aria-expanded', open ? 'true' : 'false');
});

/* =========================================================
   SCROLL PROGRESS BAR
   ========================================================= */
var progressEl = document.getElementById('scanProgress');
function updateProgress(){
  var h = document.documentElement;
  var scrollable = h.scrollHeight - h.clientHeight;
  var pct = scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0;
  progressEl.style.width = pct + '%';
}
document.addEventListener('scroll', updateProgress, { passive:true });
updateProgress();

/* =========================================================
   CUSTOM CURSOR
   ========================================================= */
if(fine && !reduceMotion){
  var dot = document.getElementById('cursorDot');
  var ring = document.getElementById('cursorRing');
  var mx = window.innerWidth/2, my = window.innerHeight/2;
  var rx = mx, ry = my;

  window.addEventListener('mousemove', function(e){
    mx = e.clientX; my = e.clientY;
    dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    if(!document.body.classList.contains('has-cursor')){
      rx = mx; ry = my;
      document.body.classList.add('has-cursor');
    }
  });

  function ringLoop(){
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
    requestAnimationFrame(ringLoop);
  }
  ringLoop();

  document.addEventListener('mouseover', function(e){
    if(e.target.closest('a, button, input, textarea, .layer-card, .value-card, .service-card, .factor-slider')){
      ring.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', function(e){
    if(e.target.closest('a, button, input, textarea, .layer-card, .value-card, .service-card, .factor-slider')){
      ring.classList.remove('cursor-hover');
    }
  });
}

/* =========================================================
   MAGNETIC BUTTONS
   ========================================================= */
if(fine && !reduceMotion){
  document.querySelectorAll('.magnetic').forEach(function(btn){
    btn.addEventListener('mousemove', function(e){
      var r = btn.getBoundingClientRect();
      var relX = e.clientX - r.left - r.width/2;
      var relY = e.clientY - r.top - r.height/2;
      btn.style.transform = 'translate(' + (relX*0.18) + 'px,' + (relY*0.35) + 'px)';
    });
    btn.addEventListener('mouseleave', function(){
      btn.style.transform = 'translate(0,0)';
    });
  });
}

/* =========================================================
   REVEAL ON SCROLL
   ========================================================= */
var revealTargets = Array.prototype.slice.call(document.querySelectorAll('.reveal-up'));
var seen = new Set();
var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function(entries){
  entries.forEach(function(entry){
    if(entry.isIntersecting){
      entry.target.classList.add('in');
      seen.add(entry.target);
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' }) : null;

function checkReveals(){
  if(!io){
    revealTargets.forEach(function(el){ el.classList.add('in'); });
    return;
  }
  revealTargets.forEach(function(el){
    if(!seen.has(el) && el.offsetParent !== null){
      io.observe(el);
      // Safety net: guarantee content is never permanently invisible,
      // even if the observer never fires (e.g. tall elements, odd viewports).
      setTimeout(function(){
        if(!seen.has(el)){
          el.classList.add('in');
          seen.add(el);
          io.unobserve(el);
        }
      }, 1800);
    }
  });
}
checkReveals();

/* hero elements reveal immediately on load regardless of scroll */
window.addEventListener('load', function(){
  document.querySelectorAll('.hero .reveal-up').forEach(function(el){
    el.classList.add('in');
  });
});

/* =========================================================
   ANIMATED COUNTERS
   ========================================================= */
var counters = Array.prototype.slice.call(document.querySelectorAll('.stat-num'));
var countersDone = false;
function runCounters(){
  if(countersDone) return;
  countersDone = true;
  counters.forEach(function(el){
    var target = parseInt(el.dataset.count, 10) || 0;
    if(reduceMotion){ el.textContent = target; return; }
    var start = 0;
    var duration = 900;
    var startTime = null;
    function step(ts){
      if(!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (target-start) * eased);
      if(progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}
var statStrip = document.querySelector('.stat-strip');
if(statStrip && 'IntersectionObserver' in window){
  var statIo = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ runCounters(); statIo.disconnect(); } });
  }, { threshold: 0.3 });
  statIo.observe(statStrip);
  // Safety net, matching the .reveal-up fallback: never leave the counters at 0.
  setTimeout(function(){ runCounters(); statIo.disconnect(); }, 4000);
} else if(statStrip){
  runCounters();
}

/* =========================================================
   SCAN CANVAS — interactive topographic reveal
   ========================================================= */
(function scanCanvas(){
  var canvas = document.getElementById('scanCanvas');
  if(!canvas) return;
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;

  var clusters = [];
  var markers = [
    { xr:0.18, yr:0.42, score:91 },
    { xr:0.38, yr:0.68, score:74 },
    { xr:0.58, yr:0.30, score:58 },
    { xr:0.76, yr:0.58, score:33 },
    { xr:0.88, yr:0.24, score:82 }
  ];

  function scoreColor(score){
    if(score >= 75) return '#4C9A6A';
    if(score >= 50) return '#F0A93F';
    return '#E2574C';
  }

  function buildClusters(){
    clusters = [
      { cxr:0.22, cyr:0.5, baseR: H*0.22, rings:5 },
      { cxr:0.62, cyr:0.42, baseR: H*0.28, rings:6 },
      { cxr:0.85, cyr:0.65, baseR: H*0.16, rings:4 }
    ].map(function(c){
      var seeds = [];
      for(var i=0;i<c.rings;i++){
        seeds.push({
          p1: Math.random()*Math.PI*2,
          p2: Math.random()*Math.PI*2,
          amp: (0.10 + Math.random()*0.08)
        });
      }
      return { cxr:c.cxr, cyr:c.cyr, baseR:c.baseR, rings:c.rings, seeds:seeds };
    });
  }

  function resize(){
    var rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    buildClusters();
  }

  var pointer = { x: 0, y: 0, active:false };
  var lastMove = 0;

  canvas.addEventListener('mousemove', function(e){
    var r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
    pointer.active = true;
    lastMove = performance.now();
  });
  canvas.addEventListener('mouseleave', function(){ pointer.active = false; });
  canvas.addEventListener('touchmove', function(e){
    if(!e.touches || !e.touches[0]) return;
    var r = canvas.getBoundingClientRect();
    pointer.x = e.touches[0].clientX - r.left;
    pointer.y = e.touches[0].clientY - r.top;
    pointer.active = true;
    lastMove = performance.now();
  }, { passive:true });

  function drawRing(cx, cy, radius, seed, t){
    var pts = [];
    var N = 56;
    for(var i=0;i<=N;i++){
      var a = (i/N) * Math.PI * 2;
      var wob = Math.sin(a*3 + seed.p1 + t*0.6) * seed.amp
               + Math.sin(a*5 - seed.p2 + t*0.4) * seed.amp*0.5;
      var r = radius * (1 + wob*0.18);
      pts.push([ cx + Math.cos(a)*r, cy + Math.sin(a)*r*0.72 ]);
    }
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for(i=1;i<pts.length;i++){ ctx.lineTo(pts[i][0], pts[i][1]); }
    ctx.closePath();
    ctx.stroke();
  }

  function draw(t){
    ctx.clearRect(0,0,W,H);

    // contour lines
    ctx.lineWidth = 1;
    clusters.forEach(function(c){
      var cx = c.cxr*W, cy = c.cyr*H;
      for(var i=0;i<c.rings;i++){
        var radius = c.baseR * (0.35 + i*(0.7/c.rings));
        var alpha = 0.10 + (i % 2 === 0 ? 0.10 : 0.04);
        ctx.strokeStyle = 'rgba(53,89,74,' + alpha + ')';
        drawRing(cx, cy, radius, c.seeds[i], t);
      }
    });

    // determine effective scan position (pointer or autopilot)
    var now = performance.now();
    var px, py;
    if(pointer.active && now - lastMove < 3000){
      px = pointer.x; py = pointer.y;
    } else {
      var tt = t*0.35;
      px = W/2 + Math.sin(tt) * (W*0.34);
      py = H/2 + Math.sin(tt*1.6) * (H*0.28);
    }

    // soft scan glow
    var grad = ctx.createRadialGradient(px,py,0,px,py,150);
    grad.addColorStop(0, 'rgba(240,169,63,0.16)');
    grad.addColorStop(1, 'rgba(240,169,63,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px,py,150,0,Math.PI*2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(240,169,63,0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(px,py,150,0,Math.PI*2);
    ctx.stroke();

    // markers
    markers.forEach(function(m){
      var mx = m.xr*W, my = m.yr*H;
      var dist = Math.hypot(mx-px, my-py);
      var revealed = dist < 150;
      var col = scoreColor(m.score);
      var pulse = 1 + Math.sin(t*3 + m.xr*10)*0.08;

      if(revealed){
        var g2 = ctx.createRadialGradient(mx,my,0,mx,my,26);
        g2.addColorStop(0, col + 'aa');
        g2.addColorStop(1, col + '00');
        ctx.fillStyle = g2;
        ctx.beginPath(); ctx.arc(mx,my,26,0,Math.PI*2); ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(mx,my, (revealed?6:4)*pulse, 0, Math.PI*2);
      ctx.fillStyle = revealed ? col : 'rgba(159,179,168,0.55)';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = revealed ? '#ECE7D6' : 'rgba(159,179,168,0.4)';
      ctx.stroke();

      if(revealed){
        var label = 'NIRA ' + m.score;
        ctx.font = '700 11px "Space Mono", monospace';
        var tw = ctx.measureText(label).width;
        var padX = 7, padY = 5;
        var boxX = mx - tw/2 - padX, boxY = my - 34, boxW = tw + padX*2, boxH = 20;
        ctx.fillStyle = 'rgba(10,21,18,0.85)';
        ctx.beginPath();
        if(ctx.roundRect){ ctx.roundRect(boxX, boxY, boxW, boxH, 5); } else { ctx.rect(boxX,boxY,boxW,boxH); }
        ctx.fill();
        ctx.strokeStyle = col;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#ECE7D6';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, mx, boxY + boxH/2 + 1);
      }
    });
  }

  var raf = null;
  function loop(ts){
    draw((ts||0) / 1000);
    raf = requestAnimationFrame(loop);
  }

  function start(){
    resize();
    if(raf) cancelAnimationFrame(raf);
    if(reduceMotion){
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
    }
  }

  window.addEventListener('resize', function(){
    resize();
    if(reduceMotion) draw(0);
  });

  // only animate/build once canvas has real size
  if(canvas.getBoundingClientRect().width > 0){
    start();
  } else {
    window.addEventListener('load', start);
  }
})();

/* =========================================================
   SERVICES — SCORE DEMO
   ========================================================= */
(function scoreDemo(){
  var sliders = ['s1','s2','s3','s4','s5'].map(function(id){ return document.getElementById(id); });
  var vals = ['s1val','s2val','s3val','s4val','s5val'].map(function(id){ return document.getElementById(id); });
  var gaugeFill = document.getElementById('gaugeFill');
  var gaugeNum = document.getElementById('gaugeNum');
  var gaugeTag = document.getElementById('gaugeTag');
  if(!sliders[0] || !gaugeFill) return;

  var CIRC = 2 * Math.PI * 70; // r=70

  function scoreColor(score){
    if(score >= 75) return '#4C9A6A';
    if(score >= 50) return '#F0A93F';
    return '#E2574C';
  }
  function scoreTag(score){
    if(score >= 75) return 'STRONG SITE';
    if(score >= 50) return 'GOOD SITE';
    return 'HIGH RISK';
  }

  function update(){
    var total = 0;
    sliders.forEach(function(s, i){
      var v = parseInt(s.value, 10);
      vals[i].textContent = v;
      total += v;
    });
    var avg = Math.round(total / sliders.length);
    var offset = CIRC - (CIRC * avg / 100);
    gaugeFill.style.strokeDashoffset = offset;
    gaugeFill.style.stroke = scoreColor(avg);
    gaugeNum.textContent = avg;
    gaugeTag.textContent = scoreTag(avg);
    gaugeTag.style.color = scoreColor(avg);
  }

  sliders.forEach(function(s){ s.addEventListener('input', update); });
  update();
})();

/* =========================================================
   CONTACT FORM — mailto fallback
   ========================================================= */
(function contactForm(){
  var form = document.getElementById('contactForm');
  if(!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var org = form.org.value.trim();
    var message = form.message.value.trim();

    var subject = encodeURIComponent('Site scoring inquiry from ' + (name || 'website visitor'));
    var body = encodeURIComponent(
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      'Organization: ' + (org || '-') + '\n\n' +
      (message || '(no details provided)')
    );
    window.location.href = 'mailto:hello@niriksh.com?subject=' + subject + '&body=' + body;
  });
})();

})();
