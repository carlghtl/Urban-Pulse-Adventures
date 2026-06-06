/**
 * UrbanPulse Adventures - Feature Enhancements
 * Implements: ratings, calendar, customizer, weather, WhatsApp, maps, price slider
 */

const enhancements = (() => {
  'use strict';

  // ===== RATINGS & REVIEWS =====
  function initReviewDisplay() {
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
      const cardTitle = card.querySelector('h4');
      if (!cardTitle) return;

      // Extract tour name from card
      const tourNameText = cardTitle.textContent.trim().split('\n')[0].trim();
      const tour = tourData.getTourByName(tourNameText);
      if (!tour || !tour.reviewStats) return;

      // Create and insert rating display
      const ratingDiv = document.createElement('div');
      ratingDiv.className = 'star-rating';
      ratingDiv.innerHTML = `
        <span class="stars">${tourData.getStarRating(tour.reviewStats.averageRating)}</span>
        <span class="rating">${tour.reviewStats.averageRating}</span>
        <span class="count">(${tour.reviewStats.totalReviews})</span>
      `;

      // Find card body and insert after title
      const cardBody = card.querySelector('.card-body');
      if (cardBody) {
        const descElement = cardBody.querySelector('.card-desc') || cardBody.querySelector('p');
        if (descElement) {
          descElement.parentNode.insertBefore(ratingDiv, descElement);
        }
      }

      // Add "Read Reviews" button
      const cardActions = card.querySelector('.card-actions');
      if (cardActions) {
        const reviewBtn = document.createElement('a');
        reviewBtn.href = '#';
        reviewBtn.className = 'btn btn-ghost read-reviews-btn';
        reviewBtn.textContent = 'Read Reviews';
        reviewBtn.addEventListener('click', (e) => {
          e.preventDefault();
          openReviewModal(tour);
        });
        cardActions.appendChild(reviewBtn);
      }
    });
  }

  function openReviewModal(tour) {
    // Create modal if doesn't exist
    let modal = document.getElementById('reviewModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'reviewModal';
      modal.className = 'review-modal';
      modal.innerHTML = `
        <div class="review-modal-content">
          <button class="review-modal-close">✕</button>
          <div class="review-stats">
            <div class="review-avg-rating">${tour.reviewStats.averageRating}</div>
            <div class="review-avg-stars">${tourData.getStarRating(tour.reviewStats.averageRating)}</div>
            <div class="review-count">Based on ${tour.reviewStats.totalReviews} verified reviews</div>
          </div>
          <div class="reviews-grid" id="reviewsGrid"></div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('.review-modal-close').addEventListener('click', () => {
        modal.classList.remove('active');
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }

    // Populate reviews
    const reviewsGrid = modal.querySelector('#reviewsGrid');
    reviewsGrid.innerHTML = '';
    tour.reviews.slice(0, 8).forEach(review => {
      const reviewCard = document.createElement('div');
      reviewCard.className = 'review-card';
      reviewCard.innerHTML = `
        <div class="review-header">
          <div>
            <div class="review-author">${review.author}</div>
            <div class="review-location">${review.location}</div>
          </div>
          <div class="review-date">${new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
        </div>
        <div class="review-stars">${tourData.getStarRating(review.rating)}</div>
        <div class="review-text">"${review.text}"</div>
      `;
      reviewsGrid.appendChild(reviewCard);
    });

    modal.classList.add('active');
  }

  // ===== PRICE RANGE SLIDER =====
  function initPriceSlider() {
    const packagesPage = document.querySelector('.packages-hero');
    if (!packagesPage) return;

    const containerSelector = '.container.tours, .container.category-section, main > .container';
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Get price range from tours
    const tours = tourData.getAllTours();
    const prices = tours.map(t => t.basePrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const roundedMin = Math.floor(minPrice / 1000) * 1000;
    const roundedMax = Math.ceil(maxPrice / 1000) * 1000;

    // Create filter section
    const filterSection = document.createElement('div');
    filterSection.className = 'price-filter-section';
    filterSection.innerHTML = `
      <h3>Filter by Price Range</h3>
      <div class="price-slider-container">
        <div class="slider-inputs">
          <div class="slider-input-group">
            <label>Min Price (KES)</label>
            <input type="range" id="minPrice" min="${roundedMin}" max="${roundedMax}" value="${roundedMin}" step="500">
          </div>
          <div class="slider-input-group">
            <label>Max Price (KES)</label>
            <input type="range" id="maxPrice" min="${roundedMin}" max="${roundedMax}" value="${roundedMax}" step="500">
          </div>
        </div>
        <div class="slider-display">
          <span>KES <strong id="minDisplay">${roundedMin.toLocaleString()}</strong> — KES <strong id="maxDisplay">${roundedMax.toLocaleString()}</strong></span>
          <button class="slider-reset-btn btn btn-ghost">Reset Filter</button>
        </div>
        <div class="tours-count"><strong id="toursCount">6</strong> of 6 tours shown</div>
      </div>
    `;

    container.insertBefore(filterSection, container.firstChild);

    const minInput = filterSection.querySelector('#minPrice');
    const maxInput = filterSection.querySelector('#maxPrice');
    const resetBtn = filterSection.querySelector('.slider-reset-btn');
    const minDisplay = filterSection.querySelector('#minDisplay');
    const maxDisplay = filterSection.querySelector('#maxDisplay');
    const toursCount = filterSection.querySelector('#toursCount');

    function updateFilter() {
      const minVal = parseInt(minInput.value);
      const maxVal = parseInt(maxInput.value);

      // Swap if needed
      if (minVal > maxVal) {
        [minInput.value, maxInput.value] = [maxInput.value, minInput.value];
        return;
      }

      minDisplay.textContent = minVal.toLocaleString();
      maxDisplay.textContent = maxVal.toLocaleString();

      // Filter cards
      const allCards = container.querySelectorAll('.card');
      let visibleCount = 0;

      allCards.forEach(card => {
        // Try to find price in card
        const priceText = card.querySelector('.package-price')?.textContent || '';
        const priceMatch = priceText.match(/[\d,]+/);
        const price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0;

        const isVisible = price >= minVal && price <= maxVal;
        card.style.opacity = isVisible ? '1' : '0.3';
        card.style.pointerEvents = isVisible ? 'auto' : 'none';
        if (isVisible) visibleCount++;
      });

      toursCount.textContent = visibleCount;
    }

    minInput.addEventListener('input', updateFilter);
    maxInput.addEventListener('input', updateFilter);
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      minInput.value = roundedMin;
      maxInput.value = roundedMax;
      updateFilter();
    });
  }

  // ===== WHATSAPP FLOATING BUTTON =====
  function initWhatsAppButton() {
    const contactData = tourData.getTour('kibera')?.contact || { whatsapp: 'https://wa.link/743o72', telegram: '@urbanpulseadventures', phone: '+254712866733', email: 'urbanpulseadventures254.org@gmail.com', instagram: 'https://www.instagram.com/upadventures254' };

    // Create floating button
    const button = document.createElement('button');
    button.className = 'whatsapp-floating-btn';
    button.setAttribute('aria-label', 'Chat to book');
    button.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.929 1.316c-.56.298-1.091.715-1.566 1.203-4.413 4.413-4.413 11.589 0 16.002 4.413 4.413 11.589 4.413 16.002 0 1.429-1.429 2.546-3.14 3.296-5.01.173-.465.34-1.024.493-1.596.36-1.39.26-2.933-.348-4.238a9.935 9.935 0 00-1.547-2.566c.025.02.051.04.076.061 4.413 4.414 4.413 11.59 0 16.003-4.413 4.413-11.589 4.413-16.002 0C2.347 21.432 2.347 14.256 6.76 9.843z"/>
      </svg>
      <div class="whatsapp-tooltip">Chat to Book</div>
      <div class="whatsapp-popover">
        <a href="${generateWhatsAppLink(contactData.whatsapp, 'UrbanPulse Adventures')}" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.929 1.316c-.56.298-1.091.715-1.566 1.203-4.413 4.413-4.413 11.589 0 16.002 4.413 4.413 11.589 4.413 16.002 0 1.429-1.429 2.546-3.14 3.296-5.01.173-.465.34-1.024.493-1.596.36-1.39.26-2.933-.348-4.238a9.935 9.935 0 00-1.547-2.566c.025.02.051.04.076.061 4.413 4.414 4.413 11.59 0 16.003-4.413 4.413-11.589 4.413-16.002 0C2.347 21.432 2.347 14.256 6.76 9.843z"/></svg>
          WhatsApp
        </a>
        <a href="https://t.me/${contactData.telegram.replace('@', '')}" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>
          Telegram
        </a>
      </div>
    `;

    document.body.appendChild(button);

    button.addEventListener('click', (e) => {
      e.preventDefault();
      button.classList.toggle('active');
    });

    // Close on document click
    document.addEventListener('click', (e) => {
      if (!button.contains(e.target) && button.classList.contains('active')) {
        button.classList.remove('active');
      }
    });
  }

  function generateWhatsAppLink(phoneOrUrl, message) {
    if (!phoneOrUrl) return '#';
    // If a full URL (wa.link / wa.me or other) is provided, use it directly
    if (/^https?:\/\//i.test(phoneOrUrl)) return phoneOrUrl;
    const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : '';
    const digits = phoneOrUrl.replace(/\D/g, '');
    return `https://wa.me/${digits}${encodedMessage}`;
  }

  // ===== AVAILABILITY CALENDAR =====
  function initAvailabilityCalendar() {
    const bookingForm = document.getElementById('bookingForm');
    if (!bookingForm) return;

    const tourSelect = bookingForm.querySelector('#bookingTour') || bookingForm.querySelector('select[name="tour"]');
    if (!tourSelect) return;

    // Create calendar widget
    const calendarWidget = document.createElement('div');
    calendarWidget.className = 'calendar-widget';
    calendarWidget.id = 'tourCalendar';
    calendarWidget.style.display = 'none';
    calendarWidget.innerHTML = `
      <div class="calendar-header">
        <button class="calendar-nav" id="calendarPrev">← Prev</button>
        <span class="calendar-month" id="calendarMonth">May 2026</span>
        <button class="calendar-nav" id="calendarNext">Next →</button>
      </div>
      <div class="calendar-grid" id="calendarGrid">
        <div class="calendar-day-label">Sun</div>
        <div class="calendar-day-label">Mon</div>
        <div class="calendar-day-label">Tue</div>
        <div class="calendar-day-label">Wed</div>
        <div class="calendar-day-label">Thu</div>
        <div class="calendar-day-label">Fri</div>
        <div class="calendar-day-label">Sat</div>
      </div>
      <div class="guide-badge" id="guideBadge" style="display:none;"></div>
    `;

    // Insert after tour select
    tourSelect.parentNode.insertBefore(calendarWidget, tourSelect.nextSibling);

    let currentMonth = new Date(2026, 4); // May 2026
    let selectedTourId = null;

    function renderCalendar() {
      const grid = document.getElementById('calendarGrid');
      const dayLabels = grid.querySelectorAll('.calendar-day-label');
      dayLabels.forEach(el => el.style.display = '');

      // Remove old days
      grid.querySelectorAll('.calendar-day').forEach(el => el.remove());

      const monthText = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      document.getElementById('calendarMonth').textContent = monthText;

      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
      const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

      // Empty cells
      for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        grid.appendChild(emptyDay);
      }

      // Days
      const tour = tourData.getTour(selectedTourId);
      const monthKey = currentMonth.toISOString().slice(0, 7);

      for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('button');
        dayEl.className = 'calendar-day';
        dayEl.type = 'button';
        dayEl.textContent = day;

        const dayAvailable = tour?.availability?.[monthKey]?.[String(day).padStart(2, '0')];

        if (dayAvailable && dayAvailable.slots > 0) {
          dayEl.classList.add('available');
          dayEl.addEventListener('click', (e) => {
            e.preventDefault();
            selectDate(day, monthKey, dayAvailable);
          });
        } else {
          dayEl.classList.add('unavailable');
        }

        grid.appendChild(dayEl);
      }
    }

    function selectDate(day, monthKey, availability) {
      const dateStr = `${currentMonth.getFullYear()}-${monthKey.split('-')[1]}-${String(day).padStart(2, '0')}`;
      const dateInput = bookingForm.querySelector('#bookingDate') || bookingForm.querySelector('input[type="date"][name="date"]');
      if (dateInput) {
        dateInput.value = dateStr;
        // Trigger change event for weather widget
        dateInput.dispatchEvent(new Event('change'));
      }

      // Update guide badge
      const badge = document.getElementById('guideBadge');
      badge.innerHTML = `<strong>Guide:</strong> ${availability.guide} | <strong>Slots Available:</strong> ${availability.slots}/10`;
      badge.style.display = 'block';
    }

    tourSelect.addEventListener('change', (e) => {
      selectedTourId = e.target.value;
      if (selectedTourId && selectedTourId !== 'custom') {
        calendarWidget.style.display = 'block';
        renderCalendar();
      } else {
        calendarWidget.style.display = 'none';
      }
    });

    document.getElementById('calendarPrev').addEventListener('click', (e) => {
      e.preventDefault();
      currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
      renderCalendar();
    });

    document.getElementById('calendarNext').addEventListener('click', (e) => {
      e.preventDefault();
      currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
      renderCalendar();
    });
  }

  // ===== TOUR CUSTOMIZER =====
  function initCustomizer() {
    const bookingForm = document.getElementById('bookingForm');
    if (!bookingForm) return;

    // Create customizer modal
    const modal = document.createElement('div');
    modal.id = 'customizeModal';
    modal.className = 'customize-modal';
    document.body.appendChild(modal);

    // Add "Customize Tour" buttons to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      const cardActions = card.querySelector('.card-actions');
      if (cardActions) {
        const customBtn = document.createElement('a');
        customBtn.href = '#';
        customBtn.className = 'btn btn-ghost';
        customBtn.textContent = 'Customize';
        customBtn.style.fontSize = '0.9rem';
        customBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const tourTitle = card.querySelector('h4')?.textContent?.trim();
          const tour = tourTitle ? tourData.getTourByName(tourTitle.split('\n')[0]) : null;
          if (tour) openCustomizerModal(tour);
        });
        cardActions.appendChild(customBtn);
      }
    });

    function openCustomizerModal(tour) {
      const basePrice = tour.basePrice;
      let customState = {
        durationMultiplier: 1.0,
        selectedActivities: [],
        groupSize: 2
      };

      modal.innerHTML = `
        <div class="customize-modal-content">
          <button class="customize-modal-close" type="button">✕</button>
          <h3 style="margin-top: 0; color: var(--accent);">${tour.name}</h3>

          <form class="customize-form">
            <div class="customize-section">
              <h4>Select Activities</h4>
              ${(tour.customization.activities || []).map(activity => `
                <label class="activity-checkbox">
                  <input type="checkbox" value="${activity.id}" data-price="${activity.price}">
                  <span class="activity-label">
                    <span>${activity.name}</span>
                    ${activity.price > 0 ? `<span class="activity-price">+KES ${activity.price}</span>` : ''}
                  </span>
                </label>
              `).join('')}
            </div>

            <div class="customize-section">
              <h4>Select Duration</h4>
              <select class="customize-select" id="durationSelect">
                ${(tour.customization.durations || []).map(d => `
                  <option value="${d.multiplier}">${d.label}</option>
                `).join('')}
              </select>
              <div class="duration-display">
                <span id="durationDisplay">3 hours (default)</span>
              </div>
            </div>

            <div class="customize-section">
              <h4>Group Size</h4>
              <input type="range" min="1" max="20" value="2" class="customize-range" id="groupSizeRange">
              <div class="group-display">
                <span>Number of People: <strong id="groupDisplay">2</strong></span>
              </div>
            </div>

            <div class="customize-price-box">
              <div class="customize-price-label">Total Price</div>
              <div class="customize-price-amount" id="customizePrice">${tourData.formatPrice(basePrice)}</div>
            </div>

            <div class="customize-actions">
              <button type="submit" class="btn btn-primary">Book Custom Tour</button>
              <button type="button" class="btn btn-ghost" onclick="this.closest('.customize-modal').classList.remove('active')">Cancel</button>
            </div>
          </form>
        </div>
      `;

      const form = modal.querySelector('form');
      const activities = modal.querySelectorAll('input[type="checkbox"]');
      const durationSelect = modal.querySelector('#durationSelect');
      const groupSizeRange = modal.querySelector('#groupSizeRange');
      const closeBtn = modal.querySelector('.customize-modal-close');

      function updatePrice() {
        customState.selectedActivities = Array.from(activities)
          .filter(a => a.checked)
          .map(a => a.value);
        customState.groupSize = parseInt(groupSizeRange.value);

        const totalPrice = tourData.calculateCustomPrice(tour.id, customState);
        document.getElementById('customizePrice').textContent = tourData.formatPrice(totalPrice);
      }

      durationSelect.addEventListener('change', (e) => {
        customState.durationMultiplier = parseFloat(e.target.value);
        const selected = tour.customization.durations.find(d => d.multiplier.toString() === e.target.value);
        document.getElementById('durationDisplay').textContent = selected.label;
        updatePrice();
      });

      activities.forEach(activity => {
        activity.addEventListener('change', updatePrice);
      });

      groupSizeRange.addEventListener('input', (e) => {
        document.getElementById('groupDisplay').textContent = e.target.value;
        updatePrice();
      });

      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.remove('active');
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Fill booking form with tour data
        const tourSelect = bookingForm.querySelector('#bookingTour') || bookingForm.querySelector('select[name="tour"]');
        if (tourSelect) tourSelect.value = tour.id;
        modal.classList.remove('active');
        bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      modal.classList.add('active');
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  // ===== WEATHER WIDGET =====
  function initWeatherWidget() {
    const bookingForm = document.getElementById('bookingForm');
    if (!bookingForm) return;

    const dateInput = bookingForm.querySelector('#bookingDate') || bookingForm.querySelector('input[type="date"]');
    if (!dateInput) return;

    const weatherContainer = document.createElement('div');
    weatherContainer.id = 'weatherWidget';
    dateInput.parentNode.insertBefore(weatherContainer, dateInput.nextSibling);

    async function fetchWeather(dateStr) {
      try {
        const [year, month, day] = dateStr.split('-');
        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=-1.2864&longitude=36.8172&start_date=${dateStr}&end_date=${dateStr}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&temperature_unit=celsius&timezone=Africa/Nairobi`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather fetch failed');

        const data = await response.json();
        if (!data.daily || data.daily.time.length === 0) {
          weatherContainer.innerHTML = '<div class="weather-widget"><div class="weather-loading">No forecast data available</div></div>';
          return;
        }

        const temp = Math.round((data.daily.temperature_2m_max[0] + data.daily.temperature_2m_min[0]) / 2);
        const rain = data.daily.precipitation_sum[0] || 0;
        const code = data.daily.weather_code[0];
        const condition = getWeatherCondition(code);
        const icon = getWeatherIcon(code);

        const dateObj = new Date(dateStr);
        const dateDisplay = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        weatherContainer.innerHTML = `
          <div class="weather-widget">
            <div class="weather-icon">${icon}</div>
            <div class="weather-info">
              <div class="weather-date">${dateDisplay} in Nairobi</div>
              <div class="weather-condition">${condition}</div>
              <div class="weather-details">
                <span class="weather-temp"><strong>${temp}°C</strong></span>
                <span class="weather-rain"><strong>${rain.toFixed(1)}mm</strong> rain</span>
              </div>
            </div>
          </div>
        `;
      } catch (error) {
        console.warn('Weather fetch error:', error);
        weatherContainer.innerHTML = '<div class="weather-widget"><div class="weather-loading">Weather unavailable</div></div>';
      }
    }

    function getWeatherCondition(code) {
      const conditions = {
        0: 'Clear Sky',
        1: 'Mostly Clear',
        2: 'Partly Cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Foggy',
        51: 'Light Drizzle',
        53: 'Moderate Drizzle',
        55: 'Dense Drizzle',
        61: 'Slight Rain',
        63: 'Moderate Rain',
        65: 'Heavy Rain',
        71: 'Slight Snow',
        73: 'Moderate Snow',
        75: 'Heavy Snow',
        80: 'Slight Rain Showers',
        81: 'Moderate Rain Showers',
        82: 'Violent Rain Showers',
        85: 'Slight Snow Showers',
        86: 'Heavy Snow Showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with Hail',
        99: 'Thunderstorm with Hail'
      };
      return conditions[code] || 'Unknown';
    }

    function getWeatherIcon(code) {
      if (code === 0) return '☀️';
      if (code <= 2) return '🌤️';
      if (code === 3) return '☁️';
      if (code >= 45 && code <= 48) return '🌫️';
      if (code <= 65) return '🌧️';
      if (code <= 86) return '❄️';
      if (code >= 80 && code <= 82) return '🌧️';
      if (code >= 95) return '⛈️';
      return '🌤️';
    }

    dateInput.addEventListener('change', (e) => {
      if (e.target.value) {
        weatherContainer.innerHTML = '<div class="weather-widget"><div class="weather-loading">Loading weather...</div></div>';
        setTimeout(() => fetchWeather(e.target.value), 300);
      }
    });
  }

  // ===== TOUR MAPS =====
  function initTourMaps() {
    const detailPages = ['kibera', 'nightlife', 'lens-and-legend', 'seasoned-tours', 'wildlife', 'airport-transfers'];
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';

    if (!detailPages.includes(currentPage)) return;

    const tour = tourData.getTour(currentPage);
    if (!tour) return;

    // Find or create map section
    let mapSection = document.querySelector('.tour-map-section');
    if (!mapSection) {
      mapSection = document.createElement('section');
      mapSection.className = 'tour-map-section';
      mapSection.innerHTML = `
        <h3>Tour Route & Location</h3>
        <div class="tour-map-container">
          <iframe title="Tour location map" style="width:100%; height:100%; border:none;" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15948.15!2d${tour.coordinates.lng}!3d${tour.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${Math.abs(tour.coordinates.lat).toFixed(4)}°S%20${tour.coordinates.lng.toFixed(4)}°E!5e0!3m2!1sen!2sKE!4v1234567890"></iframe>
        </div>
      `;

      // Insert after hero section or at top of main
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.insertBefore(mapSection, mainContent.firstChild.nextSibling || mainContent.firstChild);
      }
    }
  }

  // ===== INITIALIZE ALL =====
  function init() {
    tourData.loadTours().then(() => {
      initReviewDisplay();
      initWhatsAppButton();
      initAvailabilityCalendar();
      initWeatherWidget();
      initTourMaps();
      initPriceSlider();
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    init,
    initReviewDisplay,
    initPriceSlider,
    initWhatsAppButton,
    initAvailabilityCalendar,
    initWeatherWidget,
    initTourMaps
  };
})();
