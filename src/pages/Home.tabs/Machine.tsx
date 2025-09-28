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
} from '@ionic/react';
import { add, arrowUpCircle, trash, arrowBack } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import './../../CSS/Setup.css';

// Define the type for the location state
interface LocationState {
  equipmentData?: {
    equipment_id: string;
    machine_type: string;
  };
}

const Machine: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
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

  const iconButtons = [
    { icon: add, title: "Add Machine" },
    { icon: arrowUpCircle, title: "Edit Machine" },
    { icon: trash, title: "Delete Machine" },
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
                    title={btn.title}
                  />
                ))}
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Machine;