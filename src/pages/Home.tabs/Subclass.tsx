import { 
      IonContent, 
      IonHeader, 
      IonPage, 
      IonTitle, 
      IonToolbar 
  } from '@ionic/react';
  
  const Subclass: React.FC = () => {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Subclass Setup</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
        </IonContent>
      </IonPage>
    );
  };
  
  export default Subclass;