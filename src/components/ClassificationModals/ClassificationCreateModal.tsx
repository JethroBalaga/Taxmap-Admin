import React, { useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import Input from '../Globalcomponents/Input';
import './../../CSS/ClassificationCreateModal.css';
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
    setCode('');
    setClassification('');
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      className="classification-modal"
    >
      <IonHeader>
        <IonToolbar className="modal-header">
          <IonTitle className="modal-title">Create New Classification</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="modal-content">
        {/* Remove ion-justify-content-center from here */}
        <IonGrid className="form-grid">
          <IonRow>
            {/* Remove size constraints that might cause centering */}
            <IonCol className="form-column">
              <div className="input-wrapper">
                <Input
                  label="Code"
                  value={code}
                  onChange={setCode}
                  placeholder="Enter classification code"
                  className="modal-input"
                />
              </div>
              
              <div className="input-wrapper">
                <Input
                  label="Classification"
                  value={classification}
                  onChange={setClassification}
                  placeholder="Enter classification name"
                  className="modal-input"
                />
              </div>

              <div className="button-group">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  className="cancel-btn"
                >
                  Cancel
                </Button>
                
                <Button 
                  variant="primary"
                  onClick={handleCreate}
                  disabled={!code || !classification}
                  className="create-btn"
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