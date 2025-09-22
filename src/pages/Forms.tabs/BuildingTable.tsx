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
import { useLocation } from 'react-router-dom'; // Add this import

interface RouteParams {
  formId: string;
  classId: string;
  area: string;
}

const BuildingTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const location = useLocation(); // Add this hook
  
  // Get the passed parameters
  const { formId, classId, area } = location.state as RouteParams || {};

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
        
        {/* Display the passed parameters */}
        <IonRow>
          <IonCol>
            <p>Form ID: {formId || 'N/A'}</p>
            <p>Class ID: {classId || 'N/A'}</p>
            <p>Area: {area || 'N/A'}</p>
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
};

export default BuildingTable;