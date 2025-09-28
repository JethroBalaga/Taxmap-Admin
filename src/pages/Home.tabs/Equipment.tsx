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
} from '@ionic/react';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';
import { useLocation } from 'react-router-dom';
import EquipmentCreateModal from '../../components/EquipmentModals/EquipmentCreateModal';

const Equipment: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const location = useLocation();
  const [kindData, setKindData] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleEquipmentCreated = () => {
    setToastMessage('Equipment created successfully!');
    setShowToast(true);
  };

  const iconButtons = [
    { icon: add, onClick: handleCreateClick, title: "Add Equipment" },
    { icon: arrowUpCircle, onClick: () => {}, title: "Edit Equipment" },
    { icon: trash, onClick: () => {}, title: "Delete Equipment" },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            Equipment Setup
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
                    onClick={btn.onClick}
                    title={btn.title}
                  />
                ))}
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Equipment Create Modal */}
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