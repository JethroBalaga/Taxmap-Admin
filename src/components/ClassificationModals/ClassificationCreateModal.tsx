import React, { useState } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol } from '@ionic/react';
import Input from '../Globalcomponents/Input';
import Button from '../Globalcomponents/Button';

interface ClassificationCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (code: string, classification: string) => void;
}

const ClassificationCreateModal: React.FC<ClassificationCreateModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [code, setCode] = useState('');
  const [classification, setClassification] = useState('');

  const handleCreate = () => {
    onCreate(code, classification);
    // Reset form after creation
    setCode('');
    setClassification('');
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Create New Classification</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6">
              <Input
                label="Code"
                value={code}
                onChange={setCode}
                placeholder="Enter classification code"
              />
              
              <Input
                label="Classification"
                value={classification}
                onChange={setClassification}
                placeholder="Enter classification name"
              />

              <div className="ion-margin-top ion-text-end">
                <Button
                  variant="secondary" 
                  onClick={onClose}
                  className="ion-margin-end"
                >
                  Cancel
                </Button>
                
                <Button 
                  variant="primary"
                  onClick={handleCreate}
                  disabled={!code || !classification}
                >
                  Create
                </Button>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonModal>
  );
};

export default ClassificationCreateModal;