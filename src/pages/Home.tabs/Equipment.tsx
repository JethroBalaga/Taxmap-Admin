import React, { useState, useRef, useEffect } from 'react';
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
} from '@ionic/react';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';
import { useLocation } from 'react-router-dom';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import EquipmentCreateModal from '../../components/EquipmentModals/EquipmentCreateModal';

// Define the Equipment interface
interface Equipment {
  equipment_id: string;
  machine_type: string;
  created_at: string;
}

const Equipment: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [filteredData, setFilteredData] = useState<Equipment[]>([]);
  const [selectedRow, setSelectedRow] = useState<Equipment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const location = useLocation();

  // Fetch equipment data from Supabase
  const fetchEquipmentData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEquipmentData(data || []);
      setFilteredData(data || []);
    } catch (error) {
      console.error('Error fetching equipment data:', error);
      setToastMessage('Failed to load equipment data');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchEquipmentData();
  }, []);

  // Filter data based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(equipmentData);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = equipmentData.filter(item =>
        item.equipment_id.toLowerCase().includes(term) ||
        item.machine_type.toLowerCase().includes(term)
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, equipmentData]);

  const handleRowClick = (rowData: Equipment) => {
    setSelectedRow(rowData);
  };

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleEquipmentCreated = () => {
    fetchEquipmentData(); // Refresh the data
    setToastMessage('Equipment created successfully!');
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
      onClick: () => { 
        if (selectedRow) {
          setToastMessage('Edit functionality to be implemented'); 
          setShowToast(true);
        }
      }, 
      disabled: !selectedRow,
      title: "Edit Equipment" 
    },
    { 
      icon: trash, 
      onClick: () => { 
        if (selectedRow) {
          setToastMessage('Delete functionality to be implemented'); 
          setShowToast(true);
        }
      }, 
      disabled: !selectedRow,
      title: "Delete Equipment" 
    },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
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

        <IonLoading isOpen={isLoading} message="Loading equipment..." />

        <EquipmentCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onEquipmentCreated={handleEquipmentCreated}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default Equipment;