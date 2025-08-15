import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  IonSearchbar,
  IonAlert
} from '@ionic/react';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../utils/supaBaseClient';
import BarangayCreateModal from '../../components/BarangayModals/BarangayCreateModal';
import BarangayUpdateModal from '../../components/BarangayModals/BarangayUpdateModal';

interface BarangayItem {
  barangay_id: string;
  barangay: string;
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
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
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
      item.barangay.toLowerCase().includes(term)
    );
  }, [barangays, searchTerm]);

  const handleRowClick = (rowData: BarangayItem) => {
    setSelectedRow(rowData);
  };

  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  const handleEditClick = () => {
    if (selectedRow) {
      setShowUpdateModal(true);
    }
  };

  const handleDeleteClick = () => {
    if (selectedRow) {
      setShowDeleteAlert(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('barangaytbl')
        .delete()
        .eq('barangay_id', selectedRow.barangay_id);

      if (error) throw error;

      setSelectedRow(null);
      fetchBarangays();
    } catch (error) {
      console.error('Error deleting barangay:', error);
    } finally {
      setIsLoading(false);
      setShowDeleteAlert(false);
    }
  };

  const handleBarangayCreated = () => {
    fetchBarangays();
    setShowCreateModal(false);
  };

  const handleBarangayUpdated = () => {
    fetchBarangays();
    setSelectedRow(null);
    setShowUpdateModal(false);
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
      onClick: handleEditClick,
      disabled: !selectedRow,
      title: "Edit Barangay"
    },
    {
      icon: trash,
      onClick: handleDeleteClick,
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

        <BarangayUpdateModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          barangayData={selectedRow ? {
            barangay_id: selectedRow.barangay_id,
            barangay_name: selectedRow.barangay,  // Map barangay to barangay_name
            district_id: selectedRow.district_id
          } : null}
          onBarangayUpdated={handleBarangayUpdated}
        />

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Delete Barangay"
          message={`Are you sure you want to delete ${selectedRow?.barangay}?`}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel'
            },
            {
              text: 'Delete',
              handler: handleDeleteConfirm
            }
          ]}
        />

        <IonLoading isOpen={isLoading} message="Loading..." />
      </IonContent>
    </IonPage>
  );
};

export default Barangay;