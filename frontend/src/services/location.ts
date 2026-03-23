import * as Location from 'expo-location';

export interface LocationInfo {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  countryCode?: string;
}

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentLocation(): Promise<LocationInfo | null> {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return null;
    }
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    const { latitude, longitude } = location.coords;
    
    // Reverse geocode to get city and country
    const [geocode] = await Location.reverseGeocodeAsync({ latitude, longitude });
    
    return {
      latitude,
      longitude,
      city: geocode?.city || geocode?.subregion || undefined,
      country: geocode?.country || undefined,
      countryCode: geocode?.isoCountryCode || undefined,
    };
  } catch (error) {
    console.error('Location error:', error);
    return null;
  }
}
