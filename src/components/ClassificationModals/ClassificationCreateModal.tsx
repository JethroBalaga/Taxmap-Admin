import React, { useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonLoading,
  IonToast
} from '@ionic/react';
import Input from '../Globalcomponents/Input';
import './../../CSS/Modal.css';
import Button from '../Globalcomponents/Button';
import { supabase } from './../../utils/supaBaseClient';

interface ClassificationCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassificationCreated?: () => void; // Made optional
}

const ClassificationCreateModal: React.FC<ClassificationCreateModalProps> = ({
  isOpen,
  onClose,
  onClassificationCreated = () => {}, // Default empty function
}) => {
  const [code, setCode] = useState('');
  const [classification, setClassification] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleCreate = async () => {
    if (!code || !classification) return;

    setIsLoading(true);
    
    try {
      // Check if classification code already exists
      const { data: existingData, error: existingError } = await supabase
        .from('classtbl')
        .select('class_id')
        .eq('class_id', code)
        .maybeSingle();

      if (existingData) {
        throw new Error('Classification code already exists');
      }

      // Insert new classification
      const { data, error } = await supabase
        .from('classtbl')
        .insert([{ 
          class_id: code, 
          classification: classification 
        }])
        .select();

      if (error) throw error;

      setToastMessage('Classification created successfully!');
      setCode('');
      setClassification('');
      onClassificationCreated(); // Safe to call now
      setTimeout(onClose, 1000);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create classification';
      setToastMessage(errorMessage);
      setIsError(true);
      console.error('Error creating classification:', error);
    } finally {
      setIsLoading(false);
      setShowToast(true);
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value.toUpperCase());
  };

  return (
    <>
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
          <IonGrid className="form-grid">
            <IonRow>
              <IonCol className="form-column">
                <div className="input-wrapper">
                  <Input
                    label="Code"
                    value={code}
                    onChange={handleCodeChange}
                    placeholder="Enter classification code (e.g., R, I)"
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
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  
                  <Button 
                    variant="primary"
                    onClick={handleCreate}
                    disabled={!code || !classification || isLoading}
                    className="create-btn"
                  >
                    {isLoading ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonModal>

      <IonLoading isOpen={isLoading} message="Creating classification..." />
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color={isError ? 'green' : 'success'}
      />
    </>
  );
};

export default ClassificationCreateModal;