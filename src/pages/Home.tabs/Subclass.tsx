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
  IonSearchbar
} from '@ionic/react';
import React, { useState, useRef} from 'react';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';

const Subclass: React.FC = () => {
  // State will be added here later
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Placeholder for icon buttons (functionality to be added later)
  const iconButtons = [
    { 
      icon: add, 
      onClick: () => console.log('Add clicked'), 
      disabled: false, 
      title: "Add Subclass" 
    },
    { 
      icon: arrowUpCircle, 
      onClick: () => console.log('Edit clicked'), 
      disabled: true,  // Disabled by default until a row is selected
      title: "Edit Subclass" 
    },
    { 
      icon: trash, 
      onClick: () => console.log('Delete clicked'), 
      disabled: true,  // Disabled by default until a row is selected
      title: "Delete Subclass" 
    },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Subclass Setup</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search subclasses..."
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
              {/* DynamicTable will be added here later */}
              <p>Table content will go here</p>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Modals and alerts will be added here later */}
      </IonContent>
    </IonPage>
  );
};

export default Subclass;