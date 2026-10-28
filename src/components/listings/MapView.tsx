import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface EducatorProfile {
  id: string;
  name: string;
  description: string;
  image: string;
  categories: string[];
  address: string;
  distance?: {
    miles: number;
    kilometers: number;
  } | null;
  is_active: boolean;
}

interface MapViewProps {
  educatorProfiles: EducatorProfile[];
  onProfileClick: (profile: EducatorProfile) => void;
}

interface GeocodedLocation {
  lat: number;
  lng: number;
}

export function MapView({ educatorProfiles, onProfileClick }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [loading, setLoading] = useState(true);
  const [geocodedLocations, setGeocodedLocations] = useState<Map<string, GeocodedLocation>>(new Map());

  const geocodeAddress = async (address: string): Promise<GeocodedLocation | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      
      if (data && data[0]) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  useEffect(() => {
    const geocodeAddresses = async () => {
      setLoading(true);
      const locations = new Map<string, GeocodedLocation>();
      
      await Promise.all(
        educatorProfiles.map(async (profile) => {
          if (profile.address && !geocodedLocations.has(profile.address)) {
            const location = await geocodeAddress(profile.address);
            if (location) {
              locations.set(profile.address, location);
            }
          }
        })
      );
      
      setGeocodedLocations(locations);
      setLoading(false);
    };

    geocodeAddresses();
  }, [educatorProfiles]);

  useEffect(() => {
    if (loading) return;

    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([0, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const validProfiles = educatorProfiles.filter(
      profile => profile.address && geocodedLocations.has(profile.address)
    );

    if (validProfiles.length > 0) {
      const coordinates = validProfiles.map(profile => {
        const location = geocodedLocations.get(profile.address)!;
        return [location.lat, location.lng];
      });

      const bounds = L.latLngBounds(coordinates as [number, number][]);

      validProfiles.forEach(profile => {
        const location = geocodedLocations.get(profile.address)!;
        const marker = L.marker([location.lat, location.lng])
          .addTo(mapRef.current!)
          .bindPopup(`
            <div style="min-width: 300px; padding: 10px;">
              <div style="display: flex; margin-bottom: 10px;">
                <div style="width: 100px; height: 100px; flex-shrink: 0; margin-right: 10px; overflow: hidden; border-radius: 4px;">
                  <img 
                    src="${profile.image || 'https://via.placeholder.com/100?text=No+Image'}" 
                    alt="${profile.name}"
                    style="width: 100%; height: 100%; object-fit: cover;"
                    onerror="this.src='https://via.placeholder.com/100?text=No+Image'"
                  />
                </div>
                <div>
                  <h3 style="margin: 0 0 5px 0; font-weight: bold; font-size: 16px;">${profile.name}</h3>
                  <div style="margin-bottom: 5px;">
                    ${profile.categories.map(cat => 
                      `<span style="display: inline-block; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 12px; margin: 0 4px 4px 0;">${cat}</span>`
                    ).join('')}
                  </div>
                  ${profile.distance ? 
                    `<div style="display: inline-block; background: #4b5563; color: white; padding: 2px 8px; border-radius: 9999px; font-size: 12px; margin-top: 5px;">
                      ${profile.distance.miles.toFixed(1)} Miles Away
                    </div>` 
                    : ''
                  }
                </div>
              </div>
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #4b5563; line-height: 1.4;">
                ${profile.description.length > 150 ? profile.description.substring(0, 150) + '...' : profile.description}
              </p>
              <button 
                onclick="(function() { 
                  const profileUrl = '/educator/${encodeURIComponent(createSlug(profile.name))}'; 
                  sessionStorage.setItem('educator_profile_id', '${profile.id}');
                  window.location.href = profileUrl;
                })()"
                style="width: 100%; padding: 8px; background: #88C440; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; hover: { background: #78ac37 };"
              >
                View Details
              </button>
            </div>
          `, {
            maxWidth: 350,
            className: 'custom-popup'
          });

        marker.on('click', () => {
          marker.openPopup();
        });

        marker.on('mouseover', () => {
          marker.openPopup();
        });

        markersRef.current.push(marker);
      });

      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [educatorProfiles, geocodedLocations, loading]);

  // Create URL-friendly slug from business name
  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      // Replace ampersand with 'and' before general replacement
      .replace(/&/g, 'and')
      // Then replace all non-alphanumeric characters with hyphens
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  if (loading) {
    return (
      <Card className="w-full h-[600px] overflow-hidden flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </Card>
    );
  }

  return (
    <Card className="w-full h-[600px] overflow-hidden">
      <div id="map" className="w-full h-full" />
    </Card>
  );
} 