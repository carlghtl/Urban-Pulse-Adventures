/**
 * UrbanPulse Adventures - Main JavaScript
 * Merged functionality from ux.js + static.js
 * Handles: theme, loader, nav, modal, forms, animations, scroll effects
 */
(function() {
  'use strict';

  // ===== Utility Functions =====
  function $(selector) { return document.querySelector(selector); }
  function $$(selector) { return document.querySelectorAll(selector); }

  // ===== Theme Toggle =====
  function initTheme() {
    const themeToggle = $('.theme-toggle');
    if (!themeToggle) return;

    function applyTheme(theme, animate) {
      if (animate) {
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '0.8';
        setTimeout(() => {
          setThemeAttr(theme);
          document.body.style.opacity = '1';
        }, 150);
      } else {
        setThemeAttr(theme);
      }
    }

    function setThemeAttr(theme) {
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      localStorage.setItem('site-theme', theme);
    }

    function getThemeIcon(isDark) {
      return isDark
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }

    // Initialize from storage or system preference
    const saved = localStorage.getItem('site-theme');
    const isDark = saved ? saved === 'dark' : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) setThemeAttr('dark');
    themeToggle.innerHTML = getThemeIcon(isDark);
    themeToggle.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';

    themeToggle.addEventListener('click', () => {
      const currentlyDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const newTheme = currentlyDark ? 'light' : 'dark';
      themeToggle.style.transform = 'rotate(180deg) scale(0.8)';
      setTimeout(() => {
        applyTheme(newTheme, true);
        themeToggle.innerHTML = getThemeIcon(newTheme === 'dark');
        themeToggle.title = newTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
        themeToggle.style.transform = 'rotate(0) scale(1)';
      }, 150);
    });
  }

  // ===== Loader =====
  function initLoader() {
    const loader = $('#site-loader');
    const path = (location.pathname || '').split('/').pop();
    const isHomepage = path === '' || path === 'index.html';

    if (!loader) {
      document.body.classList.remove('site-preload');
      return;
    }

    if (!isHomepage) {
      document.body.classList.remove('site-preload');
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 520);
    } else {
      loader.classList.remove('hidden');
      setTimeout(() => {
        document.body.classList.remove('site-preload');
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 520);
      }, 3000);
    }
  }

  // ===== Mobile Navigation =====
  function initNav() {
    const navToggle = $('.nav-toggle');
    const mainNav = $('#mainNav');
    if (!navToggle || !mainNav) return;

    navToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      mainNav.setAttribute('aria-hidden', open ? 'false' : 'true');
    });

    // Close nav when clicking a link
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (mainNav.classList.contains('open')) {
          mainNav.classList.remove('open');
          navToggle.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
          mainNav.setAttribute('aria-hidden', 'true');
        }
      });
    });
  }

  // ===== Header Scroll Effect =====
  function initHeaderScroll() {
    const siteHeader = $('.site-header');
    if (!siteHeader) return;

    let ticking = false;
    function handleScroll() {
      const currentScroll = window.pageYOffset;
      if (currentScroll > 10) {
        siteHeader.classList.add('scrolled');
        const progress = Math.min(currentScroll / 500, 1);
        const opacity = 0.6 - (progress * 0.45);
        siteHeader.style.setProperty('--header-opacity', opacity.toFixed(2));
      } else {
        siteHeader.classList.remove('scrolled');
        siteHeader.style.setProperty('--header-opacity', '');
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
      }
    }, { passive: true });
    handleScroll();
  }

  // ===== Back to Top =====
  function initBackToTop() {
    const backToTop = $('.back-to-top');
    if (!backToTop) return;

    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== Button Ripple Effect =====
  function initRipple() {
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('pointerdown', function(e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const size = Math.max(rect.width, rect.height) * 0.9;
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
      });
    });
  }

  // ===== Fade-in Animations =====
  function initFadeIn() {
    const fadeElements = document.querySelectorAll('.fade-in');
    if (!fadeElements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    fadeElements.forEach(el => observer.observe(el));
  }

  // ===== Card Reveal Animations =====
  function initCardReveal() {
    const cards = document.querySelectorAll('.card');
    if (!cards.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    cards.forEach(card => {
      card.classList.add('reveal');
      io.observe(card);
    });
  }

  // ===== Accordion =====
  function initAccordion() {
    document.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const item = header.closest('.accordion-item');
        const content = item.querySelector('.accordion-content');
        const isOpen = item.classList.contains('open');

        // Close all others
        document.querySelectorAll('.accordion-item.open').forEach(openItem => {
          if (openItem !== item) {
            openItem.classList.remove('open');
            const c = openItem.querySelector('.accordion-content');
            if (c) c.style.maxHeight = '0';
            const h = openItem.querySelector('.accordion-header');
            if (h) h.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current
        item.classList.toggle('open', !isOpen);
        if (content) {
          content.style.maxHeight = isOpen ? '0' : content.scrollHeight + 'px';
        }
        header.setAttribute('aria-expanded', !isOpen);
      });
    });
  }

  // ===== Cookie Banner =====
  function initCookieBanner() {
    const banner = $('#cookieConsent');
    if (!banner) return;

    if (!localStorage.getItem('cookiesAccepted')) {
      setTimeout(() => banner.classList.add('visible'), 2000);
    }

    const acceptBtn = $('#cookieAcceptBtn');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesAccepted', 'true');
        banner.classList.remove('visible');
      });
    }

    // Global function for inline onclick handlers
    window.acceptCookies = function() {
      localStorage.setItem('cookiesAccepted', 'true');
      if (banner) banner.classList.remove('visible');
    };
  }

  // ===== Modal / Booking Form =====
  function initModal() {
    let modalOverlay = $('#bookingModal');

    function openModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
          const firstInput = modal.querySelector('input, select, textarea');
          if (firstInput) firstInput.focus();
        }, 300);
      }
    }

    function closeModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }

    // Book buttons
    document.querySelectorAll('.book-btn, [data-modal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = btn.getAttribute('data-modal');
        if (modalId) openModal(modalId);
      });
    });

    // Close button
    document.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('.modal-close');
      if (closeBtn) {
        const modal = closeBtn.closest('.modal-overlay');
        if (modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    });

    // Overlay click
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal('bookingModal');
      });
    }

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModal = $('.modal-overlay.active');
        if (activeModal) {
          activeModal.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    });

    // Convert #booking links to modal
    document.querySelectorAll('a[href="#booking"], a[href*="#booking"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('bookingModal');
      });
    });
  }

  // ===== Booking Form Validation & Submission =====
  function initBookingForm() {
    const form = $('#bookingForm');
    const msg = $('#bookingMsg');
    if (!form) return;

    // Set minimum date to today
    const dateInput = $('#bookingDate');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }

    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        const group = input.closest('.form-group');
        if (group && group.classList.contains('error')) {
          validateField(input);
        }
      });
    });

    function validateField(field) {
      const group = field.closest('.form-group');
      if (!group) return true;

      let isValid = true;
      if (field.required && !field.value.trim()) {
        isValid = false;
      }
      if (field.type === 'email' && field.value) {
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
      }

      const status = group.querySelector('.input-status');
      if (isValid) {
        group.classList.remove('error');
        if (status) {
          status.className = 'input-status valid';
        }
      } else {
        group.classList.add('error');
        if (status) {
          status.className = 'input-status invalid';
        }
      }
      return isValid;
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      let isFormValid = true;
      inputs.forEach(input => {
        if (!validateField(input)) isFormValid = false;
      });

      const consent = $('#bookingConsent');
      if (consent && !consent.checked) {
        isFormValid = false;
        alert('Please agree to the terms and conditions');
        return;
      }

      if (!isFormValid) return;

      const submitBtn = form.querySelector('.btn-submit');
      if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        const fm = new FormData(form);
        const name = fm.get('name') || 'friend';
        const tour = fm.get('tour');
        const date = fm.get('date');
        const time = fm.get('time');

        if (msg) {
          msg.innerHTML = '<strong>Booking Received!</strong><br>Thanks ' + name + ' \u2014 your request for "' + tour + '" on ' + date + ' at ' + time + ' was received! We\'ll contact you within 24 hours.';
          msg.className = 'booking-message success';
        }

        form.reset();
        if (submitBtn) {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
        }

        inputs.forEach(input => {
          const group = input.closest('.form-group');
          if (group) {
            group.classList.remove('error');
            const status = group.querySelector('.input-status');
            if (status) status.className = 'input-status';
          }
        });

        if (msg) msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 1500);
    });
  }

  // ===== Newsletter Forms =====
  function initNewsletter() {
    // Main newsletter form
    const mainForm = document.querySelector('.newsletter-form:not(#footerNewsletter)');
    if (mainForm) {
      mainForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = mainForm.querySelector('input[type="email"]');
        if (input && input.value) {
          alert('Thank you for subscribing! We\'ll send updates to ' + input.value);
          input.value = '';
        }
      });
    }

    // Footer newsletter form
    const footerForm = $('#footerNewsletter');
    if (footerForm) {
      footerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = footerForm.querySelector('input[type="email"]');
        if (input && input.value) {
          alert('Thank you for subscribing! We\'ll send updates to ' + input.value);
          input.value = '';
        }
      });
    }
  }

  // ===== Hero Slideshow (image + video support) =====
  function initHeroSlideshow() {
    const slider = document.getElementById('heroSlider');
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll('.slide'));
    if (!slides.length) return;

    // create media elements lazily and dots
    const dotsWrap = document.querySelector('.slider-dots');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');

    // controls background image holder (blurred) - create if missing inside hero container
    const heroContainer = document.querySelector('.hero-slider');
    const controlsWrap = document.querySelector('.slider-controls');
    let controlsBgImg = null;
    if (heroContainer) {
      if (!heroContainer.querySelector('.controls-bg')) {
        const bg = document.createElement('div');
        bg.className = 'controls-bg controls-bg-full';
        const img = document.createElement('img');
        img.alt = '';
        bg.appendChild(img);
        heroContainer.insertBefore(bg, heroContainer.firstChild);
        controlsBgImg = img;
      } else {
        controlsBgImg = heroContainer.querySelector('.controls-bg img');
      }
    } else if (controlsWrap) {
      // fallback: keep old behavior
      if (!controlsWrap.querySelector('.controls-bg')) {
        const bg = document.createElement('div');
        bg.className = 'controls-bg';
        const img = document.createElement('img');
        img.alt = '';
        bg.appendChild(img);
        controlsWrap.insertBefore(bg, controlsWrap.firstChild);
        controlsBgImg = img;
      } else {
        controlsBgImg = controlsWrap.querySelector('.controls-bg img');
      }
    }

    slides.forEach((s, i) => {
      const type = s.getAttribute('data-type');
      const src = s.getAttribute('data-src');
      if (!src) return;

      if (type === 'video') {
        const v = document.createElement('video');
        v.src = src;
        v.autoplay = false;
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.preload = 'metadata';
        v.className = 'slide-video';
        v.setAttribute('aria-hidden', 'true');
        s.appendChild(v);
        // try to capture a thumbnail from the video when data is available
        v.addEventListener('loadeddata', () => {
          try {
            const w = v.videoWidth || 640;
            const h = v.videoHeight || 360;
            const c = document.createElement('canvas');
            c.width = w;
            c.height = h;
            const ctx = c.getContext('2d');
            ctx.drawImage(v, 0, 0, w, h);
            const data = c.toDataURL('image/jpeg');
            s._thumb = data;
          } catch (e) {
            // ignore capture errors (cross-origin or not ready)
          }
        });
      } else {
        const img = document.createElement('img');
        img.src = src;
        img.alt = '';
        img.loading = 'lazy';
        s.appendChild(img);
        // store image src as thumbnail for controls bg
        s._thumb = src;
      }

      // dots
      if (dotsWrap) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = i === 0 ? 'active' : '';
        b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        b.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(b);
      }
    });

    let current = 0;
    let timer = null;
    const interval = 6000;
    const track = slider.querySelector('.slider-track') || slider;

    function activate(index) {
      index = (index + slides.length) % slides.length;
      // translate track
      if (track) track.style.transform = 'translateX(' + (-index * 100) + '%)';
      // update dots
      const dots = document.querySelectorAll('.slider-dots button');
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
      // videos: play only the active one
      slides.forEach((s, i) => {
        s.setAttribute('aria-hidden', i === index ? 'false' : 'true');
        const v = s.querySelector('video');
        if (v) {
          try {
            if (i === index) v.play().catch(() => {});
            else { v.pause(); v.currentTime = 0; }
          } catch (e) {}
        }
      });
      current = index;

      // update controls background to match active slide (use thumbnail if available)
      try {
        const active = slides[index];
        const thumb = active && (active._thumb || active.getAttribute('data-src'));
        if (controlsBgImg) {
          if (thumb) controlsBgImg.src = thumb;
          else controlsBgImg.removeAttribute('src');
        }
      } catch (e) {}
    }

    function goTo(index) {
      activate(index);
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); next(); });
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); prev(); });

    // start autoplay (no pause-on-hover to avoid interference)
    activate(0);
    timer = setInterval(next, interval);
  }

  // ===== Cinematic Hero (new) =====
  function initCinematicHero() {
    const container = document.getElementById('cinematicSlides');
    if (!container) return;

    const slideEls = Array.from(container.querySelectorAll('.cinematic-slide'));
    if (!slideEls.length) return;

    // build media nodes and dots
    const dotsWrap = document.querySelector('.cinematic-dots');
    const prevBtn = document.querySelector('.cinematic-prev');
    const nextBtn = document.querySelector('.cinematic-next');

    slideEls.forEach((s, i) => {
      const type = s.getAttribute('data-type');
      const src = s.getAttribute('data-src');
      if (!src) return;

      if (type === 'video') {
        const v = document.createElement('video');
        v.src = src;
        v.autoplay = false;
        v.muted = true;
        v.loop = true;
        v.playsInline = true;
        v.preload = 'metadata';
        v.className = 'cinematic-media';
        v.setAttribute('aria-hidden', 'true');
        s.appendChild(v);
      } else {
        const img = document.createElement('img');
        img.src = src;
        img.alt = '';
        img.loading = 'lazy';
        img.className = 'cinematic-media';
        s.appendChild(img);
      }

      if (dotsWrap) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = i === 0 ? 'active' : '';
        b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        b.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(b);
      }
    });

    let current = 0;
    const interval = 7000;
    let timer = null;
    const total = slideEls.length;

    function setActive(index) {
      index = (index + total) % total;
      const prev = current;
      if (prev === index) return;

      const prevEl = slideEls[prev];
      const nextEl = slideEls[index];

      // prepare classes for smooth fade + slight scale
      nextEl.classList.add('enter');
      requestAnimationFrame(() => {
        // remove active from previous
        if (prevEl) prevEl.classList.remove('active');
        // activate next
        nextEl.classList.add('active');
        // remove enter after transition
        setTimeout(() => nextEl.classList.remove('enter'), 900);
      });

      // update dots
      const dots = document.querySelectorAll('.cinematic-dots button');
      dots.forEach((d, i) => d.classList.toggle('active', i === index));

      // video handling
      slideEls.forEach((s, i) => {
        const v = s.querySelector('video');
        if (v) {
          try {
            if (i === index) v.play().catch(()=>{});
            else { v.pause(); v.currentTime = 0; }
          } catch (e) {}
        }
      });

      current = index;
    }

    function goTo(i) { setActive(i); resetTimer(); }
    function next() { setActive(current + 1); }
    function prev() { setActive(current - 1); }

    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); next(); });
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); prev(); });

    function resetTimer() {
      if (timer) clearInterval(timer);
      timer = setInterval(() => { setActive(current + 1); }, interval);
    }

    // init
    // ensure only the first is active
    slideEls.forEach((s,i)=>{ s.classList.toggle('active', i===0); s.setAttribute('aria-hidden', i===0 ? 'false' : 'true'); });
    // play video if first is video
    const firstVideo = slideEls[0].querySelector('video'); if (firstVideo) firstVideo.play().catch(()=>{});
    resetTimer();

    // pause autoplay when page hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { if (timer) clearInterval(timer); }
      else resetTimer();
    });
  }

  // ===== Page Entrance Animation =====
  function initPageEntrance() {
    document.body.classList.add('page-enter');
    requestAnimationFrame(() => {
      document.body.classList.add('page-enter-active');
    });
    setTimeout(() => {
      document.body.classList.remove('page-enter', 'page-enter-active');
    }, 600);
  }

  // ===== Year Update =====
  function initYear() {
    const year = new Date().getFullYear();
    const y = $('#year');
    const y2 = $('#year2');
    if (y) y.textContent = year;
    if (y2) y2.textContent = year;
  }

  // ===== Card Tilt Effect =====
  function initCardTilt() {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const rx = y * 6;
        const ry = x * -6;
        card.style.transform = 'translateY(-6px) scale(1.01) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ===== Card Backgrounds & Video (data-bg / data-video) =====
  function initCardBackgrounds() {
    document.querySelectorAll('[data-bg],[data-video]').forEach(el => {
      // If a data-video attribute is present, create a muted autoplay looped video
      if (el.hasAttribute('data-video')) {
        const v = el.getAttribute('data-video');
        if (!v) return;
        // avoid duplicating video if already initialized
        if (!el.querySelector('video.card-video')) {
          const video = document.createElement('video');
          video.className = 'card-video';
          video.autoplay = true;
          video.muted = true;
          video.loop = true;
          video.playsInline = true;
          video.setAttribute('aria-hidden', 'true');
          // set source
          video.src = v;
          video.preload = 'auto';
          el.appendChild(video);
          // ensure no background image
          el.style.backgroundImage = '';
        }
        return;
      }

      // fallback: data-bg (image)
      if (el.hasAttribute('data-bg')) {
        const src = el.getAttribute('data-bg');
        if (!src) return;
        el.style.backgroundImage = "url('" + src + "')";
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
      }
    });
  }

  // ===== Gallery Lightbox (images + video) =====
  function initGallery(){
    const gallery = document.getElementById('siteGallery');
    if(!gallery) return;

    let lb = document.getElementById('mediaLightbox');
    if(!lb){
      lb = document.createElement('div');
      lb.id = 'mediaLightbox';
      lb.innerHTML = '<div class="lb-backdrop"></div><div class="lb-content" role="dialog" aria-modal="true"></div><button class="lb-close" aria-label="Close">✕</button>';
      document.body.appendChild(lb);
    }
    const content = lb.querySelector('.lb-content');

    function openLightbox(href, type, poster){
      content.innerHTML = '';
      if(type === 'image'){
        const img = document.createElement('img'); img.src = href; img.alt = ''; img.decoding = 'async'; img.loading = 'eager'; img.style.objectFit = 'contain'; content.appendChild(img);
      } else {
        const v = document.createElement('video'); v.src = href; v.controls = true; v.autoplay = true; v.playsInline = true; v.preload = 'metadata';
        if(poster) v.poster = poster;
        v.style.objectFit = 'contain';
        content.appendChild(v);
        // try to play when ready
        v.addEventListener('loadedmetadata', () => { try{ v.play().catch(()=>{}); } catch(e){} });
      }
      lb.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox(){
      lb.classList.remove('show');
      document.body.style.overflow = '';
      const v = content.querySelector('video'); if(v){ try{ v.pause(); v.currentTime = 0;}catch(e){} }
      content.innerHTML = '';
    }

    gallery.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a.media-link');
      if(!a) return;
      e.preventDefault();
      const type = a.dataset.mediaType || 'image';
      const poster = a.dataset.poster || null;
      openLightbox(a.href, type, poster);
    });

    const closeBtn = lb.querySelector('.lb-close');
    const backdrop = lb.querySelector('.lb-backdrop');
    if(closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if(backdrop) backdrop.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => { if(e.key === 'Escape' && lb.classList.contains('show')) closeLightbox(); });
  }

  // ===== Coming Soon Toast =====
  function initComingSoon() {
    // Create toast element if not exists
    let toast = document.getElementById('comingSoonToast');
    let backdrop;
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'comingSoonToast';
      toast.innerHTML = `
        <div class="toast-content">
          <div class="toast-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div class="toast-text">
            <strong>Careers</strong>
            <span>Coming Soon — We're building something amazing. Stay tuned for opportunities to join the UrbanPulse team!</span>
          </div>
          <button class="toast-close" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="toast-progress"></div>
      `;
      document.body.appendChild(toast);
      // create backdrop for modal effect
      backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      backdrop.style.display = 'none';
      document.body.appendChild(backdrop);

      toast.querySelector('.toast-close').addEventListener('click', hideToast);
    }
    function showToast() {
      toast.classList.add('show');
      // show backdrop if available
      const bd = document.querySelector('.modal-backdrop');
      if (bd) bd.style.display = 'block';
      // set focus to close for accessibility
      const closeBtn = toast.querySelector('.toast-close');
      if (closeBtn) closeBtn.focus();
    }
    function hideToast() {
      toast.classList.remove('show');
      const bd = document.querySelector('.modal-backdrop');
      if (bd) bd.style.display = 'none';
    }

    // Attach to all coming-soon links
    document.querySelectorAll('a[href="#careers"], .coming-soon-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        showToast();
      });
    });
  }

  // Delegated click handler as a fallback for pages where scripts load differently
  document.addEventListener('click', function (e) {
    const link = e.target.closest && e.target.closest('a[href="#careers"], .coming-soon-link');
    if (link) {
      e.preventDefault();
      // ensure toast exists and show it
      try { initComingSoon(); } catch (err) { /* ignore if already initialized */ }
      const toast = document.getElementById('comingSoonToast');
      if (toast) {
        toast.classList.add('show');
        const bd = document.querySelector('.modal-backdrop');
        if (bd) bd.style.display = 'block';
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) closeBtn.focus();
      }
    }
  });

  // ===== Initialize Everything =====
  function init() {
    initTheme();
    initLoader();
    initNav();
    initHeaderScroll();
    initBackToTop();
    initRipple();
    initFadeIn();
    initCardReveal();
    initAccordion();
    initCookieBanner();
    initModal();
    initBookingForm();
    initNewsletter();
    initCinematicHero();
    initPageEntrance();
    initYear();
    initCardTilt();
    initComingSoon();
    initCardBackgrounds();
    initGallery();
      // Ensure CSS variable for header height is set so hero can size correctly below the nav.
      (function setSiteHeaderHeightVar(){
        function updateHeaderHeight(){
          var header = document.querySelector('.site-header');
          var h = 0;
          if(header) h = header.getBoundingClientRect().height || header.offsetHeight || 0;
          document.documentElement.style.setProperty('--site-header-height', h + 'px');
        }
        window.addEventListener('resize', updateHeaderHeight);
        document.addEventListener('DOMContentLoaded', updateHeaderHeight);
        // also run once now in case script loads after DOM
        updateHeaderHeight();
      })();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
