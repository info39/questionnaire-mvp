/**
 * onboarding-animations.js
 *
 * GSAP animation layer for the UX Onboarding Engine.
 * Requires: GSAP 3 (loaded via CDN before this script).
 * Works alongside onboarding.js — does NOT modify engine logic.
 *
 * Animations:
 *  1. Intro screen  — staggered hero reveal
 *  2. Step enter    — slide-up + fade-in + option stagger
 *  3. Option select — spring pop
 *  4. Button hover  — elastic lift
 *  5. Summary       — celebration dots
 *  6. Progress bar  — smooth GSAP-driven fill
 */

(function () {
  'use strict';

  /* ── Guard: GSAP required ──────────────────────────────────────────────── */
  if (typeof gsap === 'undefined') {
    console.warn('[uob-animations] GSAP not found. Skipping animations.');
    return;
  }

  /* ── Register plugins if available ─────────────────────────────────────── */
  if (typeof CustomEase !== 'undefined') {
    gsap.registerPlugin(CustomEase);
    CustomEase.create('spring', 'M0,0 C0.1,0 0.14,1.18 0.4,1 0.66,0.82 0.83,1 1,1');
  }

  /* ── Config ──────────────────────────────────────────────────────────────*/
  var CFG = {
    stepEnter:    { duration: 0.42, ease: 'power3.out', y: 18, opacity: 0 },
    optionStagger:{ duration: 0.32, ease: 'power2.out', x: 12, stagger: 0.055 },
    btnHover:     { scale: 1.04,   duration: 0.22, ease: 'back.out(2.5)' },
    btnLeave:     { scale: 1,      duration: 0.18, ease: 'power2.out' },
    selectPop:    { scale: 1.025,  duration: 0.24, ease: 'back.out(3)' },
    introStagger: { duration: 0.52, ease: 'power3.out', y: 24, opacity: 0, stagger: 0.10 },
    progress:     { duration: 0.55, ease: 'power2.out' }
  };

  /* ── Utility: wait for DOM element ─────────────────────────────────────── */
  function waitFor(selector, root, cb, timeout) {
    var el = (root || document).querySelector(selector);
    if (el) { cb(el); return; }
    var start = Date.now();
    var id = setInterval(function () {
      el = (root || document).querySelector(selector);
      if (el || Date.now() - start > (timeout || 4000)) {
        clearInterval(id);
        if (el) cb(el);
      }
    }, 60);
  }

  /* ── 1. Intro Animation ─────────────────────────────────────────────────── */
  function animateIntro(root) {
    var content = root.querySelector('.uob-intro__content');
    if (!content) return;

    var children = content.children;
    gsap.set(children, { opacity: 0, y: CFG.introStagger.y });
    gsap.to(children, {
      opacity:  1,
      y:        0,
      duration: CFG.introStagger.duration,
      ease:     CFG.introStagger.ease,
      stagger:  CFG.introStagger.stagger,
      delay:    0.1
    });
  }

  /* ── 2. Step Enter Animation ─────────────────────────────────────────────── */
  function animateStep(stepEl) {
    if (!stepEl) return;

    /* Pause CSS fallback animation — GSAP takes over */
    stepEl.style.animation = 'none';
    stepEl.style.opacity   = '0';

    var tl = gsap.timeline();

    /* Step wrapper slides in */
    tl.fromTo(stepEl,
      { opacity: 0, y: CFG.stepEnter.y },
      { opacity: 1, y: 0, duration: CFG.stepEnter.duration, ease: CFG.stepEnter.ease }
    );

    /* Chapter label */
    var label = stepEl.querySelector('.uob-chapter-label');
    if (label) {
      tl.fromTo(label,
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.28, ease: 'power2.out' },
        '-=0.32'
      );
    }

    /* Question text */
    var question = stepEl.querySelector('.uob-question');
    if (question) {
      tl.fromTo(question,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.34, ease: 'power2.out' },
        '-=0.24'
      );
    }

    /* Options stagger */
    var options = stepEl.querySelectorAll('.uob-option');
    if (options.length) {
      tl.fromTo(options,
        { opacity: 0, x: CFG.optionStagger.x },
        {
          opacity:  1,
          x:        0,
          duration: CFG.optionStagger.duration,
          ease:     CFG.optionStagger.ease,
          stagger:  CFG.optionStagger.stagger
        },
        '-=0.20'
      );
    }

    /* Textarea or input */
    var input = stepEl.querySelector('.uob-textarea, .uob-input');
    if (input) {
      tl.fromTo(input,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.30, ease: 'power2.out' },
        '-=0.20'
      );
    }

    /* Action buttons */
    var actions = stepEl.querySelector('.uob-actions');
    if (actions) {
      tl.fromTo(actions,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.26, ease: 'power2.out' },
        '-=0.14'
      );
    }
  }

  /* ── 3. Option Select Animation ─────────────────────────────────────────── */
  function animateSelect(optionEl) {
    if (!optionEl) return;
    gsap.fromTo(optionEl,
      { scale: 1 },
      {
        scale:    CFG.selectPop.scale,
        duration: CFG.selectPop.duration / 2,
        ease:     'power2.out',
        yoyo:     true,
        repeat:   1
      }
    );
  }

  /* ── 4. Button Hover ─────────────────────────────────────────────────────── */
  function attachButtonHover(root) {
    var observer = new MutationObserver(function () { bindBtns(root); });
    observer.observe(root, { childList: true, subtree: true });
    bindBtns(root);
  }

  function bindBtns(root) {
    var btns = root.querySelectorAll('.uob-btn:not([data-gsap-hover])');
    btns.forEach(function (btn) {
      btn.setAttribute('data-gsap-hover', '1');
      btn.addEventListener('mouseenter', function () {
        gsap.to(btn, CFG.btnHover);
      });
      btn.addEventListener('mouseleave', function () {
        gsap.to(btn, CFG.btnLeave);
      });
    });
  }

  /* ── 5. Progress Bar ─────────────────────────────────────────────────────── */
  function updateProgressBar(root) {
    var bar = root.querySelector('.uob-sidebar__progress-bar');
    if (!bar) return;
    var width = bar.style.width || '0%';
    gsap.to(bar, {
      width:    width,
      duration: CFG.progress.duration,
      ease:     CFG.progress.ease,
      overwrite: true
    });
  }

  /* ── 6. Summary Celebration ──────────────────────────────────────────────── */
  function triggerCelebration(root) {
    var colors = ['#2563eb', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    var overlay = document.createElement('div');
    overlay.className = 'uob-celebration';
    document.body.appendChild(overlay);

    for (var i = 0; i < 40; i++) {
      (function (idx) {
        var dot = document.createElement('div');
        dot.className = 'uob-confetti-dot';
        dot.style.background = colors[idx % colors.length];
        dot.style.left = Math.random() * 100 + 'vw';
        dot.style.top  = '-10px';
        overlay.appendChild(dot);

        gsap.to(dot, {
          y:        window.innerHeight * (0.5 + Math.random() * 0.6),
          x:        (Math.random() - 0.5) * 200,
          rotation: Math.random() * 720,
          opacity:  1,
          duration: 0.4,
          delay:    Math.random() * 0.4,
          ease:     'power2.out',
          onComplete: function () {
            gsap.to(dot, {
              y:        '+=' + (window.innerHeight * 0.3),
              opacity:  0,
              duration: 0.6,
              ease:     'power1.in'
            });
          }
        });
      })(i);
    }

    /* Remove overlay after animation */
    setTimeout(function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 2000);
  }

  /* ── Core: MutationObserver ──────────────────────────────────────────────── */
  function observe(root) {
    var prevStep = null;

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (!node.classList) return;

          /* New step entered */
          if (node.classList.contains('uob-step')) {
            animateStep(node);
            prevStep = node;
          }

          /* Intro screen appeared */
          if (node.classList.contains('uob-intro')) {
            animateIntro(root);
          }

          /* Summary appeared */
          if (node.classList.contains('uob-summary')) {
            animateStep(node);
            setTimeout(function () { triggerCelebration(root); }, 500);
          }
        });
      });

      /* Re-bind button hovers for new nodes */
      bindBtns(root);

      /* Sync progress bar */
      updateProgressBar(root);
    });

    observer.observe(root, { childList: true, subtree: true });
  }

  /* ── Option click delegation ─────────────────────────────────────────────── */
  function attachOptionClick(root) {
    root.addEventListener('click', function (e) {
      var option = e.target.closest('.uob-option');
      if (option) animateSelect(option);
    });
  }

  /* ── Init ─────────────────────────────────────────────────────────────────── */
  function init() {
    var roots = document.querySelectorAll('.ux-onboarding-app');
    if (!roots.length) {
      /* Retry if DOM not ready */
      setTimeout(init, 200);
      return;
    }

    roots.forEach(function (root) {
      observe(root);
      attachButtonHover(root);
      attachOptionClick(root);

      /* Handle already-rendered intro (if engine ran before this script) */
      var intro = root.querySelector('.uob-intro');
      if (intro) animateIntro(root);

      var step = root.querySelector('.uob-step');
      if (step) animateStep(step);

      updateProgressBar(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
