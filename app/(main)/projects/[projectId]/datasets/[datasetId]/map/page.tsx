'use client';

import { MapContainer, TileLayer, Marker, Popup, AttributionControl } from 'react-leaflet';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useDataStore } from '@/lib/stores/useDataStore';
import 'leaflet/dist/leaflet.css';
import L, { LatLngTuple } from 'leaflet';

// Define custom icon (fixes 404 error)
const customIcon = L.icon({
  iconUrl: '/icons8-marker-26.png', // Ensure this exists in public/icons/
  iconSize: [16, 16],
  iconAnchor: [19, 38],
});

// Define GeoPoint interface
interface GeoPoint {
  id: string;
  lat: number;
  lon: number;
}

export default function MapView() {
  const { projectId, datasetId } = useParams();
  const geoPoints = useDataStore((state) => state.geoPoints);
  const fetchGeoPoints = useDataStore((state) => state.fetchGeoPoints);
  const fetchProjects = useDataStore((state) => state.fetchProjects);
  const hasFetched = useRef(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    // Fetch projects only once
    fetchProjects();

    // Fetch geoPoints only if projectId and datasetId are valid
    if (projectId && datasetId) {
      fetchGeoPoints(Number(projectId), datasetId as string);
    }

    // Cleanup to prevent memory leaks
    return () => {
      hasFetched.current = false;
    };
  }, [projectId, datasetId, fetchGeoPoints, fetchProjects]);
  
  // Log only when geoPoints changes (optional, to reduce logging)
  useEffect(() => {
    console.log('GeoPoints:', geoPoints);
  }, [geoPoints]);

  // Placeholder during SSR
  //if (!isClient) {
    //return <div className="h-[calc(100vh-4rem)] w-full bg-gray-100" />;
  //}
  // Use dynamic center based on first geoPoint or default
  const position: LatLngTuple = geoPoints[0]
    ? [geoPoints[0].lat, geoPoints[0].lon]
    : [6.934309, 79.844769]; // Default to Colombo, Sri Lanka
 
  return (
    <div className="fixed top-16 h-[calc(100vh-4rem)] w-full">
      {geoPoints.length === 0 ? (
        <div>Loading...</div>
      ) : (
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geoPoints.map((point) => (
            <Marker
              key={point.id}
              position={[point.lat, point.lon] as LatLngTuple}
              icon={customIcon}
            >
              <Popup>
                Entity {point.id}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}
