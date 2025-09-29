import React, { useState, useRef } from 'react';
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
} from '@ionic/react';
import { add, arrowUpCircle, trash, arrowBack } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import './../../CSS/Setup.css';
import MachineCreateModal from '../../components/MachineModals/MachineCreateModal';

// Define the type for the location state
interface LocationState {
  equipmentData?: {
    equipment_id: string;
    machine_type: string;
  };
}

const Machine: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const history = useHistory();
  const location = useLocation();

  // Get equipment_id from URL parameters
  const queryParams = new URLSearchParams(location.search);
  const equipmentId = queryParams.get('equipment_id');

  // Get equipment data from navigation state
  const locationState = location.state as LocationState;
  const equipmentData = locationState?.equipmentData;

  const handleBackClick = () => {
    history.push('/menu/home/equipment');
  };

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleMachineCreated = () => {
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
      onClick: () => {}, 
      title: "Edit Machine" 
    },
    { 
      icon: trash, 
      onClick: () => {}, 
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
                debounce={0}
              />

              <div className="icon-group">
                {iconButtons.map((btn, index) => (
                  <IonIcon
                    key={index}
                    icon={btn.icon}
                    className="icon-yellow"
                    onClick={btn.onClick}
                    title={btn.title}
                  />
                ))}
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

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