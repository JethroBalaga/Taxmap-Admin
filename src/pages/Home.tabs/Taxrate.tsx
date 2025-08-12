import React, { useState, useRef, useEffect } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonSearchbar,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';
import TaxrateCreateModal from '../../components/TaxrateModals/TaxrateCreateModal';

const Taxrate: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const location = useLocation();

  // Get district_id from URL
  const queryParams = new URLSearchParams(location.search);
  const districtId = queryParams.get('district_id');

  // Debug: Verify districtId is captured
  useEffect(() => {
    console.log('District ID from URL:', districtId);
  }, [districtId]);

  // Focus search input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      searchRef.current?.setFocus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tax Rates - District {districtId}</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search tax rate"
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
                  onClick={() => console.log('Update clicked')}
                />
                <IonIcon 
                  icon={trash} 
                  className={`icon-yellow ${!selectedRow ? 'icon-disabled' : ''}`}
                  onClick={() => console.log('Delete clicked')}
                />
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Taxrate Create Modal */}
        {districtId && (
          <TaxrateCreateModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            district_id={districtId}
            onTaxrateCreated={() => {
              // Will implement refresh later
              console.log('Should refresh tax rates');
            }}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default Taxrate;