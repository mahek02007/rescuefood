/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 decimal place
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Predefined popular metro location centers for realistic testing
 */
export const SAMPLE_CITIES = [
  { name: 'Central District (Downtown)', lat: 37.7749, lng: -122.4194, city: 'Metropolis', area: 'Downtown' },
  { name: 'Northside Commercial Hub', lat: 37.7935, lng: -122.4048, city: 'Metropolis', area: 'Northside' },
  { name: 'East Valley Community Zone', lat: 37.7602, lng: -122.3892, city: 'Metropolis', area: 'East Valley' },
  { name: 'West Bay University Park', lat: 37.7699, lng: -122.4467, city: 'Metropolis', area: 'West Bay' },
  { name: 'South Garden District', lat: 37.7312, lng: -122.4330, city: 'Metropolis', area: 'South Garden' },
];

export const DEFAULT_USER_LOCATION = {
  latitude: 37.7749,
  longitude: -122.4194,
  name: 'Central District, Metropolis',
  address: '450 Mission Street, Central District, Metropolis'
};
