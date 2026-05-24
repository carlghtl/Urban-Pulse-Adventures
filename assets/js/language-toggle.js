/**
 * UrbanPulse Adventures - Language Toggle
 * Google Translate integration with custom cool UI
 */

const languageToggle = (() => {
  'use strict';

  const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' }
  ];

  function init() {
    // Create language toggle button
    const header = document.querySelector('.site-header');
    if (!header) return;

    const headerInner = header.querySelector('.header-inner');
    if (!headerInner) return;

    // Create button
    const langBtn = document.createElement('button');
    langBtn.className = 'language-toggle-btn';
    langBtn.setAttribute('aria-label', 'Change language');
    langBtn.setAttribute('title', 'Change language');
    langBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        <path d="M2 12h20"/>
      </svg>
    `;

    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'language-dropdown';
    dropdown.innerHTML = `
      <div class="language-dropdown-header">
        <span>Select Language</span>
        <button class="language-dropdown-close" aria-label="Close">✕</button>
      </div>
      <div class="language-dropdown-search">
        <input type="text" placeholder="Search language..." class="language-search-input" aria-label="Search languages">
      </div>
      <div class="language-list">
        ${LANGUAGES.map((lang, idx) => `
          <button class="language-item" data-lang="${lang.code}" ${idx === 0 ? 'aria-selected="true"' : ''}>
            <span class="language-flag">${lang.flag}</span>
            <span class="language-name">${lang.name}</span>
            <span class="language-code">${lang.code}</span>
          </button>
        `).join('')}
      </div>
    `;

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'language-toggle-wrapper';
    wrapper.appendChild(langBtn);
    wrapper.appendChild(dropdown);

    // Insert before theme toggle
    const themeToggle = headerInner.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.parentNode.insertBefore(wrapper, themeToggle);
    } else {
      headerInner.appendChild(wrapper);
    }

    // Event listeners
    langBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleDropdown();
    });

    const closeBtn = dropdown.querySelector('.language-dropdown-close');
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeDropdown();
    });

    const searchInput = dropdown.querySelector('.language-search-input');
    searchInput.addEventListener('input', filterLanguages);

    const langItems = dropdown.querySelectorAll('.language-item');
    langItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        selectLanguage(item.dataset.lang, item);
      });
    });

    // Close on document click
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        closeDropdown();
      }
    });

    // Load Google Translate
    loadGoogleTranslate();
  }

  function toggleDropdown() {
    const dropdown = document.querySelector('.language-dropdown');
    if (!dropdown) return;

    dropdown.classList.toggle('active');
    if (dropdown.classList.contains('active')) {
      dropdown.querySelector('.language-search-input').focus();
    }
  }

  function closeDropdown() {
    const dropdown = document.querySelector('.language-dropdown');
    if (dropdown) {
      dropdown.classList.remove('active');
    }
  }

  function filterLanguages(e) {
    const search = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.language-item');

    items.forEach(item => {
      const name = item.querySelector('.language-name').textContent.toLowerCase();
      const code = item.dataset.lang.toLowerCase();
      const matches = name.includes(search) || code.includes(search);
      item.style.display = matches ? '' : 'none';
    });
  }

  function selectLanguage(langCode, element) {
    // Update UI
    document.querySelectorAll('.language-item').forEach(item => {
      item.removeAttribute('aria-selected');
    });
    element.setAttribute('aria-selected', 'true');

    // Save preference
    localStorage.setItem('preferredLanguage', langCode);

    // Trigger Google Translate
    if (window.google && window.google.translate) {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event('change'));
      }
    }

    closeDropdown();

    // Add visual feedback
    element.style.animation = 'none';
    setTimeout(() => {
      element.style.animation = '';
    }, 10);
  }

  function loadGoogleTranslate() {
    // Add Google Translate script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';

    window.googleTranslateElementInit = function() {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: LANGUAGES.map(l => l.code).join(','),
            autoDisplay: false
          },
          'google-translate-element'
        );
      }
    };

    document.body.appendChild(script);

    // Create hidden div for Google Translate
    const googleTranslateDiv = document.createElement('div');
    googleTranslateDiv.id = 'google-translate-element';
    googleTranslateDiv.style.display = 'none';
    document.body.appendChild(googleTranslateDiv);

    // Restore previous language preference
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && savedLang !== 'en') {
      setTimeout(() => {
        const item = document.querySelector(`[data-lang="${savedLang}"]`);
        if (item) {
          selectLanguage(savedLang, item);
        }
      }, 2000);
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { init };
})();
