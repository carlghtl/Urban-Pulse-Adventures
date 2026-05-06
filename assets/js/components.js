/**
 * UrbanPulse Adventures - Reusable Components
 * Injects shared HTML: loader, cookie banner, modal
 */
const Components = (function() {
  'use strict';

  function getCurrentPage() {
    const path = (location.pathname || '').split('/').pop() || 'index.html';
    return path === '' ? 'index.html' : path;
  }

  function isCurrent(href) {
    const current = getCurrentPage();
    const cleanHref = href.replace(/^([.\\/])*/, '');
    if (cleanHref === current) return true;
    if (current === '' && (cleanHref === 'index.html' || cleanHref === './')) return true;
    if (current === 'index.html' && (cleanHref === '' || cleanHref === './')) return true;
    return false;
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#039;');
  }

  // ===== Loader =====
  function renderLoader() {
    const loaderHTML = `
      <div id="site-loader" class="loader">
        <div class="loader-inner">
          <img src="assets/images/logo%201.png" class="loader-logo" alt="UrbanPulse logo">
          <div class="loader-ring" aria-hidden="true">
            <svg viewBox="0 0 100 100" role="img" aria-hidden="true">
              <circle class="person" cx="50" cy="22" r="6" />
              <circle class="person-sub" cx="76.63" cy="41.35" r="6" />
              <circle class="person" cx="66.46" cy="72.65" r="6" />
              <circle class="person-sub" cx="33.54" cy="72.65" r="6" />
              <circle class="person" cx="23.37" cy="41.35" r="6" />
              <circle cx="50" cy="50" r="3" fill="rgba(0,0,0,0.06)" />
            </svg>
          </div>
          <div class="loader-text">Welcome to Urban Pulse Adventures</div>
          <div class="loader-lines"><span></span><span></span><span></span></div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('afterbegin', loaderHTML);
  }

  // ===== Cookie Banner =====
  function renderCookieBanner() {
    const bannerHTML = `
      <div id="cookieConsent" class="cookie-banner">
        <p>We use cookies to enhance your experience. By continuing, you agree to our use of cookies.</p>
        <button class="btn btn-primary" id="cookieAcceptBtn">Accept</button>
      </div>`;
    document.body.insertAdjacentHTML('beforeend', bannerHTML);
  }

  // ===== Modal / Booking Form =====
  function renderModal() {
    if (document.getElementById('bookingModal')) return;

    const modalHTML = `
      <div id="bookingModal" class="modal-overlay" aria-hidden="true">
        <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="bookingTitle">
          <button class="modal-close" aria-label="Close booking modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div class="modal-decor modal-decor-1"></div>
          <div class="modal-decor modal-decor-2"></div>
          <div class="modal-decor modal-decor-3"></div>

          <div class="booking-card">
            <div class="booking-header">
              <div class="booking-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3 id="bookingTitle">Book Your Adventure</h3>
              <p class="booking-subtitle">Fill in your details and we'll get back to you within 24 hours to confirm your tour.</p>
            </div>

            <form id="bookingForm" class="booking-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="bookingName">Full Name</label>
                  <div class="input-wrapper">
                    <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <input type="text" id="bookingName" name="name" placeholder="John Doe" required>
                    <span class="input-status"></span>
                  </div>
                  <span class="error-message">Please enter your full name</span>
                </div>

                <div class="form-group">
                  <label for="bookingEmail">Email Address</label>
                  <div class="input-wrapper">
                    <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <input type="email" id="bookingEmail" name="email" placeholder="john@example.com" required>
                    <span class="input-status"></span>
                  </div>
                  <span class="error-message">Please enter a valid email address</span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="bookingPhone">Phone Number</label>
                  <div class="input-wrapper">
                    <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    <input type="tel" id="bookingPhone" name="phone" placeholder="+254 724 355 530">
                    <span class="input-status"></span>
                  </div>
                </div>

                <div class="form-group">
                  <label for="bookingTour">Select Tour</label>
                  <div class="input-wrapper select-wrapper">
                    <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                    </svg>
                    <select id="bookingTour" name="tour" required>
                      <option value="" disabled selected>Choose a tour...</option>
                      <option value="Kibera Street Vibes">Kibera Street Vibes</option>
                      <option value="Nairobi Nightlife">Nairobi Nightlife</option>
                      <option value="Lens & Legends">Lens & Legends</option>
                      <option value="Seasoned Tours">Seasoned Tours</option>
                      <option value="Wildlife Safari">Wildlife Safari</option>
                      <option value="Custom Tour">Custom Tour</option>
                    </select>
                    <svg class="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                    <span class="input-status"></span>
                  </div>
                  <span class="error-message">Please select a tour</span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="bookingDate">Preferred Date</label>
                  <div class="input-wrapper">
                    <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <input type="date" id="bookingDate" name="date" required>
                    <span class="input-status"></span>
                  </div>
                  <span class="error-message">Please select a date</span>
                </div>

                <div class="form-group">
                  <label for="bookingTime">Preferred Time</label>
                  <div class="input-wrapper">
                    <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <input type="time" id="bookingTime" name="time" required>
                    <span class="input-status"></span>
                  </div>
                  <span class="error-message">Please select a time</span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="bookingGuests">Number of Guests</label>
                  <div class="input-wrapper">
                    <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <input type="number" id="bookingGuests" name="guests" min="1" max="20" value="1" required>
                    <span class="input-status"></span>
                  </div>
                </div>

                <div class="form-group">
                  <label for="bookingReferral">How did you hear about us?</label>
                  <div class="input-wrapper select-wrapper">
                    <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    <select id="bookingReferral" name="referral">
                      <option value="" disabled selected>Select option...</option>
                      <option value="Google">Google Search</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Friend">Friend / Family</option>
                      <option value="Blog">Blog / Article</option>
                      <option value="Other">Other</option>
                    </select>
                    <svg class="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div class="form-group full-width">
                <label for="bookingMessage">Special Requests (Optional)</label>
                <div class="input-wrapper">
                  <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="top:1.15rem">
                    <line x1="17" y1="10" x2="3" y2="10"/>
                    <line x1="21" y1="6" x2="3" y2="6"/>
                    <line x1="21" y1="14" x2="3" y2="14"/>
                    <line x1="17" y1="18" x2="3" y2="18"/>
                  </svg>
                  <textarea id="bookingMessage" name="message" rows="3" placeholder="Any dietary requirements, accessibility needs, or questions..."></textarea>
                </div>
              </div>

              <div class="form-footer">
                <div class="form-consent">
                  <input type="checkbox" id="bookingConsent" name="consent" required>
                  <label for="bookingConsent">I agree to the <a href="./terms.html" target="_blank">Terms and Conditions</a> and <a href="./privacy.html" target="_blank">Privacy Policy</a></label>
                </div>
                <button type="submit" class="btn btn-primary btn-submit">
                  <span class="btn-text">Submit Booking</span>
                  <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                  <span class="btn-loader"></span>
                </button>
              </div>
            </form>

            <div id="bookingMsg" class="booking-message"></div>
          </div>
        </div>
      </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // ===== Public API =====
  return {
    renderLoader: renderLoader,
    renderCookieBanner: renderCookieBanner,
    renderModal: renderModal,
    getCurrentPage: getCurrentPage
  };
})();

