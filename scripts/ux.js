// Futuristic UI interactions: page transitions, nav toggle, button ripple
document.addEventListener('DOMContentLoaded', () => {
  // Page entrance animation
  document.body.classList.add('page-enter');
  requestAnimationFrame(() => {
    document.body.classList.add('page-enter-active');
  });
  setTimeout(() => {
    document.body.classList.remove('page-enter', 'page-enter-active');
  }, 600);

  // Loader: only show on the main homepage (root, index.html or plain-index.html).
  const loader = document.getElementById('site-loader');
  const path = (location.pathname || '').split('/').pop();
  const isHomepage = path === '' || path === 'index.html' || path === 'plain-index.html';
  if (loader) {
    if (!isHomepage) {
      // remove loader immediately on secondary pages
      document.body.classList.remove('site-preload');
      try { loader.remove(); } catch (e) { loader.classList.add('hidden'); }
    } else {
      loader.classList.remove('hidden');
      setTimeout(() => {
        // reveal the page content
        document.body.classList.remove('site-preload');
        // fade out loader
        loader.classList.add('hidden');
        setTimeout(() => { loader.remove(); }, 520);
      }, 3000);
    }
  } else {
    // No loader element - still need to remove site-preload for secondary pages
    document.body.classList.remove('site-preload');
  }

  // Nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.getElementById('mainNav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const open = mainNav.classList.toggle('open');
      navToggle.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Theme toggle with smooth transition
  const themeToggle = document.querySelector('.theme-toggle');
  function applyTheme(theme, animate = true){
    if(animate){
      document.body.style.transition = 'opacity 0.3s ease';
      document.body.style.opacity = '0.8';
      setTimeout(() => {
        if(theme === 'dark') document.documentElement.setAttribute('data-theme','dark');
        else document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('site-theme', theme);
        document.body.style.opacity = '1';
      }, 150);
    } else {
      if(theme === 'dark') document.documentElement.setAttribute('data-theme','dark');
      else document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('site-theme', theme);
    }
  }
  // Initialize theme from storage or system
  const saved = localStorage.getItem('site-theme');
  if(saved) applyTheme(saved, false);
  else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('dark', false);
  if(themeToggle){
    // Set initial icon
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeToggle.innerHTML = isDark ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>' : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    themeToggle.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      
      // Animate icon transition
      themeToggle.style.transform = 'rotate(180deg) scale(0.8)';
      setTimeout(() => {
        applyTheme(newTheme);
        themeToggle.innerHTML = newTheme === 'dark' 
          ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
          : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
        themeToggle.title = newTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
        themeToggle.style.transform = 'rotate(0) scale(1)';
      }, 150);
    });
  }

  // Button ripple effect
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(btn => {
    btn.addEventListener('pointerdown', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height) * 0.9;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  // Header scroll effect - translucent on scroll, increases with depth
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    let lastScroll = 0;
    const scrollThreshold = 10;
    const maxScroll = 500; // Point at which transparency reaches maximum
    
    function handleScroll() {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > scrollThreshold) {
        siteHeader.classList.add('scrolled');
        
        // Calculate dynamic opacity based on scroll depth
        // More scroll = more transparency (lower opacity)
        // Starts at 0.6 and can go down to 0.15 at max scroll
        const scrollProgress = Math.min(currentScroll / maxScroll, 1);
        const opacity = 0.6 - (scrollProgress * 0.45); // 0.6 -> 0.15
        
        siteHeader.style.setProperty('--header-opacity', opacity.toFixed(2));
      } else {
        siteHeader.classList.remove('scrolled');
        siteHeader.style.setProperty('--header-opacity', '');
      }
      
      lastScroll = currentScroll;
    }
    
    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();
  }

  // Link hover microinteraction for pointer devices
  document.querySelectorAll('a').forEach(a => {
    a.addEventListener('mousemove', (e) => {
      if (!a.classList.contains('link-fx')) return;
      const rect = a.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      a.style.setProperty('--hover-x', px);
    });
  });

  // Simple progressive page navigation animation for internal links
  document.querySelectorAll('a[href]').forEach(a => {
    try {
      const url = new URL(a.href);
      if (url.origin === location.origin) {
        a.addEventListener('click', (ev) => {
          const href = a.getAttribute('href');
          if (!href || href.startsWith('#')) return;
          ev.preventDefault();
          document.body.classList.add('page-exit-active');
          setTimeout(() => location.href = href, 300);
        });
      }
    } catch (e) { /* ignore invalid hrefs */ }
  });

  // Hero background slideshow (Ken Burns continues on each image)
  (function heroSlideshow(){
    const hero = document.querySelector('.hero');
    if(!hero) return;
    // Skip the homepage slideshow for smaller hero variants (e.g., dedicated pages)
    if (hero.classList.contains('hero-sm')) return;
    const images = [
      './files/download.jpg',
      './files/image%2030.jpg',
      './files/image%2026.jpg'
    ].map(u=>u.replace(/ /g, '%20'));
    let idx = 0;
    // set initial if not set
    if(!hero.style.backgroundImage) {
      hero.style.backgroundImage = `linear-gradient(180deg, rgba(139,94,52,0.24), rgba(194,123,57,0.12)), url('${images[0]}')`;
    }
    const interval = 8000;
    setInterval(()=>{
      idx = (idx + 1) % images.length;
      // fade out, swap, fade in
      hero.style.transition = 'opacity .7s ease';
      hero.style.opacity = '0';
      setTimeout(()=>{
        hero.style.backgroundImage = `linear-gradient(180deg, rgba(139,94,52,0.24), rgba(194,123,57,0.12)), url('${images[idx]}')`;
        // ensure kenburns pseudo-element uses new background-image (it's inherited)
        hero.style.opacity = '1';
      }, 720);
    }, interval);
  })();

  // Back-to-top button
  const backToTop = document.querySelector('.back-to-top');
  if(backToTop){
    window.addEventListener('scroll', () => {
      if(window.scrollY > 400){
        backToTop.classList.add('visible');
      }else{
        backToTop.classList.remove('visible');
      }
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({top:0, behavior:'smooth'});
    });
  }

  // Scroll-triggered fade-in animations
  const fadeElements = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
      }
    });
  }, {threshold:0.1, rootMargin:'0px 0px -50px 0px'});
  fadeElements.forEach(el => observer.observe(el));

  // Accordion functionality
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = item.querySelector('.accordion-content');
      const isOpen = item.classList.contains('open');
      // Close all others
      document.querySelectorAll('.accordion-item.open').forEach(openItem => {
        if(openItem !== item){
          openItem.classList.remove('open');
          openItem.querySelector('.accordion-content').style.maxHeight = '0';
          openItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
        }
      });
      // Toggle current
      item.classList.toggle('open', !isOpen);
      content.style.maxHeight = isOpen ? '0' : content.scrollHeight + 'px';
      header.setAttribute('aria-expanded', !isOpen);
    });
  });

  // Cookie consent
  const cookieBanner = document.getElementById('cookieConsent');
  if(cookieBanner && !localStorage.getItem('cookiesAccepted')){
    setTimeout(() => cookieBanner.classList.add('visible'), 2000);
  }
  window.acceptCookies = function(){
    localStorage.setItem('cookiesAccepted', 'true');
    cookieBanner.classList.remove('visible');
  };

  // Newsletter handler
  window.handleNewsletter = function(e){
    e.preventDefault();
    const input = e.target.querySelector('input');
    const email = input.value;
    alert('Thank you for subscribing! We\'ll send updates to ' + email);
    input.value = '';
    return false;
  };

  // Modal popup functionality
  // Dynamically create modal if it doesn't exist in the page
  let modalOverlay = document.getElementById('bookingModal');
  const bookBtns = document.querySelectorAll('.book-btn');
  
  // If modal doesn't exist, create it dynamically
  if (!modalOverlay) {
    const modalHTML = `
    <div id="bookingModal" class="modal-overlay" aria-hidden="true">
      <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="modal-decor modal-decor-1"></div>
        <div class="modal-decor modal-decor-2"></div>
        <div class="modal-decor modal-decor-3"></div>
        <button class="modal-close" aria-label="Close booking form">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="booking-card">
          <div class="booking-header">
            <div class="booking-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/><path d="M12 21.5v-3"/></svg>
            </div>
            <h3 id="modalTitle">Book Your Adventure</h3>
            <p class="booking-subtitle">Ready to explore Nairobi? Fill out the form below and we'll get back to you within 24 hours.</p>
          </div>
          <form id="bookingForm" class="booking-form" novalidate>
            <div class="form-row">
              <div class="form-group">
                <label for="bookingName">Full Name</label>
                <div class="input-wrapper">
                  <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input type="text" id="bookingName" name="name" placeholder="John Doe" required autocomplete="name">
                  <span class="input-status"></span>
                </div>
                <span class="error-message">Please enter your full name</span>
              </div>
              <div class="form-group">
                <label for="bookingEmail">Email Address</label>
                <div class="input-wrapper">
                  <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <input type="email" id="bookingEmail" name="email" placeholder="john@example.com" required autocomplete="email">
                  <span class="input-status"></span>
                </div>
                <span class="error-message">Please enter a valid email address</span>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="bookingTour">Select Tour</label>
                <div class="input-wrapper select-wrapper">
                  <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <select id="bookingTour" name="tour" required>
                    <option value="">Choose your adventure...</option>
                    <option value="kibera">Kibera Slum Tour</option>
                    <option value="wildlife">Nairobi Wildlife Safari</option>
                    <option value="nightlife">Nightlife Experience</option>
                    <option value="lens-and-legend">Lens & Legend Photo Tour</option>
                    <option value="seasoned-tours">Seasoned Tours</option>
                    <option value="packages">Custom Package</option>
                  </select>
                  <span class="input-status"></span>
                </div>
                <span class="error-message">Please select a tour</span>
              </div>
              <div class="form-group">
                <label for="bookingDate">Preferred Date</label>
                <div class="input-wrapper">
                  <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <input type="date" id="bookingDate" name="date" required>
                  <span class="input-status"></span>
                </div>
                <span class="error-message">Please select a date</span>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="bookingTime">Preferred Time</label>
                <div class="input-wrapper">
                  <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <input type="time" id="bookingTime" name="time" required>
                  <span class="input-status"></span>
                </div>
                <span class="error-message">Please select a time</span>
              </div>
              <div class="form-group">
                <label for="bookingGuests">Number of Guests</label>
                <div class="input-wrapper">
                  <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <input type="number" id="bookingGuests" name="guests" min="1" max="20" value="1" required>
                  <span class="input-status"></span>
                </div>
                <span class="error-message">Please enter number of guests</span>
              </div>
            </div>
            <div class="form-group full-width">
              <label for="bookingNotes">Special Requests (Optional)</label>
              <div class="input-wrapper">
                <svg class="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <textarea id="bookingNotes" name="notes" rows="3" placeholder="Any dietary requirements, accessibility needs, or special occasions?"></textarea>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-full">
              <span>Confirm Booking</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </form>
        </div>
      </div>
    </div>`;
    
    // Create a temporary container to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHTML;
    document.body.appendChild(tempDiv.firstElementChild);
    modalOverlay = document.getElementById('bookingModal');
  }
  
  function openModal(modalId){
    const modal = document.getElementById(modalId);
    if(modal){
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      // Focus first input
      setTimeout(() => {
        const firstInput = modal.querySelector('input, select, textarea');
        if(firstInput) firstInput.focus();
      }, 300);
    }
  }
  
  function closeModal(modalId){
    const modal = document.getElementById(modalId);
    if(modal){
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }
  
  // Open modal on book button click (including .book-btn and any element with data-modal)
  bookBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = btn.getAttribute('data-modal');
      openModal(modalId);
    });
  });
  
  // Also catch any buttons with data-modal attribute (not just .book-btn class)
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = btn.getAttribute('data-modal');
      openModal(modalId);
    });
  });
  
  // Catch all "Book Now" buttons that link to #booking sections
  // Convert them to open the modal instead of scrolling
  document.querySelectorAll('a[href="#booking"], a[href*="#booking"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('bookingModal');
    });
  });
  
  // Also catch buttons with "Book" text that don't have a proper handler
  document.querySelectorAll('.btn').forEach(btn => {
    const text = btn.textContent.trim().toLowerCase();
    if (text.includes('book') && !btn.hasAttribute('data-modal') && !btn.getAttribute('href')?.startsWith('http')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('bookingModal');
      });
    }
  });
  
  // Close modal on close button (works for both static and dynamically created modals)
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
  
  // Close modal on overlay click
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if(e.target === modalOverlay){
        closeModal('bookingModal');
      }
    });
  }
  
  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')){
      closeModal('bookingModal');
    }
  });
});
