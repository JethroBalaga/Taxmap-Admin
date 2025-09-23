// src/components/MapCon.tsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createBlueMarkerIcon } from '../utils/marketicons';
import MapMarkerPopup from './MapMarkerPopup';
import { supabase } from '../utils/supaBaseClient';

const TILE_LAYER_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const manoloFortichBounds = L.latLngBounds(
  L.latLng(8.25, 124.75),
  L.latLng(8.45, 124.95)
);

const DEFAULT_ZOOM = 14;
const MIN_ZOOM_LOCKED = 14;
const MIN_ZOOM_UNLOCKED = 12;
const MAX_ZOOM = 18;

interface PhotoTag {
  tag_id: string;
  latitude: number;
  longitude: number;
  date_taken: string;
  created_at: string;
  accuracy?: number;
  altitude?: number;
}

// Component to set up the map logic and markers
const MapLogic = ({ onMarkerClick }: { onMarkerClick: (tagId: string) => void }) => {
  const map = useMap();
  const [allowZoomOut, setAllowZoomOut] = useState(false);
  const [photoTags, setPhotoTags] = useState<PhotoTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch photo tags from database
    const fetchPhotoTags = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tagtbl')
          .select('tag_id, latitude, longitude, date_taken, created_at, accuracy, altitude')
          .gte('latitude', manoloFortichBounds.getSouthWest().lat)
          .lte('latitude', manoloFortichBounds.getNorthEast().lat)
          .gte('longitude', manoloFortichBounds.getSouthWest().lng)
          .lte('longitude', manoloFortichBounds.getNorthEast().lng);

        if (error) {
          console.error('Error fetching photo tags:', error);
        } else if (data) {
          setPhotoTags(data);
        }
      } catch (error) {
        console.error('Error loading photo tags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotoTags();
  }, []);

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

  const blueMarkerIcon = createBlueMarkerIcon();

  return (
    <>
      {photoTags.map((tag) => (
        <Marker
          key={tag.tag_id}
          position={[tag.latitude, tag.longitude]}
          icon={blueMarkerIcon}
          eventHandlers={{
            click: () => {
              onMarkerClick(tag.tag_id);
            }
          }}
        >
          <Popup>
            <div style={{ textAlign: 'center', padding: '5px' }}>
              <strong>Property Location</strong>
              <br />
              <small>Click for details</small>
              <br />
              <small>Lat: {tag.latitude.toFixed(6)}</small>
              <br />
              <small>Lng: {tag.longitude.toFixed(6)}</small>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

// Main Map Component
const MapCon: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const handleMarkerClick = (tagId: string) => {
    setSelectedTagId(tagId);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedTagId(null);
  };

  return (
    <div style={{ height: '100vh', width: '100%', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        /* Ensure Leaflet markers display correctly */
        .leaflet-marker-icon {
          border: none !important;
          background: transparent !important;
        }
        
        /* Custom popup styles */
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        
        .leaflet-popup-content {
          margin: 8px 12px;
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
          
          <MapLogic onMarkerClick={handleMarkerClick} />
        </MapContainer>
      )}

      {/* Custom Popup Overlay */}
      {showPopup && selectedTagId && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          width: '90%',
          maxWidth: '400px',
          maxHeight: '80vh',
          overflow: 'auto'
        }}>
          <MapMarkerPopup 
            photoTagId={selectedTagId} 
            onClose={handleClosePopup} 
          />
        </div>
      )}
    </div>
  );
};

export default MapCon;