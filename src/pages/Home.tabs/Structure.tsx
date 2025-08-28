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
import { useLocation } from 'react-router-dom';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';
import StructureCreateModal from '../../components/StructureModals/StructureCreateModal'; // Import the modal

// Define the type for the kind data
interface KindData {
  kind_id: number;
  description: string;
}

// Define the type for the location state
interface LocationState {
  kindData?: KindData;
}

const Structure: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false); // State for modal
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const location = useLocation();
  
  // Get kind_id from URL parameters
  const queryParams = new URLSearchParams(location.search);
  const kindId = queryParams.get('kind_id');
  
  // Get kind data from navigation state with proper typing
  const locationState = location.state as LocationState;
  const kindData = locationState?.kindData;

  const handleAddClick = () => {
    setShowCreateModal(true);
  };

  const handleStructureCreated = () => {
    // Refresh the structure list here when implemented
    console.log('Structure created, refresh list');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            {kindData ? `Structure - ${kindData.description}` : 'Structure Setup'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search structures..."
                debounce={0}
              />

              <div className="icon-group">
                <IonIcon
                  icon={add}
                  className="icon-yellow"
                  title="Add Structure"
                  onClick={handleAddClick}
                />
                <IonIcon
                  icon={arrowUpCircle}
                  className="icon-yellow icon-disabled"
                  title="Edit Structure"
                />
                <IonIcon
                  icon={trash}
                  className="icon-yellow icon-disabled"
                  title="Delete Structure"
                />
              </div>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              {/* Table component will go here */}
              <div style={{ textAlign: 'center', padding: '20px' }}>
                {kindId ? (
                  <p>Showing structures for Kind ID: {kindId} ({kindData?.description})</p>
                ) : (
                  <p>Structure data will appear here</p>
                )}
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Structure Create Modal */}
        {kindId && (
          <StructureCreateModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onStructureCreated={handleStructureCreated}
            kind_id={kindId}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default Structure;