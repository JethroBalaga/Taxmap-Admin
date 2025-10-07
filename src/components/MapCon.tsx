// src/components/MapCon.tsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getMarkerIconByKind } from '../utils/markericons';
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
  const [markerIcons, setMarkerIcons] = useState<{[tagId: string]: L.Icon}>({});

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
          console.log('Fetched photo tags:', data.length);
          setPhotoTags(data);
          
          // Fetch kind information for each tag to determine icons
          await fetchKindInfoForTags(data);
        }
      } catch (error) {
        console.error('Error loading photo tags:', error);
      } finally {
        setLoading(false);
      }
    };

    // Corrected function to fetch kind information
    const fetchKindInfoForTags = async (tags: PhotoTag[]) => {
      try {
        const icons: {[tagId: string]: L.Icon} = {};
        const tagIds = tags.map(tag => tag.tag_id);
        
        console.log('Fetching kind info for tags:', tagIds.length);
        
        // First get value_info to get form_id for each tag
        const { data: valueInfoData, error } = await supabase
          .from('value_info')
          .select('tag_id, form_id')
          .in('tag_id', tagIds);

        if (error) {
          console.error('Error fetching value info:', error);
          return;
        }

        if (valueInfoData && valueInfoData.length > 0) {
          console.log('Value info data found:', valueInfoData.length);
          
          // Get unique form_ids
          const formIds = [...new Set(valueInfoData.map(item => item.form_id))];
          
          // Then get kind_id for each form
          const { data: formData, error: formError } = await supabase
            .from('formtbl')
            .select('form_id, kind_id')
            .in('form_id', formIds);

          if (formError) {
            console.error('Error fetching form data:', formError);
          } else if (formData) {
            console.log('Form data found:', formData.length);
            
            // Create a mapping of form_id to kind_id
            const formKindMap: {[formId: string]: string} = {};
            formData.forEach(form => {
              formKindMap[form.form_id] = form.kind_id;
            });

            console.log('Form kind mapping:', formKindMap);

            // Now assign icons based on tag_id -> form_id -> kind_id
            valueInfoData.forEach(item => {
              const kindId = formKindMap[item.form_id];
              if (kindId) {
                console.log(`Tag ${item.tag_id} has kind_id: ${kindId}`);
                icons[item.tag_id] = getMarkerIconByKind(kindId);
              } else {
                console.log(`No kind_id found for tag ${item.tag_id}, using default`);
                icons[item.tag_id] = getMarkerIconByKind('1'); // Default to land
              }
            });
          }
        } else {
          console.log('No value info data found for the tags');
        }
        
        // Handle any tags that didn't get an icon from the query
        tags.forEach(tag => {
          if (!icons[tag.tag_id]) {
            console.log(`Tag ${tag.tag_id} not in valueInfoData, using default icon`);
            icons[tag.tag_id] = getMarkerIconByKind('1'); // Default to land
          }
        });
        
        console.log('Final icons mapping:', icons);
        setMarkerIcons(icons);
      } catch (error) {
        console.error('Error in fetchKindInfoForTags:', error);
      }
    };

    fetchPhotoTags();
  }, []);

  // ZOOM HANDLING LOGIC - ADDED FROM THE SAMPLE
  useEffect(() => {
    // Initial map view and restriction
    map.setView([8.35985, 124.869077], DEFAULT_ZOOM);
    map.setMaxBounds(manoloFortichBounds);

    const enforceRestrictions = () => {
      const currentZoom = map.getZoom();

      // Allow zooming out only if user has zoomed in first
      if (currentZoom > DEFAULT_ZOOM) {
        setAllowZoomOut(true);
      }

      // Prevent zooming out beyond restrictions
      if (!allowZoomOut && currentZoom < DEFAULT_ZOOM) {
        map.setZoom(DEFAULT_ZOOM);
      } else if (allowZoomOut && currentZoom < MIN_ZOOM_UNLOCKED) {
        map.setZoom(MIN_ZOOM_UNLOCKED);
      }

      // Keep map within bounds
      if (!manoloFortichBounds.contains(map.getCenter())) {
        map.panInsideBounds(manoloFortichBounds, { animate: false });
      }
    };

    // Set up event listeners for zoom and move
    map.on('zoomend', enforceRestrictions);
    map.on('move', enforceRestrictions);

    // Fix map sizing issues
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.off('zoomend', enforceRestrictions);
      map.off('move', enforceRestrictions);
    };
  }, [map, allowZoomOut]);

  return (
    <>
      {!loading && photoTags.map((tag) => (
        <Marker
          key={tag.tag_id}
          position={[tag.latitude, tag.longitude]}
          icon={markerIcons[tag.tag_id] || getMarkerIconByKind('1')}
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
              <br />
              <small>Tag ID: {tag.tag_id.substring(0, 8)}...</small>
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