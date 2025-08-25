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

interface KindCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKindCreated?: () => void;
}

const KindCreateModal: React.FC<KindCreateModalProps> = ({
  isOpen,
  onClose,
  onKindCreated = () => {},
}) => {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleCreate = async () => {
    if (!description.trim()) return;

    setIsLoading(true);
    
    try {
      // Insert new kind (ID is auto-incremented)
      const { data, error } = await supabase
        .from('kindtbl')
        .insert([{ 
          description: description.toUpperCase() // Convert to uppercase
        }])
        .select();

      if (error) throw error;

      setToastMessage('Kind created successfully!');
      setDescription('');
      onKindCreated();
      setTimeout(onClose, 1000);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create kind';
      setToastMessage(errorMessage);
      setIsError(true);
      console.error('Error creating kind:', error);
    } finally {
      setIsLoading(false);
      setShowToast(true);
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value.toUpperCase()); // Convert to uppercase
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
            <IonTitle className="modal-title">Create New Kind</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="modal-content">
          <IonGrid className="form-grid">
            <IonRow>
              <IonCol className="form-column">
                <div className="input-wrapper">
                  <Input
                    label="Description"
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Enter kind description"
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
                    disabled={!description.trim() || isLoading}
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

      <IonLoading isOpen={isLoading} message="Creating kind..." />
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color={isError ? 'danger' : 'success'}
      />
    </>
  );
};

export default KindCreateModal;