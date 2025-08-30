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
  IonLabel,
  IonToast
} from '@ionic/react';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';
import { useLocation } from 'react-router-dom';

interface ClassificationData {
  class_id: string;
  classification: string;
}

const ActualUsed: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const location = useLocation();
  const [selectedClassification, setSelectedClassification] = useState<ClassificationData | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Get the classification data from the route state or query params
  useEffect(() => {
    try {
      // Try to get data from location state first
      if (location.state) {
        // Handle different possible structures
        const stateData = location.state as any;
        
        if (stateData.classificationData) {
          setSelectedClassification(stateData.classificationData);
        } else if (stateData.class_id && stateData.classification) {
          setSelectedClassification({
            class_id: stateData.class_id,
            classification: stateData.classification
          });
        } else if (stateData.class_id) {
          setSelectedClassification({
            class_id: stateData.class_id,
            classification: `Classification ${stateData.class_id}`
          });
        }
      } 
      // If no state data, try to get from URL query params
      else {
        const searchParams = new URLSearchParams(location.search);
        const classId = searchParams.get('class_id');
        
        if (classId) {
          setSelectedClassification({
            class_id: classId,
            classification: `Classification ${classId}`
          });
        } else {
          setToastMessage('No classification data provided');
          setShowToast(true);
        }
      }
    } catch (error) {
      console.error('Error parsing classification data:', error);
      setToastMessage('Error loading classification data');
      setShowToast(true);
    }
  }, [location]);

  const iconButtons = [
    { icon: add, onClick: () => {}, disabled: false, title: "Add Actual Used" },
    { icon: arrowUpCircle, onClick: () => {}, disabled: true, title: "Edit Actual Used" },
    { icon: trash, onClick: () => {}, disabled: true, title: "Delete Actual Used" },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Actual Used Setup</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search actual used items..."
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

          {/* Display the selected classification information */}
          {selectedClassification ? (
            <IonRow>
              <IonCol size="12">
                <div style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px', margin: '10px 0' }}>
                  <IonLabel>
                    <h3>Selected Classification:</h3>
                    <p><strong>ID:</strong> {selectedClassification.class_id}</p>
                    <p><strong>Name:</strong> {selectedClassification.classification}</p>
                  </IonLabel>
                </div>
              </IonCol>
            </IonRow>
          ) : (
            <IonRow>
              <IonCol size="12">
                <div style={{ padding: '10px', backgroundColor: '#fff3cd', borderRadius: '5px', margin: '10px 0', color: '#856404' }}>
                  <IonLabel>
                    <h3>No Classification Selected</h3>
                    <p>Please select a classification first from the Classification page.</p>
                  </IonLabel>
                </div>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color="warning"
        />
      </IonContent>
    </IonPage>
  );
};

export default ActualUsed;