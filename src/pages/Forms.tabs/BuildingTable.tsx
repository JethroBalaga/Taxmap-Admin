import React, { useState, useRef } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
} from '@ionic/react';
import '../../CSS/Setup.css';
import { useLocation } from 'react-router-dom';

interface RouteParams {
  formId: string;
}

const BuildingTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const location = useLocation();
  
  // Get the passed parameters
  const { formId} = location.state as RouteParams || {};

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Building Details</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search buildings..."
                onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                debounce={300}
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default BuildingTable;