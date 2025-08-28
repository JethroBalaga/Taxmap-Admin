import React from 'react';
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
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';

const Structure: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Structure Setup</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                placeholder="Search structures..."
                debounce={0}
              />

              <div className="icon-group">
                <IonIcon
                  icon={add}
                  className="icon-yellow"
                  title="Add Structure"
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
                Structure data will appear here
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Structure;