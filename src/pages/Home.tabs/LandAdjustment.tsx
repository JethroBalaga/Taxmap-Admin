import React, { useState, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonSearchbar
} from '@ionic/react';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup2.css'; // Adjust path as needed
import LandAdjustmentCreateModal from '../../components/LandAdjustmentModals/LandAdjustmentCreateModal';
const LandAdjustment: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const searchRef = useRef<HTMLIonSearchbarElement>(null);

  // Functions for icons
  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  const handleArrowUpClick = () => {
    console.log('Edit functionality to be implemented');
  };

  const handleTrashClick = () => {
    console.log('Delete functionality to be implemented');
  };

  const handleLandAdjustmentCreated = () => {
    // Refresh your data here when needed
    console.log('Land adjustment created - refresh data');
    // You can add data refresh logic here later
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const iconButtons = [
    { icon: add, onClick: handleCreateClick, disabled: false, title: "Create New" },
    { icon: arrowUpCircle, onClick: handleArrowUpClick, disabled: false, title: "Edit" },
    { icon: trash, onClick: handleTrashClick, disabled: false, title: "Delete" }
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Residential Land</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search residential land..."
                value={searchTerm}
                onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                debounce={200}
              />

              <div className="icon-group">
                {iconButtons.map((btn, index) => (
                  <IonIcon
                    key={index}
                    icon={btn.icon}
                    className={`icon-yellow ${btn.disabled ? 'icon-disabled' : ''}`}
                    onClick={btn.onClick}
                    title={btn.title}
                  />
                ))}
              </div>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              {/* Add your table or list component here later */}
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                Residential Land data will be displayed here
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Land Adjustment Create Modal */}
        <LandAdjustmentCreateModal
          isOpen={showCreateModal}
          onClose={handleCloseCreateModal}
          onLandAdjustmentCreated={handleLandAdjustmentCreated}
        />
      </IonContent>
    </IonPage>
  );
};

export default LandAdjustment;