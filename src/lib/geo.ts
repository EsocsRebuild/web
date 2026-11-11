/**
 * Geolocation & Spatial Distance Engine
 * Computes great-circle distances between users and church units,
 * mapping localities to coordinates and enabling proximity-based parish ranking.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Approximate centroid coordinates for known localities, dioceses, and states.
 */
export const LOCALITY_COORDINATES: Record<string, Coordinates> = {
  // Lagos & Headquarter Seats
  "Ebute-Metta, Lagos": { lat: 6.4833, lng: 3.3833 },
  "Surulere, Lagos": { lat: 6.5, lng: 3.35 },
  "Apapa, Lagos": { lat: 6.45, lng: 3.3667 },
  "Ikeja, Lagos": { lat: 6.595, lng: 3.344 },
  "Ikorodu, Lagos": { lat: 6.6153, lng: 3.5108 },
  "Ojokoro, Lagos": { lat: 6.6719, lng: 3.2844 },
  Lagos: { lat: 6.4654, lng: 3.4064 },

  // Federal Capital & North
  "Garki, Abuja": { lat: 9.0333, lng: 7.4833 },
  "Kabusa, Abuja": { lat: 8.95, lng: 7.45 },
  Abuja: { lat: 9.0765, lng: 7.3986 },
  Kaduna: { lat: 10.5105, lng: 7.4165 },
  Kano: { lat: 12.0022, lng: 8.592 },
  Jos: { lat: 9.8965, lng: 8.8583 },

  // Niger Delta & Riverine Provinces
  "Port Harcourt": { lat: 4.8156, lng: 7.0498 },
  "Port Harcourt, Rivers State": { lat: 4.8156, lng: 7.0498 },
  "Rivers State": { lat: 4.85, lng: 6.9 },
  "Diobu, Port Harcourt": { lat: 4.795, lng: 6.995 },
  "Elekahia, Port Harcourt": { lat: 4.82, lng: 7.02 },
  "Rumuogba, Port Harcourt": { lat: 4.84, lng: 7.035 },
  "Oginigba, Port Harcourt": { lat: 4.825, lng: 7.045 },
  "Akpajo, Rivers State": { lat: 4.81, lng: 7.1 },
  "Oroigwe, Rivers State": { lat: 4.86, lng: 7.03 },
  "Obio/Akpor": { lat: 4.84, lng: 7.01 },
  Abonnema: { lat: 4.7219, lng: 6.7869 },
  Andoni: { lat: 4.5167, lng: 7.4167 },
  Opobo: { lat: 4.5167, lng: 7.5333 },
  Yenagoa: { lat: 4.9267, lng: 6.2676 },

  // South-East
  Enugu: { lat: 6.4584, lng: 7.5464 },
  Aba: { lat: 5.1066, lng: 7.3667 },
  Onitsha: { lat: 6.1498, lng: 6.7858 },
  "Inland Town, Onitsha": { lat: 6.16, lng: 6.78 },
  "Okpoko, Onitsha": { lat: 6.12, lng: 6.79 },
  Okpoko: { lat: 6.12, lng: 6.79 },
  Owerri: { lat: 5.4833, lng: 7.0333 },
  "Uratta, Owerri": { lat: 5.51, lng: 7.06 },
  "Umuapu, Imo State": { lat: 5.32, lng: 6.98 },
  Orlu: { lat: 5.7944, lng: 7.0358 },
  Nkwerre: { lat: 5.7583, lng: 7.1083 },
  Awka: { lat: 6.2106, lng: 7.0699 },
  Amawbia: { lat: 6.195, lng: 7.05 },
  Nibo: { lat: 6.175, lng: 7.07 },
  Nando: { lat: 6.29, lng: 6.92 },
  Mgbakwu: { lat: 6.27, lng: 7.07 },
  Akpugo: { lat: 6.35, lng: 7.57 },
  Nkporo: { lat: 5.67, lng: 7.78 },
  Isu: { lat: 5.85, lng: 7.82 },
  Umuike: { lat: 5.4, lng: 7.1 },
  Uyo: { lat: 5.0377, lng: 7.9128 },
  Calabar: { lat: 4.9757, lng: 8.3417 },

  // South-West & Mid-West
  Ibadan: { lat: 7.3775, lng: 3.947 },
  "Mokola, Ibadan": { lat: 7.41, lng: 3.89 },
  "Ede, Osun State": { lat: 7.7333, lng: 4.4333 },
  "Osun State": { lat: 7.5629, lng: 4.52 },
  Asaba: { lat: 6.1984, lng: 6.7334 },
  Agbor: { lat: 6.2539, lng: 6.1947 },
  Umunede: { lat: 6.26, lng: 6.3 },
  Kwale: { lat: 5.71, lng: 6.43 },
  "Benin City": { lat: 6.335, lng: 5.6037 },
  Warri: { lat: 5.5167, lng: 5.75 },

  // United Kingdom & Europe
  "London, United Kingdom": { lat: 51.4934, lng: -0.0917 },
  "Birmingham, United Kingdom": { lat: 52.4862, lng: -1.8904 },
  "United Kingdom": { lat: 51.5074, lng: -0.1278 },

  // North America
  "Bronx, New York": { lat: 40.8306, lng: -73.9178 },
  "Houston, Texas": { lat: 29.7042, lng: -95.5567 },
  "Dallas, United States": { lat: 32.7767, lng: -96.797 },
  "Baltimore, United States": { lat: 39.2904, lng: -76.6122 },
  "United States": { lat: 38.8951, lng: -77.0364 },
  Canada: { lat: 43.6532, lng: -79.3832 },
};

/**
 * Country default fallbacks for international units.
 */
export const COUNTRY_CENTROIDS: Record<string, Coordinates> = {
  NG: { lat: 9.082, lng: 8.6753 },
  GB: { lat: 51.5074, lng: -0.1278 },
  US: { lat: 37.0902, lng: -95.7129 },
  CA: { lat: 56.1304, lng: -106.3468 },
  BE: { lat: 50.8503, lng: 4.3517 },
};

/**
 * Resolves coordinate for a unit based on its locality, name, and country.
 */
export function resolveCoordinates(
  locality: string | null | undefined,
  name: string,
  country: string | null | undefined,
): Coordinates | null {
  if (locality && LOCALITY_COORDINATES[locality]) {
    return LOCALITY_COORDINATES[locality];
  }

  // Check matching substring in locality
  if (locality) {
    for (const [key, coords] of Object.entries(LOCALITY_COORDINATES)) {
      if (locality.toLowerCase().includes(key.toLowerCase())) {
        return coords;
      }
    }
  }

  // Check matching substring in name
  for (const [key, coords] of Object.entries(LOCALITY_COORDINATES)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return coords;
    }
  }

  // Country fallback
  if (country && COUNTRY_CENTROIDS[country]) {
    return COUNTRY_CENTROIDS[country];
  }

  return LOCALITY_COORDINATES["Lagos"];
}

/**
 * Haversine formula to compute great-circle distance between two points on Earth.
 * Returns distance in kilometers (or miles if specified).
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates,
  unit: "km" | "mi" = "km",
): number {
  const R = unit === "km" ? 6371 : 3958.8; // Earth's mean radius

  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const lat1Rad = (coord1.lat * Math.PI) / 180;
  const lat2Rad = (coord2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Formats a distance in kilometers into a human-friendly string.
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return "< 1 km away";
  }
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km away`;
  }
  return `${Math.round(distanceKm).toLocaleString()} km away`;
}

/**
 * Creates a Google Maps turn-by-turn directions URL.
 */
export function buildGoogleMapsUrl(destination: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
