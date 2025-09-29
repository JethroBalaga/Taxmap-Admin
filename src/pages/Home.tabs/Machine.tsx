import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  IonButton,
  IonButtons,
  IonLabel,
  IonToast,
  IonLoading,
} from '@ionic/react';
import { add, arrowUpCircle, trash, arrowBack } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import MachineCreateModal from '../../components/MachineModals/MachineCreateModal';

// Define the type for the location state
interface LocationState {
  equipmentData?: {
    equipment_id: string;
    machine_type: string;
  };
}

// Define the Machine interface
interface Machine {
  serial_no: string;
  machine_description: string;
  equipment_id: string;
  created_at: string;
}

const Machine: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [machineData, setMachineData] = useState<Machine[]>([]);
  const [filteredData, setFilteredData] = useState<Machine[]>([]);
  const [selectedRow, setSelectedRow] = useState<Machine | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const history = useHistory();
  const location = useLocation();

  // Get equipment_id from URL parameters
  const queryParams = new URLSearchParams(location.search);
  const equipmentId = queryParams.get('equipment_id');

  // Get equipment data from navigation state
  const locationState = location.state as LocationState;
  const equipmentData = locationState?.equipmentData;

  // Fetch machine data from Supabase
  const fetchMachineData = async () => {
    if (!equipmentId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('machine')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMachineData(data || []);
      setFilteredData(data || []);
    } catch (error) {
      console.error('Error fetching machine data:', error);
      setToastMessage('Failed to load machine data');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when component mounts or equipmentId changes
  useEffect(() => {
    if (equipmentId) {
      fetchMachineData();
    }
  }, [equipmentId]);

  // Filter data based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(machineData);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = machineData.filter(item =>
        item.serial_no.toLowerCase().includes(term) ||
        item.machine_description.toLowerCase().includes(term) ||
        item.equipment_id.toLowerCase().includes(term)
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, machineData]);

  const handleBackClick = () => {
    history.push('/menu/home/equipment');
  };

  const handleRowClick = (rowData: Machine) => {
    setSelectedRow(rowData);
  };

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleMachineCreated = () => {
    fetchMachineData(); // Refresh the data
    setToastMessage('Machine created successfully!');
    setShowToast(true);
  };

  const iconButtons = [
    { 
      icon: add, 
      onClick: handleCreateClick, 
      title: "Add Machine" 
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
      title: "Edit Machine" 
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
      title: "Delete Machine" 
    },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleBackClick}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>
            Machine Setup
          </IonTitle>
        </IonToolbar>
        {equipmentData && (
          <IonToolbar>
            <IonLabel className="structure-label">
              Equipment: {equipmentData.equipment_id} - {equipmentData.machine_type}
            </IonLabel>
          </IonToolbar>
        )}
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search machines..."
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
                title="Machine List"
                keyField="serial_no"
                onRowClick={handleRowClick}
                selectedRow={selectedRow}
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading isOpen={isLoading} message="Loading machines..." />

        {/* Machine Create Modal */}
        {equipmentData && (
          <MachineCreateModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onMachineCreated={handleMachineCreated}
            equipment_id={equipmentData.equipment_id}
          />
        )}

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

export default Machine;