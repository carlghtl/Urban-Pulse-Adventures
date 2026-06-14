/**
 * UrbanPulse Adventures - Tour Data Manager
 * Loads and manages tour data from JSON
 */

const tourData = (() => {
  let toursCache = null;
  const CACHE_KEY = 'urbanpulse_tours_cache';
  const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  async function loadTours() {
    if (toursCache) return toursCache;

    // Try to load from localStorage first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        if (data.timestamp && Date.now() - data.timestamp < CACHE_EXPIRY) {
          toursCache = data.tours;
          return toursCache;
        }
      } catch (e) {
        console.warn('Failed to parse cached tours:', e);
      }
    }

    // Fetch from JSON file
    try {
      const response = await fetch('data/tours.json');
      if (!response.ok) throw new Error(`Failed to load tours: ${response.status}`);

      const data = await response.json();
      toursCache = data.tours || [];

      // Cache in localStorage
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          tours: toursCache,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('Failed to cache tours in localStorage:', e);
      }

      return toursCache;
    } catch (error) {
      console.error('Error loading tours:', error);
      return [];
    }
  }

  function getTour(tourId) {
    if (!toursCache) return null;
    return toursCache.find(t => t.id === tourId);
  }

  function getAllTours() {
    return toursCache || [];
  }

  function getTourByName(name) {
    if (!toursCache) return null;
    return toursCache.find(t => t.name.toLowerCase() === name.toLowerCase());
  }

  function getToursByPrice(minPrice, maxPrice) {
    if (!toursCache) return [];
    return toursCache.filter(t => t.basePrice >= minPrice && t.basePrice <= maxPrice);
  }

  function getAverageRating() {
    if (!toursCache || toursCache.length === 0) return 0;
    const sum = toursCache.reduce((acc, t) => acc + (t.reviewStats?.averageRating || 0), 0);
    return (sum / toursCache.length).toFixed(1);
  }

  function getTotalReviews() {
    if (!toursCache) return 0;
    return toursCache.reduce((sum, t) => sum + (t.reviewStats?.totalReviews || 0), 0);
  }

  function formatPrice(price) {
    // Default to USD formatting site-wide
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  }

  function calculateCustomPrice(tourId, customization) {
    const tour = getTour(tourId);
    if (!tour) return 0;

    let totalPrice = tour.basePrice;

    // Apply duration multiplier
    if (customization.durationMultiplier) {
      totalPrice *= customization.durationMultiplier;
    }

    // Add activity prices
    if (customization.selectedActivities && Array.isArray(customization.selectedActivities)) {
      const activityCost = customization.selectedActivities.reduce((sum, actId) => {
        const activity = tour.customization.activities?.find(a => a.id === actId);
        return sum + (activity?.price || 0);
      }, 0);
      totalPrice += activityCost;
    }

    // Apply group size discount (volume discount)
    if (customization.groupSize && customization.groupSize > 1) {
      const discountFactor = 1 - ((customization.groupSize - 1) * 0.05); // 5% discount per person
      const discountFactor_clamped = Math.max(0.7, discountFactor); // Minimum 30% of price
      totalPrice *= discountFactor_clamped;
    }

    return Math.round(totalPrice);
  }

  function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = '★'.repeat(fullStars);
    if (hasHalf) stars += '½';
    stars += '☆'.repeat(5 - Math.ceil(rating));
    return stars;
  }

  function getRatingColor(rating) {
    if (rating >= 4.7) return '#2d8a6e'; // Green
    if (rating >= 4.3) return '#d49a4a'; // Gold
    return '#e74c3c'; // Red
  }

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadTours);
  } else {
    loadTours();
  }

  return {
    loadTours,
    getTour,
    getAllTours,
    getTourByName,
    getToursByPrice,
    getAverageRating,
    getTotalReviews,
    formatPrice,
    calculateCustomPrice,
    getStarRating,
    getRatingColor
  };
})();
