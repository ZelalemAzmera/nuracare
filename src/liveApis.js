/**
 * liveApis.js — Real-Time API Integration Layer for NuraCare
 * 
 * All queries use free, public APIs with zero API keys:
 *  - OpenStreetMap Overpass API for hospitals & gyms
 *  - OpenFoodFacts for global nutrition data
 */

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Haversine distance between two lat/lon pairs in km
 */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Fetch nearby hospitals using OpenStreetMap Overpass API
 * @param {number} lat - User latitude
 * @param {number} lon - User longitude
 * @param {number} radius - Search radius in meters (default 5000)
 * @returns {Promise<Array<{name: string, distance: string, lat: number, lon: number, directionsUrl: string}>>}
 */
export async function fetchNearbyHospitals(lat, lon, radius = 5000) {
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lon});
      way["amenity"="hospital"](around:${radius},${lat},${lon});
      node["amenity"="clinic"](around:${radius},${lat},${lon});
      way["amenity"="clinic"](around:${radius},${lat},${lon});
    );
    out center 10;
  `;

  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(query)
    });
    const data = await res.json();

    const results = data.elements
      .map(el => {
        const elLat = el.lat || el.center?.lat;
        const elLon = el.lon || el.center?.lon;
        if (!elLat || !elLon) return null;
        const name = el.tags?.name || el.tags?.['name:en'] || 'Medical Facility';
        const dist = haversine(lat, lon, elLat, elLon);
        return {
          name,
          distance: dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)} km`,
          distanceRaw: dist,
          lat: elLat,
          lon: elLon,
          directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${elLat},${elLon}`
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceRaw - b.distanceRaw)
      .slice(0, 5);

    return results;
  } catch (err) {
    console.error('Overpass hospital query failed:', err);
    return [];
  }
}

/**
 * Fetch nearby gyms & fitness studios using OpenStreetMap Overpass API
 * @param {number} lat - User latitude
 * @param {number} lon - User longitude
 * @param {number} radius - Search radius in meters (default 5000)
 * @returns {Promise<Array<{name: string, type: string, distance: string, lat: number, lon: number, directionsUrl: string}>>}
 */
export async function fetchNearbyGyms(lat, lon, radius = 5000) {
  const query = `
    [out:json][timeout:10];
    (
      node["leisure"="fitness_centre"](around:${radius},${lat},${lon});
      way["leisure"="fitness_centre"](around:${radius},${lat},${lon});
      node["leisure"="sports_centre"](around:${radius},${lat},${lon});
      way["leisure"="sports_centre"](around:${radius},${lat},${lon});
      node["sport"="yoga"](around:${radius},${lat},${lon});
      way["sport"="yoga"](around:${radius},${lat},${lon});
      node["leisure"="park"](around:${radius},${lat},${lon});
      way["leisure"="park"](around:${radius},${lat},${lon});
    );
    out center 15;
  `;

  try {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(query)
    });
    const data = await res.json();

    const results = data.elements
      .map(el => {
        const elLat = el.lat || el.center?.lat;
        const elLon = el.lon || el.center?.lon;
        if (!elLat || !elLon) return null;
        const name = el.tags?.name || el.tags?.['name:en'] || 'Fitness Facility';
        const dist = haversine(lat, lon, elLat, elLon);
        let type = 'Fitness Center';
        if (el.tags?.leisure === 'park') type = 'Public Park';
        else if (el.tags?.sport === 'yoga') type = 'Yoga Studio';
        else if (el.tags?.leisure === 'sports_centre') type = 'Sports Center';

        return {
          name,
          type,
          distance: dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)} km`,
          distanceRaw: dist,
          lat: elLat,
          lon: elLon,
          directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${elLat},${elLon}`
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceRaw - b.distanceRaw)
      .slice(0, 6);

    return results;
  } catch (err) {
    console.error('Overpass gym query failed:', err);
    return [];
  }
}

/**
 * Search for food nutrition data using OpenFoodFacts API
 * @param {string} query - Food item name (e.g. "chicken breast")
 * @returns {Promise<Array<{name: string, brand: string, calories: number, protein: number, carbs: number, fat: number, serving: string, image: string}>>}
 */
export async function fetchFoodNutrition(query) {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8&fields=product_name,brands,nutriments,serving_size,image_small_url`;
    const res = await fetch(url);
    const data = await res.json();

    return (data.products || [])
      .filter(p => p.product_name && p.nutriments)
      .map(p => ({
        name: p.product_name,
        brand: p.brands || 'Generic',
        calories: Math.round(p.nutriments?.['energy-kcal_100g'] || p.nutriments?.['energy-kcal'] || 0),
        protein: Math.round((p.nutriments?.proteins_100g || 0) * 10) / 10,
        carbs: Math.round((p.nutriments?.carbohydrates_100g || 0) * 10) / 10,
        fat: Math.round((p.nutriments?.fat_100g || 0) * 10) / 10,
        serving: p.serving_size || '100g',
        image: p.image_small_url || null
      }))
      .slice(0, 6);
  } catch (err) {
    console.error('OpenFoodFacts query failed:', err);
    return [];
  }
}

/**
 * Detect VPN/Proxy using ip-api.com (free, no key needed)
 * Returns full location + security context
 */
export async function fetchLocationWithSecurity() {
  try {
    // ip-api.com free tier: includes proxy detection, timezone, currency
    const res = await fetch('http://ip-api.com/json/?fields=status,message,country,countryCode,city,timezone,currency,proxy,hosting,query');
    const data = await res.json();
    if (data.status !== 'success') throw new Error(data.message);
    return {
      country: data.country,
      code: data.countryCode,
      city: data.city,
      timezone: data.timezone,
      currency: data.currency || 'USD',
      isVpn: data.proxy || data.hosting || false,
      ip: data.query
    };
  } catch (err) {
    console.error('ip-api location check failed, falling back to ipapi.co:', err);
    // Fallback to ipapi.co
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      return {
        country: data.country_name,
        code: data.country_code,
        city: data.city,
        timezone: data.timezone,
        currency: data.currency || 'USD',
        isVpn: false,
        ip: data.ip
      };
    } catch {
      return null;
    }
  }
}
