// src/components/MapCon.tsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const TILE_LAYER_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const manoloFortichBounds = L.latLngBounds(
  L.latLng(8.25, 124.75),
  L.latLng(8.45, 124.95)
);

const DEFAULT_ZOOM = 14;
const MIN_ZOOM_LOCKED = 14;
const MIN_ZOOM_UNLOCKED = 12;
const MAX_ZOOM = 18;

// Component to set up the map logic
const MapLogic = () => {
  const map = useMap();
  const [allowZoomOut, setAllowZoomOut] = useState(false);

  useEffect(() => {
    // Initial map view and restriction
    map.setView([8.35985, 124.869077], DEFAULT_ZOOM);
    map.setMaxBounds(manoloFortichBounds);

    const enforceRestrictions = () => {
      const currentZoom = map.getZoom();

      if (currentZoom > DEFAULT_ZOOM) {
        setAllowZoomOut(true);
      }

      if (!allowZoomOut && currentZoom < DEFAULT_ZOOM) {
        map.setZoom(DEFAULT_ZOOM);
      } else if (allowZoomOut && currentZoom < MIN_ZOOM_UNLOCKED) {
        map.setZoom(MIN_ZOOM_UNLOCKED);
      }

      if (!manoloFortichBounds.contains(map.getCenter())) {
        map.panInsideBounds(manoloFortichBounds, { animate: false });
      }
    };

    map.on('zoomend', enforceRestrictions);
    map.on('move', enforceRestrictions);

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.off('zoomend', enforceRestrictions);
      map.off('move', enforceRestrictions);
    };
  }, [map, allowZoomOut]);

  return null;
};

// Main Map Component
const MapCon: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        /* Ensure Leaflet markers display correctly */
        .leaflet-marker-icon {
          border: none !important;
          background: transparent !important;
        }
      `}</style>

      {isMounted && (
        <MapContainer
          center={[8.35985, 124.869077]}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          minZoom={MIN_ZOOM_LOCKED}
          maxZoom={MAX_ZOOM}
          maxBounds={manoloFortichBounds}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            url={TILE_LAYER_URL}
            attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
          />
          
          <MapLogic />
        </MapContainer>
      )}
    </div>
  );
};

export default MapCon;