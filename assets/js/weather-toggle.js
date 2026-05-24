/**
 * UrbanPulse Adventures - Weather Toggle
 * Live weather view for Nairobi with real-time data
 */

const weatherToggle = (() => {
  'use strict';

  const NAIROBI_COORDS = { lat: -1.2864, lng: 36.8172 };
  const CACHE_KEY = 'nairobi_weather_cache';
  const CACHE_TTL = 3600000; // 1 hour

  function init() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const headerInner = header.querySelector('.header-inner');
    if (!headerInner) return;

    // Create weather button
    const weatherBtn = document.createElement('button');
    weatherBtn.className = 'weather-toggle-btn';
    weatherBtn.setAttribute('aria-label', 'View Nairobi weather');
    weatherBtn.setAttribute('title', 'Live Weather');
    weatherBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2c-5.33 4.55-8 6.75-8 11 0 4.41 3.59 8 8 8s8-3.59 8-8c0-4.25-2.67-6.45-8-11z" opacity="0.8"/>
        <circle cx="8" cy="8" r="1" fill="currentColor"/>
        <circle cx="16" cy="7" r="1.5" fill="currentColor"/>
      </svg>
    `;

    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'weather-dropdown';
    dropdown.innerHTML = `
      <div class="weather-dropdown-header">
        <span>Nairobi Weather</span>
        <button class="weather-dropdown-close" aria-label="Close">✕</button>
      </div>
      <div class="weather-content">
        <div class="weather-loading">
          <div class="weather-spinner"></div>
          <span>Loading weather...</span>
        </div>
      </div>
    `;

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'weather-toggle-wrapper';
    wrapper.appendChild(weatherBtn);
    wrapper.appendChild(dropdown);

    // Insert before theme toggle
    const themeToggle = headerInner.querySelector('.theme-toggle');
    if (themeToggle) {
      themeToggle.parentNode.insertBefore(wrapper, themeToggle);
    } else {
      headerInner.appendChild(wrapper);
    }

    // Event listeners
    weatherBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleDropdown();
    });

    const closeBtn = dropdown.querySelector('.weather-dropdown-close');
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeDropdown();
    });

    // Close on document click
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        closeDropdown();
      }
    });

    // Load weather
    loadWeather();
  }

  function toggleDropdown() {
    const dropdown = document.querySelector('.weather-dropdown');
    if (!dropdown) return;

    dropdown.classList.toggle('active');
  }

  function closeDropdown() {
    const dropdown = document.querySelector('.weather-dropdown');
    if (dropdown) {
      dropdown.classList.remove('active');
    }
  }

  async function loadWeather() {
    try {
      // Check cache first
      const cached = getCache();
      if (cached) {
        displayWeather(cached);
        return;
      }

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${NAIROBI_COORDS.lat}&longitude=${NAIROBI_COORDS.lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&hourly=temperature_2m,weather_code&temperature_unit=celsius&timezone=Africa/Nairobi`
      );

      if (!response.ok) throw new Error('Weather API failed');

      const data = await response.json();
      setCache(data);
      displayWeather(data);
    } catch (error) {
      console.error('Weather fetch error:', error);
      displayError();
    }
  }

  function displayWeather(data) {
    const content = document.querySelector('.weather-content');
    if (!content) return;

    const current = data.current;
    const hourly = data.hourly;
    const timezone = data.timezone;

    // Get next 3 hourly forecasts
    const now = new Date();
    const hourlyForecast = [];
    for (let i = 0; i < 3; i++) {
      const hour = (now.getHours() + i + 1) % 24;
      hourlyForecast.push({
        hour: String(hour).padStart(2, '0') + ':00',
        temp: hourly.temperature_2m[i],
        code: hourly.weather_code[i]
      });
    }

    const condition = getWeatherCondition(current.weather_code);
    const icon = getWeatherIcon(current.weather_code);

    content.innerHTML = `
      <div class="weather-current">
        <div class="weather-icon-large">${icon}</div>
        <div class="weather-main">
          <div class="weather-temp">${Math.round(current.temperature_2m)}°C</div>
          <div class="weather-condition">${condition}</div>
          <div class="weather-details">
            💧 ${current.relative_humidity_2m}% humidity<br>
            💨 ${Math.round(current.wind_speed_10m)} km/h wind<br>
            🌧️ ${current.precipitation || 0}mm rain
          </div>
        </div>
      </div>
      <div class="weather-hourly">
        <div class="weather-hourly-title">Next 3 Hours</div>
        <div class="weather-hourly-grid">
          ${hourlyForecast.map(h => `
            <div class="weather-hour">
              <span class="weather-hour-time">${h.hour}</span>
              <span class="weather-hour-icon">${getWeatherIcon(h.code)}</span>
              <span class="weather-hour-temp">${Math.round(h.temp)}°</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="weather-footer">
        📍 Nairobi • ${new Date().toLocaleTimeString('en-US', { timeZone: timezone, hour: '2-digit', minute: '2-digit' })}
      </div>
    `;
  }

  function displayError() {
    const content = document.querySelector('.weather-content');
    if (content) {
      content.innerHTML = `
        <div class="weather-error">
          <span>⚠️ Unable to load weather</span>
          <small>Please try again later</small>
        </div>
      `;
    }
  }

  function getWeatherCondition(code) {
    const conditions = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Foggy',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail',
      99: 'Thunderstorm with hail'
    };
    return conditions[code] || 'Unknown';
  }

  function getWeatherIcon(code) {
    if (code === 0) return '☀️';
    if (code === 1 || code === 2) return '🌤️';
    if (code === 3) return '☁️';
    if (code === 45 || code === 48) return '🌫️';
    if (code >= 51 && code <= 55) return '🌧️';
    if (code >= 61 && code <= 65) return '🌧️';
    if (code >= 71 && code <= 75) return '❄️';
    if (code === 80 || code === 81 || code === 82) return '⛈️';
    if (code >= 85 && code <= 86) return '🌨️';
    if (code >= 95 && code <= 99) return '⛈️';
    return '🌤️';
  }

  function setCache(data) {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  }

  function getCache() {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    try {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_TTL) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      return data;
    } catch {
      return null;
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
