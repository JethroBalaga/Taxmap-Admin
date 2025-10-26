import React, { useEffect, useRef, useState, useCallback } from 'react';
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

// Import marker icons for filter panel
import buildingMarkerIconUrl from '../Images/Building.png';
import equipmentMarkerIconUrl from '../Images/Equipment.png';
import landMarkerIconUrl from '../Images/Land.png';

interface PhotoTag {
  tag_id: string;
  latitude: number;
  longitude: number;
  date_taken: string;
  created_at: string;
  accuracy?: number;
  altitude?: number;
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

// Filter Control Component
const FilterControl = ({ 
  onFilterChange,
  currentFilter,
  photoTags
}: { 
  onFilterChange: (filter: string) => void;
  currentFilter: string;
  photoTags: PhotoTag[];
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
      const counts = {
        all: photoTags.length,
        land: 0,
        building: 0,
        equipment: 0
      };

      for (const tag of photoTags) {
        try {
          const { data: valueInfoData } = await supabase
            .from('value_info')
            .select('form_id')
            .eq('tag_id', tag.tag_id)
            .single();

          if (valueInfoData) {
            const { data: formData } = await supabase
              .from('formtbl')
              .select('kind_id')
              .eq('form_id', valueInfoData.form_id)
              .single();

            if (formData) {
              const kindStr = String(formData.kind_id).trim();
              switch (kindStr) {
                case '1':
                case 'LAND':
                case 'land':
                  counts.land++;
                  break;
                case '2':
                case 'BUILDING':
                case 'building':
                  counts.building++;
                  break;
                case '3':
                case 'MACHINERY':
                case 'machinery':
                case 'EQUIPMENT':
                case 'equipment':
                  counts.equipment++;
                  break;
              }
            }
          }
        } catch (error) {
          console.log(`Error counting marker for ${tag.tag_id}:`, error);
        }
      }

      setMarkerCounts(counts);
    };

    if (photoTags.length > 0) {
      loadCounts();
    }
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
  currentFilter = 'all'
}: { 
  onMarkerClick: (tagId: string) => void;
  searchQuery?: string;
  currentFilter?: string;
}) => {
  const map = useMap();
  const [allowZoomOut, setAllowZoomOut] = useState(false);
  const [photoTags, setPhotoTags] = useState<PhotoTag[]>([]);
  const [filteredPhotoTags, setFilteredPhotoTags] = useState<PhotoTag[]>([]);
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
          setFilteredPhotoTags(data);
          
          // Fetch kind information for each tag to determine icons
          await fetchKindInfoForTags(data);
        }
      } catch (error) {
        console.error('Error loading photo tags:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch kind information for tags
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

  // Filter and search functionality
  useEffect(() => {
    const filterAndSearchTags = async () => {
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
            const { data: valueInfoData } = await supabase
              .from('value_info')
              .select('form_id')
              .eq('tag_id', tag.tag_id)
              .single();

            if (valueInfoData) {
              const { data: formData } = await supabase
                .from('formtbl')
                .select('kind_id')
                .eq('form_id', valueInfoData.form_id)
                .single();

              if (formData) {
                const kindStr = String(formData.kind_id).trim();
                const matchesFilter = 
                  (currentFilter === 'land' && 
                    (kindStr === '1' || kindStr === 'LAND' || kindStr === 'land')) ||
                  (currentFilter === 'building' && 
                    (kindStr === '2' || kindStr === 'BUILDING' || kindStr === 'building')) ||
                  (currentFilter === 'equipment' && 
                    (kindStr === '3' || kindStr === 'MACHINERY' || kindStr === 'machinery' || 
                     kindStr === 'EQUIPMENT' || kindStr === 'equipment'));

                if (!matchesFilter) {
                  continue;
                }
              }
            }
          }

          // Apply search using safeIncludes helper
          if (searchQuery.trim()) {
            let matchesSearch = false;
            
            // Search in tag metadata with safe null checks
            matchesSearch = 
              safeIncludes(tag.tag_id, query) ||
              safeIncludes(tag.latitude, query) ||
              safeIncludes(tag.longitude, query) ||
              safeIncludes(tag.date_taken, query) ||
              safeIncludes(tag.created_at, query);

            // Search in form data if needed
            if (!matchesSearch) {
              const { data: valueInfoData } = await supabase
                .from('value_info')
                .select('form_id')
                .eq('tag_id', tag.tag_id)
                .single();

              if (valueInfoData) {
                const { data: formData } = await supabase
                  .from('formtbl')
                  .select('*')
                  .eq('form_id', valueInfoData.form_id)
                  .single();

                if (formData) {
                  matchesSearch = 
                    safeIncludes(formData.form_id, query) ||
                    safeIncludes(formData.kind_id, query) ||
                    safeIncludes(formData.class_id, query) ||
                    safeIncludes(formData.area, query);
                }
              }
            }

            if (!matchesSearch) {
              continue;
            }
          }

          filtered.push(tag);
        } catch (error) {
          console.log(`Error filtering tag ${tag.tag_id}:`, error);
        }
      }

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
              <small>Tag ID: {tag.tag_id?.substring(0, 8)}...</small>
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
  const [photoTags, setPhotoTags] = useState<PhotoTag[]>([]);

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

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    console.log(`Filter changed to: ${filter}`);
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
          
          <MapLogic 
            onMarkerClick={handleMarkerClick} 
            searchQuery={searchQuery}
            currentFilter={currentFilter}
          />

          {/* Filter Control - Show for admin users */}
          <FilterControl 
            onFilterChange={handleFilterChange}
            currentFilter={currentFilter}
            photoTags={photoTags}
          />

          {/* No Create Button - Admin is view-only */}
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