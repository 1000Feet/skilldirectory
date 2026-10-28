import L from 'leaflet';

interface Coordinates {
  lat: number;
  lng: number;
}

interface Distance {
  miles: number;
  kilometers: number;
}

export async function getCoordinates(address: string): Promise<Coordinates | null> {
  try {
    console.log('Geocoding address:', address);
    
    // Using OpenStreetMap's Nominatim service for geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&limit=1`,
      {
        headers: {
          'User-Agent': 'SkillDirectory/1.0' // Required by Nominatim's usage policy
        }
      }
    );
    
    const data = await response.json();

    if (!data || data.length === 0) {
      console.log('No coordinates found for address:', address);
      return null;
    }

    const result = data[0];
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    if (isNaN(lat) || isNaN(lng)) {
      console.error('Invalid coordinates received from Nominatim');
      return null;
    }

    console.log('Coordinates found:', { lat, lng }, 'for address:', address);
    return { lat, lng };
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return null;
  }
}

// Calculate distance between two points using the Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Distance {
  // Using Leaflet's built-in distance calculation
  const point1 = L.latLng(lat1, lon1);
  const point2 = L.latLng(lat2, lon2);
  
  // Get distance in meters
  const distanceInMeters = point1.distanceTo(point2);
  
  // Convert to kilometers and miles
  const kilometers = distanceInMeters / 1000;
  const miles = kilometers * 0.621371;

  return {
    kilometers: Math.round(kilometers * 100) / 100, // Round to 2 decimal places
    miles: Math.round(miles * 100) / 100
  };
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export async function getDistanceBetweenAddresses(
  address1: string | null,
  address2: string | null
): Promise<Distance | null> {
  if (!address1 || !address2) {
    console.log('Missing address(es)');
    return null;
  }

  try {
    const coords1 = await getCoordinates(address1);
    const coords2 = await getCoordinates(address2);

    if (!coords1 || !coords2) {
      console.log('Could not get coordinates for one or both addresses');
      return null;
    }

    return calculateDistance(coords1.lat, coords1.lng, coords2.lat, coords2.lng);
  } catch (error) {
    console.error('Error calculating distance between addresses:', error);
    return null;
  }
}

export async function testGeocodingAPI(address: string = "New York, NY"): Promise<boolean> {
  try {
    const result = await getCoordinates(address);
    return result !== null;
  } catch (error) {
    console.error('Error testing geocoding API:', error);
    return false;
  }
}
