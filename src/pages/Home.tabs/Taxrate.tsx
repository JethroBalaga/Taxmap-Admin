import React, { useState } from 'react';
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
  IonLoading,
  IonSearchbar,
  IonAlert,
  IonToast
} from '@ionic/react';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';

interface TaxrateItem {
  tax_id: string;
  tax_name: string;
  tax_rate: number;
  created_at?: string;
}

const Taxrate: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [taxrates, setTaxrates] = useState<TaxrateItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState<TaxrateItem | null>(null);
  const [selectedTaxrate, setSelectedTaxrate] = useState<TaxrateItem | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showCannotDeleteAlert, setShowCannotDeleteAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tax Rate Setup</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                placeholder="Search tax rates..."
                onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                debounce={0}
              />
              
              <div className="icon-group">
                <IonIcon 
                  icon={add} 
                  className="icon-yellow"
                  onClick={() => setShowCreateModal(true)} 
                />
                <IonIcon 
                  icon={arrowUpCircle} 
                  className={`icon-yellow ${!selectedRow ? 'icon-disabled' : ''}`}
                  onClick={() => {}}
                />
                <IonIcon 
                  icon={trash} 
                  className={`icon-yellow ${!selectedRow ? 'icon-disabled' : ''}`}
                  onClick={() => {}}
                />
              </div>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              {/* Placeholder for table - will be added later */}
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>Tax rate table will be displayed here</p>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading isOpen={isLoading} message="Loading..." />

        {/* Placeholder for create modal */}
        {showCreateModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>Create Tax Rate Modal</h3>
              <button onClick={() => setShowCreateModal(false)}>Close</button>
            </div>
          </div>
        )}

        {/* Placeholder for update modal */}
        {showUpdateModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>Update Tax Rate Modal</h3>
              <button onClick={() => setShowUpdateModal(false)}>Close</button>
            </div>
          </div>
        )}

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={'Confirm Delete'}
          message={`Are you sure you want to delete this tax rate?`}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
            },
            {
              text: 'Delete',
              handler: () => {}
            }
          ]}
        />

        <IonAlert
          isOpen={showCannotDeleteAlert}
          onDidDismiss={() => setShowCannotDeleteAlert(false)}
          header={'Cannot Delete'}
          message={`This tax rate cannot be deleted because it is being used in other records.`}
          buttons={['OK']}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
        />
      </IonContent>
    </IonPage>
  );
};

export default Taxrate;