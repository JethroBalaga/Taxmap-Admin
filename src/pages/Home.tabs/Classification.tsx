import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { useState } from 'react';
import Input from '../../components/Globalcomponents/Input';
import Button from '../../components/Globalcomponents/Button';

const Classification: React.FC = () => {
  const [code, setCode] = useState('');
  const [classification, setClassification] = useState('');

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Classification Setup</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid className="ion-padding">
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6">
              <Input
                label="Code"
                value={code}
                onChange={setCode}
                placeholder="Enter code"
              />
              
              <Input
                label="Classification"
                value={classification}
                onChange={setClassification}
                placeholder="Enter classification"
              />
              
              <div className="ion-margin-top">
                <Button
                  variant="primary" 
                  fullWidth
                  onClick={() => console.log('Create clicked')}
                >
                  Create
                </Button>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Classification;