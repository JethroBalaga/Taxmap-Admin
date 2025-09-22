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
  IonSearchbar,
  IonIcon
} from '@ionic/react';
import { informationCircleOutline } from 'ionicons/icons';
import '../CSS/Setup.css';

const Forms: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef<HTMLIonSearchbarElement>(null);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Forms</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search forms..."
                onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                debounce={0}
              />

              <div className="icon-group">
                <IonIcon
                  icon={informationCircleOutline}
                  className="icon-yellow"
                  title="Information"
                />
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Forms;