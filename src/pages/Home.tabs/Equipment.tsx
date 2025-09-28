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
} from '@ionic/react';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';

const Equipment: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef<HTMLIonSearchbarElement>(null);

  const iconButtons = [
    { icon: add, title: "Add Equipment" },
    { icon: arrowUpCircle, title: "Edit Equipment" },
    { icon: trash, title: "Delete Equipment" },
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

export default Equipment;