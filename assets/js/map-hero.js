/**
 * Map Hero module - lazy loads Leaflet and renders an interactive map
 * Usage: call MapHero.init() on pages that include a .map-hero section
 */
(function(window){
  'use strict';

  const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

  function loadCss(href){
    return new Promise((res,rej)=>{
      if(document.querySelector('link[href="'+href+'"]')) return res();
      const l = document.createElement('link'); l.rel='stylesheet'; l.href=href; l.onload=res; l.onerror=rej; document.head.appendChild(l);
    });
  }
  function loadScript(src){
    return new Promise((res,rej)=>{
      if(window.L) return res();
      const s = document.createElement('script'); s.src=src; s.async=true; s.onload=res; s.onerror=rej; document.body.appendChild(s);
    });
  }

  async function ensureLeaflet(){
    if(window.L) return;
    await loadCss(LEAFLET_CSS);
    await loadScript(LEAFLET_JS);
  }

  function clampZoom(z){ return Math.max(2, Math.min(16, z)); }

  async function renderMap(container, mapData){
    await ensureLeaflet();

    // Create map
    const center = (mapData && mapData.markers && mapData.markers.length) ? [mapData.markers[0].lat, mapData.markers[0].lng] : (mapData?.center || [0,0]);
    // ensure container has an id for leaflet
    if(!container.id) container.id = 'map-hero-' + Math.random().toString(36).slice(2,8);
    const map = L.map(container.id, { zoomControl:true, attributionControl:false }).setView(center, clampZoom(12));

    // Add OSM tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      detectRetina: true
    }).addTo(map);

    const group = [];

    // Markers
    (mapData.markers || []).forEach(m => {
      try{
        const marker = L.marker([m.lat, m.lng]).addTo(map);
        const content = '<strong>'+escapeHtml(m.title || '')+'</strong>' + (m.description ? ('<div>'+escapeHtml(m.description)+'</div>') : '');
        marker.bindPopup(content, {maxWidth: 320});
        group.push(marker);
      }catch(e){}
    });

    // Route polyline
    if(mapData.route && mapData.route.length){
      const latlngs = mapData.route.map(r=>[r[0], r[1]]);
      const poly = L.polyline(latlngs, {color:'#2d8a6e', weight:3, opacity:0.9}).addTo(map);
      group.push(poly);
    }

    // Polygon
    if(mapData.polygon && mapData.polygon.length){
      const latlngs = mapData.polygon.map(p=>[p[0], p[1]]);
      const poly = L.polygon(latlngs, {color:'#d49a4a', weight:2, opacity:0.6}).addTo(map);
      group.push(poly);
    }

    if(group.length){
      const fg = L.featureGroup(group);
      map.fitBounds(fg.getBounds().pad(0.2));
    }

    return map;
  }

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]; }); }

  // Public init: find .map-hero sections and render maps
  async function init(){
    const sections = document.querySelectorAll('.map-hero');
    if(!sections.length) return;

    // load tours data (already cached in tourData)
    try{ await tourData.loadTours(); }catch(e){}

    sections.forEach(async sec => {
      const id = sec.getAttribute('data-tour-id');
      const container = sec.querySelector('.map-hero__container');
      const overlay = sec.querySelector('.map-hero__overlay');
      if(!container) return;

      // try to get map from JSON
      let mapObj = null;
      if(id && window.tourData && typeof tourData.getTour === 'function'){
        const t = tourData.getTour(id);
        mapObj = t && t.map ? t.map : null;
      }

      // if no structured map data, but mapEmbed exists, just show static fallback image or embed
      if(!mapObj){
        // Inject static fallback (mapEmbed iframe) if present
        const t = id && window.tourData && typeof tourData.getTour === 'function' ? tourData.getTour(id) : null;
        if(t && t.map && t.map.staticImage){
          const img = document.createElement('img'); img.src = t.map.staticImage; img.alt = (t.name || 'Map'); img.loading='lazy'; img.style.width='100%'; container.appendChild(img);
        } else if(t && t.mapEmbed){
          const wrap = document.createElement('div'); wrap.className='map-embed-wrap'; wrap.innerHTML = '<iframe src="'+t.mapEmbed+'" loading="lazy" referrerpolicy="no-referrer-when-downgrade" style="border:0; width:100%; height:100%;"></iframe>';
          container.appendChild(wrap);
        }
        return;
      }

      // Lazy initialize on intersection
      const io = new IntersectionObserver((entries, obs)=>{
        entries.forEach(async ent => {
          if(!ent.isIntersecting) return;
          obs.unobserve(ent.target);
          try{
            await renderMap(container, mapObj);
            if(overlay) overlay.classList.add('map-ready');
          }catch(e){
            console.error('MapHero render failed', e);
          }
        });
      }, {rootMargin: '200px 0px 200px 0px', threshold: 0.1});

      io.observe(container);
    });
  }

  // expose
  window.MapHero = { init };
  // auto-init when main init runs
  document.addEventListener('DOMContentLoaded', () => { try{ MapHero.init(); }catch(e){} });

})(window);
