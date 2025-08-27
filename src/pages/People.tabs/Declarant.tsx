import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonSearchbar
} from '@ionic/react';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';
import DeclarantCreateModal from '../../components/DeclarantModals/DeclarantCreateModal';

const Declarant: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const iconButtons = [
    { 
      icon: add, 
      onClick: () => setShowCreateModal(true), 
      disabled: false, 
      title: "Add Declarant" 
    },
    { 
      icon: arrowUpCircle, 
      onClick: () => console.log('Edit clicked'), 
      disabled: true, 
      title: "Edit Declarant" 
    },
    { 
      icon: trash, 
      onClick: () => console.log('Delete clicked'), 
      disabled: true, 
      title: "Delete Declarant" 
    }
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Declarant</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                placeholder="Search declarants..."
                onIonInput={(e) => console.log('Search:', e.detail.value)}
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
              {/* Table content will go here later */}
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                Declarant table content will appear here
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        <DeclarantCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onDeclarantCreated={() => console.log('Declarant created - refresh data here')}
        />
      </IonContent>
    </IonPage>
  );
};

export default Declarant;