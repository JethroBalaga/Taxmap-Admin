import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
  IonSearchbar,
  IonToast,
  IonLoading,
  IonAlert,
  IonButtons,
  IonButton // Add this import
} from '@ionic/react';
import { add, arrowUpCircle, trash, arrowBack } from 'ionicons/icons'; // Add arrowBack
import './../../CSS/Setup.css';
import { useLocation, useHistory } from 'react-router-dom';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import EquipmentCreateModal from '../../components/EquipmentModals/EquipmentCreateModal';
import EquipmentUpdateModal from '../../components/EquipmentModals/EquipmentUpdateModal';

// Define the Equipment interface
interface Equipment {
  equipment_id: string;
  machine_type: string;
  created_at: string;
}

const Equipment: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [selectedRow, setSelectedRow] = useState<Equipment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const location = useLocation();
  const history = useHistory();

  // Reset state when location changes
  useEffect(() => {
    setSelectedRow(null);
    setSearchTerm('');
  }, [location.pathname]);

  // Fetch equipment data from Supabase
  const fetchEquipmentData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEquipmentData(data || []);
    } catch (error) {
      console.error('Error fetching equipment data:', error);
      setToastMessage('Failed to load equipment data');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data when component mounts
  useEffect(() => {
    fetchEquipmentData();
  }, [fetchEquipmentData]);

  // Filter data based on search term using useMemo for better performance
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return equipmentData;

    const term = searchTerm.toLowerCase();
    return equipmentData.filter(item =>
      item.equipment_id.toLowerCase().includes(term) ||
      item.machine_type.toLowerCase().includes(term)
    );
  }, [searchTerm, equipmentData]);

  const handleRowClick = (rowData: Equipment) => {
    setSelectedRow(rowData);
  };

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleUpdateClick = () => {
    if (selectedRow) {
      setIsUpdateModalOpen(true);
    }
  };

  const handleDeleteClick = () => {
    if (selectedRow) {
      setShowDeleteAlert(true);
    }
  };

  // Add back button handler
  const handleBackClick = () => {
    history.push('/menu/home'); // Adjust this path to your main menu
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('equipment_id', selectedRow.equipment_id);

      if (error) throw error;

      await fetchEquipmentData();
      setSelectedRow(null);
      setToastMessage('Equipment deleted successfully!');
      setIsError(false);
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting equipment:', error);
      setToastMessage('Failed to delete equipment');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
      setShowDeleteAlert(false);
    }
  };

  const handleEquipmentCreated = () => {
    fetchEquipmentData();
    setIsCreateModalOpen(false); // Close modal after creation
    setToastMessage('Equipment created successfully!');
    setIsError(false);
    setShowToast(true);
  };

  const handleEquipmentUpdated = () => {
    fetchEquipmentData();
    setSelectedRow(null);
    setIsUpdateModalOpen(false); // Close modal after update
    setToastMessage('Equipment updated successfully!');
    setIsError(false);
    setShowToast(true);
  };

  const iconButtons = [
    { 
      icon: add, 
      onClick: handleCreateClick, 
      title: "Add Equipment" 
    },
    { 
      icon: arrowUpCircle, 
      onClick: handleUpdateClick, 
      disabled: !selectedRow,
      title: "Edit Equipment" 
    },
    { 
      icon: trash, 
      onClick: handleDeleteClick, 
      disabled: !selectedRow,
      title: "Delete Equipment" 
    }
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {/* Add back button to header */}
          <IonButtons slot="start">
            <IonButton onClick={handleBackClick}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>Equipment Setup</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search equipment..."
                value={searchTerm} // Add value for controlled input
                onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                debounce={200}
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
                title="Equipment List"
                keyField="equipment_id"
                onRowClick={handleRowClick}
                selectedRow={selectedRow}
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading isOpen={isLoading} message="Loading..." />

        {/* Equipment Create Modal */}
        <EquipmentCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onEquipmentCreated={handleEquipmentCreated}
        />

        {/* Equipment Update Modal */}
        {selectedRow && (
          <EquipmentUpdateModal
            isOpen={isUpdateModalOpen}
            onClose={() => setIsUpdateModalOpen(false)}
            onEquipmentUpdated={handleEquipmentUpdated}
            equipmentData={selectedRow}
          />
        )}

        {/* Delete Confirmation Alert */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={'Confirm Delete'}
          message={`Are you sure you want to delete equipment <strong>${selectedRow?.equipment_id}</strong>?`}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
            },
            {
              text: 'Delete',
              handler: handleDeleteConfirm
            }
          ]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={isError ? 'danger' : 'success'}
        />
      </IonContent>
    </IonPage>
  );
};

export default Equipment;