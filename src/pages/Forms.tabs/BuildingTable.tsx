import React, { useState, useRef } from 'react';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  IonIcon
} from '@ionic/react';
import { informationCircleOutline } from 'ionicons/icons';
import '../../CSS/Setup.css';

const BuildingTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef<HTMLIonSearchbarElement>(null);

  return (
    <div>
      <IonGrid>
        <IonRow>
          <IonCol size="12" className="search-container">
            <IonSearchbar
              ref={searchRef}
              placeholder="Search buildings..."
              onIonInput={(e) => setSearchTerm(e.detail.value || '')}
              debounce={300}
            />

            <div className="icon-group">
              <IonIcon
                icon={informationCircleOutline}
                className="icon-yellow"
                title="Building information"
              />
            </div>
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
};

export default BuildingTable;