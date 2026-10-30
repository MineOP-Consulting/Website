/* ============================================================
   MineOp Consulting — shared script
   ============================================================ */
/* ============================================================
   MineOp Consulting — shared behaviour module.
   Exposes MineOp.init(), called by js/include.js once the shared
   header/footer partials have been injected into the page.
   ============================================================ */
window.MineOp = (function () {
  "use strict";

  function init() {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      /* ---- build contour survey lines into any .contour svg ---- */
      function buildContours(svg){
        var W=1440, H=900, lines = svg.classList.contains('dense') ? 16 : 12;
        var ns='http://www.w3.org/2000/svg';
        svg.setAttribute('viewBox','0 0 '+W+' '+H);
        svg.setAttribute('preserveAspectRatio','xMidYMid slice');
        for(var i=0;i<lines;i++){
          var y=120 + (i/(lines-1))*760;
          var amp=24+Math.sin(i*1.3)*26 + i*2.2;
          var d='M -50 '+y.toFixed(1), seg=8;
          for(var s=1;s<=seg;s++){
            var x=(-50)+(W+100)*(s/seg);
            var cy=y + Math.sin(s*1.1 + i*0.9)*amp - (i*9);
            var cx=x-(W+100)/seg/2;
            var pcy=y + Math.sin((s-0.5)*1.1 + i*0.9)*amp - (i*9);
            d+=' Q '+cx.toFixed(1)+' '+pcy.toFixed(1)+' '+x.toFixed(1)+' '+cy.toFixed(1);
          }
          var p=document.createElementNS(ns,'path');
          p.setAttribute('d',d);
          if(i%5===2) p.setAttribute('class','hot');
          p.style.setProperty('--len',2200);
          p.style.animationDelay=(0.1 + i*0.09)+'s';
          if(reduce){p.style.strokeDashoffset='0';p.style.animation='none';}
          svg.appendChild(p);
        }
      }
      document.querySelectorAll('.contour').forEach(buildContours);

      /* ---- hero kick ---- */
      var hero=document.querySelector('.hero');
      requestAnimationFrame(function(){ if(hero) hero.classList.add('go'); });

      /* ---- nav scrolled ---- */
      var nav=document.getElementById('nav');
      function onScrollNav(){ if(nav) nav.classList.toggle('scrolled', window.scrollY>40); }
      onScrollNav();

      /* ---- mobile menu ---- */
      var burger=document.getElementById('burger'), mobile=document.getElementById('mobile');
      if(burger && mobile){
        function closeM(){mobile.classList.remove('open');burger.setAttribute('aria-expanded','false');document.body.style.overflow='';}
        burger.addEventListener('click',function(){
          var open=mobile.classList.toggle('open');
          burger.setAttribute('aria-expanded',open?'true':'false');
          document.body.style.overflow=open?'hidden':'';
        });
        mobile.querySelectorAll('a').forEach(function(a){a.addEventListener('click',closeM);});
      }

      /* ---- reveal on scroll ---- */
      var io=new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
      },{threshold:0.14, rootMargin:'0px 0px -8% 0px'});
      document.querySelectorAll('.r').forEach(function(el){ io.observe(el); });

      /* ---- strata bands wipe ---- */
      var bio=new IntersectionObserver(function(entries){
        entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); bio.unobserve(e.target);} });
      },{threshold:0.4});
      document.querySelectorAll('.band').forEach(function(b){ bio.observe(b); });

      /* ---- depth gauge ---- */
      var track=document.getElementById('gaugeTrack');
      if(track){
        for(var i=0;i<=10;i++){
          var tick=document.createElement('div');
          tick.className='gauge-tick'+(i%5===0?' major':'');
          tick.style.top=(i*10)+'%';
          track.appendChild(tick);
          if(i%5===0){
            var lab=document.createElement('div');
            lab.className='gauge-label';
            lab.style.top=(i*10)+'%';
            lab.textContent='-'+(i*60)+'m';
            track.appendChild(lab);
          }
        }
      }
      var gHead=document.getElementById('gaugeHead'), gRead=document.getElementById('gaugeRead');
      function onScroll(){
        onScrollNav();
        var max=document.documentElement.scrollHeight-window.innerHeight;
        var p=max>0?window.scrollY/max:0;
        if(gHead){
          gHead.style.top=(p*100)+'%';
          gRead.style.top=(p*100)+'%';
          gRead.textContent='-'+Math.round(p*600)+'m';
        }
      }
      var ticking=false;
      window.addEventListener('scroll',function(){
        if(!ticking){ requestAnimationFrame(function(){onScroll();ticking=false;}); ticking=true; }
      },{passive:true});
      onScroll();

      /* ---- hero parallax ---- */
      if(!reduce){
        var cont=document.querySelector('.hero .contour');
        if(cont){
          window.addEventListener('scroll',function(){
            var y=window.scrollY;
            if(y<window.innerHeight){ cont.style.transform='translateY('+(y*0.18)+'px)'; }
          },{passive:true});
        }
      }

      /* ---- magnetic buttons ---- */
      if(!reduce && window.matchMedia('(pointer:fine)').matches){
        document.querySelectorAll('.btn,.nav-cta').forEach(function(btn){
          btn.addEventListener('mousemove',function(e){
            var r=btn.getBoundingClientRect();
            var x=e.clientX-r.left-r.width/2, y=e.clientY-r.top-r.height/2;
            btn.style.transform='translate('+(x*0.16)+'px,'+(y*0.26)+'px)';
          });
          btn.addEventListener('mouseleave',function(){ btn.style.transform=''; });
        });
      }

      /* ---- count up ---- */
      var counted=new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(!e.isIntersecting) return;
          var el=e.target, target=parseFloat(el.dataset.count), suffix=el.dataset.suffix||'';
          if(reduce){ el.textContent=target+suffix; counted.unobserve(el); return; }
          var start=null, dur=1400;
          function step(ts){
            if(!start) start=ts;
            var p=Math.min((ts-start)/dur,1);
            var val=Math.floor((1-Math.pow(1-p,3))*target);
            el.textContent=val+suffix;
            if(p<1) requestAnimationFrame(step); else el.textContent=target+suffix;
          }
          requestAnimationFrame(step);
          counted.unobserve(el);
        });
      },{threshold:0.6});
      document.querySelectorAll('[data-count]').forEach(function(el){ counted.observe(el); });

      /* ---- contact form -> open the visitor's email client (mailto) ---- */
      var form=document.getElementById('contactForm');
      if(form){
        var note=document.getElementById('formNote');
        form.addEventListener('submit',function(ev){
          ev.preventDefault();
          if(!form.checkValidity()){ form.reportValidity(); return; }
          var get=function(n){ var el=form.elements[n]; return el?el.value.trim():''; };
          var name=get('name'), email=get('email'), phone=get('phone'), message=get('message');
          var subject='Website enquiry from '+(name||'a visitor');
          var body=''
            +'Name: '+name+'\n'
            +'Email: '+email+'\n'
            +'Phone: '+phone+'\n\n'
            +'Message:\n'+message+'\n';
          var href='mailto:contact@mineop.com'
            +'?subject='+encodeURIComponent(subject)
            +'&body='+encodeURIComponent(body);
          window.location.href=href;
          if(note) note.textContent='Opening your email app to send this to contact@mineop.com…';
        });
      }

      /* ---- year ---- */
      document.querySelectorAll('.yr').forEach(function(el){ el.textContent=new Date().getFullYear(); });

      /* ---- years of experience (auto-updates every year) ---- */
      var nowYr=new Date().getFullYear();
      document.querySelectorAll('[data-since]').forEach(function(el){
        var since=parseInt(el.getAttribute('data-since'),10);
        if(!isNaN(since) && nowYr>since) el.textContent=(nowYr-since);
      });
  }

  return { init: init };
})();
