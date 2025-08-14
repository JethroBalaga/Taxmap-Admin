import React from 'react';
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
import './../../CSS/Setup.css'; // Make sure this path is correct

const Barangay: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Barangay</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                placeholder="Search barangays..."
                debounce={0}
              />

              <div className="icon-group">
                <IonIcon
                  icon={add}
                  className="icon-yellow"
                  title="Add Barangay"
                />
                <IonIcon
                  icon={arrowUpCircle}
                  className="icon-yellow icon-disabled"
                  title="Edit Barangay"
                />
                <IonIcon
                  icon={trash}
                  className="icon-yellow icon-disabled"
                  title="Delete Barangay"
                />
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Barangay;