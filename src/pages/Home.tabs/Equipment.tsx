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
} from '@ionic/react';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';
import { useLocation } from 'react-router-dom';

const Equipment: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const location = useLocation();
  const [kindData, setKindData] = useState<any>(null);

  // Get kind data from location state when component mounts
  useEffect(() => {
    try {
      if (location.state) {
        const stateData = location.state as any;
        if (stateData.kindData) {
          setKindData(stateData.kindData);
        }
      }
    } catch (error) {
      console.error('Error parsing kind data:', error);
    }
  }, [location]);

  const iconButtons = [
    { icon: add, title: "Add Equipment" },
    { icon: arrowUpCircle, title: "Edit Equipment" },
    { icon: trash, title: "Delete Equipment" },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            {kindData ? `Equipment (${kindData.description})` : 'Equipment Setup'}
          </IonTitle>
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