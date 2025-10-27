import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getMarkerIconByKind } from '../utils/markericons';
import MapMarkerPopup from './MapMarkerPopup';
import { supabase } from '../utils/supaBaseClient';

const SATELLITE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const OPENSTREETMAP_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const manoloFortichBounds = L.latLngBounds(
  L.latLng(8.25, 124.75),
  L.latLng(8.45, 124.95)
);

const DEFAULT_ZOOM = 14;
const MIN_ZOOM_LOCKED = 14;
const MIN_ZOOM_UNLOCKED = 12;
const MAX_ZOOM = 18;

// Import marker icons for filter panel
import buildingMarkerIconUrl from '../Images/Building.png';
import equipmentMarkerIconUrl from '../Images/Equipment.png';
import landMarkerIconUrl from '../Images/Land.png';

interface PropertyDetails {
  tag_id: string;
  latitude: number;
  longitude: number;
  date_taken: string;
  created_at: string;
  photo?: string;
  form_id?: string;
  kind_id?: string;
  class_id?: string;
  area?: number;
  status?: string;
  declarant_id?: number;
  district_id?: number;
  declarant_firstname?: string;
  declarant_lastname?: string;
  district_name?: string;
}

interface MapConProps {
  searchQuery?: string;
  isAdmin?: boolean;
}

// Helper function to safely check if a value contains the query
const safeIncludes = (value: any, query: string): boolean => {
  if (value == null) return false;
  return String(value).toLowerCase().includes(query.toLowerCase());
};

// Get status class for popup styling
const getStatusClass = (status: string | undefined): string => {
  switch (status) {
    case 'New': return 'status-new';
    case 'Inspected': return 'status-inspected';
    case 'Pending': return 'status-pending';
    default: return 'status-pending';
  }
};

// Get status display text
const getStatusText = (status: string | undefined): string => {
  switch (status) {
    case 'New': return 'New - Needs Inspection';
    case 'Inspected': return 'Inspected';
    case 'Pending': return 'Pending Review';
    default: return 'Unknown Status';
  }
};

// Create custom icon with status badge for new properties
// Create custom icon with status badge for new properties
const createCustomIcon = (property: PropertyDetails) => {
  const isNew = property.status === 'New';
  const baseIcon = getMarkerIconByKind(property.kind_id || '1');
  
  if (!isNew) {
    return baseIcon;
  }

  // For new properties, create a custom icon with badge
  return L.divIcon({
    html: `
      <div class="custom-marker-container">
        <img src="${baseIcon.options.iconUrl}" 
             class="marker-base-icon" 
             alt="Property marker" />
        <div class="status-badge">!</div>
        <div class="marker-tooltip">New Property - Needs Inspection</div>
      </div>
    `,
    className: 'custom-marker-wrapper has-status',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });
};

// Satellite Toggle Control Component
const SatelliteToggleControl = ({ 
  isSatelliteView, 
  onToggle 
}: { 
  isSatelliteView: boolean;
  onToggle: () => void;
}) => {
  const map = useMap();
  const controlRef = useRef<any>(null);

  useEffect(() => {
    const CustomControl = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: function () {
        const container = L.DomUtil.create('div', 'leaflet-control satellite-toggle-container');
        const button = L.DomUtil.create('button', 'satellite-toggle-btn', container);
        button.type = 'button';
        button.title = isSatelliteView ? 'Switch to Standard Map' : 'Switch to Satellite View';
        button.innerHTML = `
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="${isSatelliteView ? 
              'M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5S13.38,11.5,12,11.5z' :
              'M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5S13.38,11.5,12,11.5z'
            }"/>
          </svg>
          <span>${isSatelliteView ? 'Map' : 'Satellite'}</span>
        `;
        
        L.DomEvent.on(button, 'click', (e) => {
          L.DomEvent.stop(e);
          onToggle();
        });
        
        return container;
      }
    });

    controlRef.current = new CustomControl();
    controlRef.current.addTo(map);
    
    return () => controlRef.current?.remove();
  }, [map, isSatelliteView, onToggle]);

  return null;
};

// Filter Control Component
const FilterControl = ({ 
  onFilterChange,
  currentFilter,
  photoTags
}: { 
  onFilterChange: (filter: string) => void;
  currentFilter: string;
  photoTags: PropertyDetails[];
}) => {
  const map = useMap();
  const controlRef = useRef<any>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [markerCounts, setMarkerCounts] = useState({
    all: 0,
    land: 0,
    building: 0,
    equipment: 0
  });

  // Count markers by type
  useEffect(() => {
    const loadCounts = async () => {
      console.log('Starting to count markers for filter...');
      console.log('Total photo tags available:', photoTags.length);
      
      const counts = {
        all: photoTags.length,
        land: 0,
        building: 0,
        equipment: 0
      };

      if (photoTags.length === 0) {
        console.log('No photo tags to count');
        setMarkerCounts(counts);
        return;
      }

      for (const tag of photoTags) {
        try {
          if (tag.kind_id) {
            const kindStr = String(tag.kind_id).trim();
            
            // Count based on kind_id values: 1=land, 2=building, 3=machinery
            switch (kindStr) {
              case '1':
                counts.land++;
                break;
              case '2':
                counts.building++;
                break;
              case '3':
                counts.equipment++;
                break;
            }
          }
        } catch (error) {
          // Silent catch for individual tag errors
        }
      }

      console.log('Final marker counts:', counts);
      setMarkerCounts(counts);
    };

    loadCounts();
  }, [photoTags]);

  useEffect(() => {
    let closePanel: (e: MouseEvent) => void;

    const CustomControl = L.Control.extend({
      options: { position: 'topright' },
      onAdd: function () {
        const container = L.DomUtil.create('div', 'leaflet-control filter-toggle-container');
        
        // Filter button
        const button = L.DomUtil.create('button', 'filter-toggle-btn', container);
        button.type = 'button';
        button.title = 'Filter Markers';
        button.innerHTML = `
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
          </svg>
          <span>Filter</span>
        `;
        
        L.DomEvent.on(button, 'click', (e) => {
          L.DomEvent.stop(e);
          setShowFilterPanel(!showFilterPanel);
        });

        // Filter panel
        const panel = L.DomUtil.create('div', 'filter-panel');
        panel.style.display = showFilterPanel ? 'block' : 'none';
        panel.innerHTML = `
          <div class="filter-options">
            <div class="filter-section">
              <div class="filter-section-title">Show Markers</div>
              <button class="filter-option ${currentFilter === 'all' ? 'active' : ''}" data-filter="all">
                <span class="filter-label">All Markers</span>
                <span class="filter-badge">${markerCounts.all}</span>
              </button>
            </div>
            <div class="filter-section">
              <div class="filter-section-title">By Type</div>
              <div class="filter-fan">
                <button class="filter-option ${currentFilter === 'land' ? 'active' : ''}" data-filter="land">
                  <img src="${landMarkerIconUrl}" alt="Land" class="filter-icon">
                  <span class="filter-label">Land</span>
                  <span class="filter-badge">${markerCounts.land}</span>
                </button>
                <button class="filter-option ${currentFilter === 'building' ? 'active' : ''}" data-filter="building">
                  <img src="${buildingMarkerIconUrl}" alt="Building" class="filter-icon">
                  <span class="filter-label">Building</span>
                  <span class="filter-badge">${markerCounts.building}</span>
                </button>
                <button class="filter-option ${currentFilter === 'equipment' ? 'active' : ''}" data-filter="equipment">
                  <img src="${equipmentMarkerIconUrl}" alt="Equipment" class="filter-icon">
                  <span class="filter-label">Equipment</span>
                  <span class="filter-badge">${markerCounts.equipment}</span>
                </button>
              </div>
            </div>
          </div>
        `;

        // Add click handlers for filter options
        L.DomEvent.on(panel, 'click', (e) => {
          const target = e.target as HTMLElement;
          const filterOption = target.closest('.filter-option') as HTMLElement;
          if (filterOption && filterOption.dataset.filter) {
            L.DomEvent.stop(e);
            onFilterChange(filterOption.dataset.filter);
            setShowFilterPanel(false);
          }
        });

        container.appendChild(panel);
        
        // Close panel when clicking outside
        closePanel = (e: MouseEvent) => {
          if (!container.contains(e.target as Node)) {
            setShowFilterPanel(false);
          }
        };
        
        document.addEventListener('click', closePanel);
        
        return container;
      }
    });

    controlRef.current = new CustomControl();
    controlRef.current.addTo(map);
    
    return () => {
      document.removeEventListener('click', closePanel);
      controlRef.current?.remove();
    };
  }, [map, showFilterPanel, currentFilter, markerCounts, onFilterChange]);

  // Update panel visibility when state changes
  useEffect(() => {
    if (controlRef.current) {
      const container = controlRef.current.getContainer();
      const panel = container?.querySelector('.filter-panel');
      if (panel) {
        panel.style.display = showFilterPanel ? 'block' : 'none';
      }
    }
  }, [showFilterPanel]);

  return null;
};

// Component to set up the map logic and markers
const MapLogic = ({ 
  onMarkerClick,
  searchQuery = '',
  currentFilter = 'all',
  isSatelliteView = false,
  onPhotoTagsLoaded,
  refreshTrigger // Add refresh trigger prop
}: { 
  onMarkerClick: (tagId: string) => void;
  searchQuery?: string;
  currentFilter?: string;
  isSatelliteView?: boolean;
  onPhotoTagsLoaded?: (tags: PropertyDetails[]) => void;
  refreshTrigger?: number; // Add this to force refresh
}) => {
  const map = useMap();
  const [allowZoomOut, setAllowZoomOut] = useState(false);
  const [photoTags, setPhotoTags] = useState<PropertyDetails[]>([]);
  const [filteredPhotoTags, setFilteredPhotoTags] = useState<PropertyDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch photo tags - this will re-run when refreshTrigger changes
  const fetchPhotoTags = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Refreshing photo tags using property_details_view...');

      // Fetch with bounds using the view
      const { data, error } = await supabase
        .from('property_details_view')
        .select('*')
        .gte('latitude', manoloFortichBounds.getSouthWest().lat)
        .lte('latitude', manoloFortichBounds.getNorthEast().lat)
        .gte('longitude', manoloFortichBounds.getSouthWest().lng)
        .lte('longitude', manoloFortichBounds.getNorthEast().lng);

      if (error) {
        console.error('Error fetching photo tags from view:', error);
      } else if (data) {
        console.log('Refreshed photo tags from view:', data.length);
        
        setPhotoTags(data);
        setFilteredPhotoTags(data);
        
        // Pass the photo tags back to parent component for filter counts
        if (onPhotoTagsLoaded) {
          onPhotoTagsLoaded(data);
        }
      }
    } catch (error) {
      console.error('Error loading photo tags:', error);
    } finally {
      setLoading(false);
    }
  }, [onPhotoTagsLoaded]);

  // Initial load and refresh when trigger changes
  useEffect(() => {
    fetchPhotoTags();
  }, [fetchPhotoTags, refreshTrigger]); // Add refreshTrigger to dependencies

  // Filter and search functionality
  useEffect(() => {
    const filterAndSearchTags = () => {
      console.log('Starting filter and search with view data...');
      if (!searchQuery.trim() && currentFilter === 'all') {
        setFilteredPhotoTags(photoTags);
        return;
      }

      const filtered = [];
      const query = searchQuery.toLowerCase().trim();

      for (const tag of photoTags) {
        try {
          // Apply filter first
          if (currentFilter !== 'all') {
            const matchesFilter = 
              (currentFilter === 'land' && tag.kind_id === '1') ||
              (currentFilter === 'building' && tag.kind_id === '2') ||
              (currentFilter === 'equipment' && tag.kind_id === '3');

            if (!matchesFilter) {
              continue;
            }
          }

          // Apply search using safeIncludes helper - ALL PROPERTY FIELDS
          if (searchQuery.trim()) {
            const matchesSearch = 
              safeIncludes(tag.tag_id, query) ||
              safeIncludes(tag.latitude, query) ||
              safeIncludes(tag.longitude, query) ||
              safeIncludes(tag.date_taken, query) ||
              safeIncludes(tag.created_at, query) ||
              safeIncludes(tag.form_id, query) ||
              safeIncludes(tag.kind_id, query) ||
              safeIncludes(tag.class_id, query) ||
              safeIncludes(tag.area, query) ||
              safeIncludes(tag.status, query) ||
              safeIncludes(tag.declarant_firstname, query) ||
              safeIncludes(tag.declarant_lastname, query) ||
              safeIncludes(tag.district_name, query);

            if (!matchesSearch) {
              continue;
            }
          }

          filtered.push(tag);
        } catch (error) {
          console.log(`Error filtering tag ${tag.tag_id}:`, error);
        }
      }

      console.log(`Filtered results: ${filtered.length} tags`);
      setFilteredPhotoTags(filtered);
    };

    if (photoTags.length > 0) {
      filterAndSearchTags();
    }
  }, [photoTags, searchQuery, currentFilter]);

  // ZOOM HANDLING LOGIC
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
      {!loading && filteredPhotoTags.map((tag) => (
        <Marker
          key={tag.tag_id}
          position={[tag.latitude, tag.longitude]}
          icon={createCustomIcon(tag)}
          eventHandlers={{
            click: () => {
              onMarkerClick(tag.tag_id);
            }
          }}
        >
          <Popup>
            <div className="property-popup">
              <div className="popup-header">
                <span className="popup-title">Property Details</span>
                {tag.status === 'New' && <span className="new-badge">NEW</span>}
              </div>
              <div className="popup-details">
                <p><strong>Form ID:</strong> {tag.form_id || 'N/A'}</p>
                <p><strong>Declarant:</strong> {tag.declarant_firstname || 'N/A'} {tag.declarant_lastname || ''}</p>
                <p><strong>District:</strong> {tag.district_name || 'N/A'}</p>
                <p>
                  <strong>Status:</strong> 
                  <span className={`status-indicator ${getStatusClass(tag.status)}`}></span>
                  {getStatusText(tag.status)}
                </p>
                <p><strong>Type:</strong> {tag.kind_id || 'N/A'} - {tag.class_id || 'N/A'}</p>
                {tag.area && <p><strong>Area:</strong> {tag.area} sqm</p>}
                {tag.date_taken && (
                  <p><strong>Date Taken:</strong> {new Date(tag.date_taken).toLocaleDateString()}</p>
                )}
                <p><strong>Coordinates:</strong> {tag.latitude.toFixed(6)}, {tag.longitude.toFixed(6)}</p>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

// Main Map Component
const MapCon: React.FC<MapConProps> = ({ searchQuery = '', isAdmin = false }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<string>('all');
  const [photoTags, setPhotoTags] = useState<PropertyDetails[]>([]);
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger state

  useEffect(() => {
    setIsMounted(true);
    
    // Refresh data when component mounts (when navigating to map)
    setRefreshTrigger(prev => prev + 1);
    
    return () => setIsMounted(false);
  }, []);

  // Refresh when search query changes
  useEffect(() => {
    setRefreshTrigger(prev => prev + 1);
  }, [searchQuery]);

  const handleMarkerClick = (tagId: string) => {
    setSelectedTagId(tagId);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedTagId(null);
  };

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
  };

  const handleToggleSatellite = () => {
    setIsSatelliteView(!isSatelliteView);
  };

  // Use useCallback to memoize the callback function
  const handlePhotoTagsLoaded = useCallback((tags: PropertyDetails[]) => {
    console.log('Received photo tags in parent:', tags.length);
    setPhotoTags(tags);
  }, []);

  const currentTileUrl = isSatelliteView ? SATELLITE_URL : OPENSTREETMAP_URL;
  const currentAttribution = isSatelliteView 
    ? 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className="map-content" style={{ height: '100vh', width: '100%', overflow: 'hidden', position: 'relative' }}>
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
            url={currentTileUrl}
            attribution={currentAttribution}
          />
          
          <MapLogic 
            onMarkerClick={handleMarkerClick} 
            searchQuery={searchQuery}
            currentFilter={currentFilter}
            isSatelliteView={isSatelliteView}
            onPhotoTagsLoaded={handlePhotoTagsLoaded}
            refreshTrigger={refreshTrigger} // Pass refresh trigger
          />

          {/* Satellite Toggle Control */}
          <SatelliteToggleControl 
            isSatelliteView={isSatelliteView}
            onToggle={handleToggleSatellite}
          />

          {/* Filter Control */}
          <FilterControl 
            onFilterChange={handleFilterChange}
            currentFilter={currentFilter}
            photoTags={photoTags}
          />
        </MapContainer>
      )}

      {/* Custom Popup Overlay */}
      {showPopup && selectedTagId && (
        <>
          {/* Overlay background */}
          <div 
            className="popup-overlay" 
            onClick={handleClosePopup}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999
            }}
          />
          {/* Popup content */}
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
        </>
      )}
    </div>
  );
};

export default MapCon;