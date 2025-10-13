'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useDataStore } from '@/lib/stores/useDataStore';
import 'leaflet/dist/leaflet.css';
import L, { LatLngTuple } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
//import 'react-leaflet-markercluster/dist/styles.min.css'; // Re-enable CSS import

// Define custom icon (ensure this exists in public/icons/)
const customIcon = L.icon({
  iconUrl: '/map_marker_orange-tp.png',
  iconSize: [16, 16],
  iconAnchor: [8, 16], // Adjusted to center the icon
});

// Transparent icon for individual markers
const transparentIcon = L.divIcon({
  className: 'custom-marker',
  iconSize: [16, 16],
  html: '<div style="background-color: orange; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>',
});

// Default icon (fallback, ensure shadow path is correct)
const defaultIcon = L.icon({
  iconUrl: '/map_marker_orange-tp.png',
  shadowUrl: '/leaflet/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom cluster icon
const createClusterCustomIcon = (cluster: { getChildCount: () => any; }) => {
  const count = cluster.getChildCount();
  return L.divIcon({
    html: `<div style="background-color: orange; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white;">${count}</div>`,
    className: 'custom-cluster-marker',
    iconSize: [24, 24],
  });
};

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

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchProjects();
    if (projectId && datasetId) {
      fetchGeoPoints(Number(projectId), datasetId as string);
    }

    return () => {
      hasFetched.current = false;
    };
  }, [projectId, datasetId, fetchGeoPoints, fetchProjects]);

  useEffect(() => {
    console.log('GeoPoints:', geoPoints);
  }, [geoPoints]);

  // Default center (Colombo, Sri Lanka)
  const position: LatLngTuple = geoPoints[0]
    ? [geoPoints[0].lat, geoPoints[0].lon]
    : [6.934309, 79.844769];

  return (
    <div className="fixed top-16 h-[calc(100vh-4rem)] w-full">
      {geoPoints.length === 0 ? (
        <div>Loading...</div>
      ) : (
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MarkerClusterGroup
            iconCreateFunction={createClusterCustomIcon} // Add custom cluster icon
            maxClusterRadius={50} // Adjust clustering radius if needed
          >
            {geoPoints.map((point) => (
              <Marker
                key={point.id}
                position={[point.lat, point.lon] as LatLngTuple}
                icon={transparentIcon}
              >
                <Popup>Entity {point.id}</Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      )}
    </div>
  );
}
