import React, { useState, useEffect, useRef, useMemo,useCallback,} from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonLoading,
  IonSearchbar
} from '@ionic/react';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../utils/supaBaseClient';
import BarangayCreateModal from '../../components/BarangayModals/BarangayCreateModal';

interface BarangayItem {
  barangay_id: string;
  barangay_name: string;
  district_id: number;
  created_at?: string;
}

const Barangay: React.FC = () => {
  const location = useLocation();
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [barangays, setBarangays] = useState<BarangayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState<BarangayItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const searchRef = useRef<HTMLIonSearchbarElement>(null);

  // Get district_id from URL params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('district_id');
    if (id) {
      setDistrictId(Number(id));
    }
  }, [location]);

  // Fetch barangays when districtId changes
  const fetchBarangays = useCallback(async () => {
    if (!districtId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('barangaytbl')
        .select('*')
        .eq('district_id', districtId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBarangays(data || []);
    } catch (error) {
      console.error('Error fetching barangays:', error);
    } finally {
      setIsLoading(false);
    }
  }, [districtId]);

  useEffect(() => {
    fetchBarangays();
  }, [fetchBarangays]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return barangays;

    const term = searchTerm.toLowerCase();
    return barangays.filter(item =>
      item.barangay_id.toLowerCase().includes(term) ||
      item.barangay_name.toLowerCase().includes(term)
    );
  }, [barangays, searchTerm]);

  const handleRowClick = (rowData: BarangayItem) => {
    setSelectedRow(rowData);
  };

  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  const handleBarangayCreated = () => {
    fetchBarangays();
    setShowCreateModal(false);
  };

  const iconButtons = [
    { 
      icon: add, 
      onClick: handleCreateClick, 
      disabled: false, 
      title: "Add Barangay" 
    },
    { 
      icon: arrowUpCircle, 
      onClick: () => {}, 
      disabled: !selectedRow, 
      title: "Edit Barangay" 
    },
    { 
      icon: trash, 
      onClick: () => {}, 
      disabled: !selectedRow, 
      title: "Delete Barangay" 
    },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            {districtId ? `Barangays (District ID: ${districtId})` : 'Barangays'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search barangays..."
                onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                debounce={0}
              />

              <div className="icon-group">
                {iconButtons.map((btn, index) => (
                  <IonIcon
                    key={index}
                    icon={btn.icon}
                    className={`icon-yellow ${btn.disabled ? 'icon-disabled' : ''}`}
                    onClick={btn.disabled ? undefined : btn.onClick}
                    title={btn.title}
                  />
                ))}
              </div>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <DynamicTable
                data={filteredData}
                title="Barangays"
                keyField="barangay_id"
                onRowClick={handleRowClick}
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <BarangayCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onBarangayCreated={handleBarangayCreated}
          district_id={districtId || 0}
        />

        <IonLoading isOpen={isLoading} message="Loading..." />
      </IonContent>
    </IonPage>
  );
};

export default Barangay;