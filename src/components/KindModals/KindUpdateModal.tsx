import React, { useState, useEffect } from 'react';
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
  IonToast,
  IonIcon
} from '@ionic/react';
import { warning } from 'ionicons/icons';
import Input from '../Globalcomponents/Input';
import './../../CSS/Modal.css';
import Button from '../Globalcomponents/Button';
import { supabase } from './../../utils/supaBaseClient';

interface KindUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  kindData: { id: number; description: string } | null;
  onKindUpdated?: () => void;
}

const KindUpdateModal: React.FC<KindUpdateModalProps> = ({
  isOpen,
  onClose,
  kindData,
  onKindUpdated = () => {}
}) => {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsFormValid(description.trim() !== '');
  }, [description]);

  useEffect(() => {
    if (kindData) {
      setDescription(kindData.description);
      setIsFormValid(true);
    }
  }, [kindData]);

  const handleUpdate = async () => {
    if (!isFormValid || !kindData) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('kindtbl')
        .update({ description })
        .eq('id', kindData.id);

      if (error) throw error;

      setToastMessage('Kind updated successfully!');
      onKindUpdated();
      setTimeout(onClose, 1000);
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to update kind');
      setIsError(true);
    } finally {
      setIsLoading(false);
      setShowToast(true);
    }
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
            <IonTitle className="modal-title">Update Kind</IonTitle>
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
                    onChange={setDescription}
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
                    onClick={handleUpdate}
                    disabled={!isFormValid || isLoading}
                    className="create-btn"
                  >
                    {isLoading ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonModal>

      <IonLoading isOpen={isLoading} message="Updating kind..." />

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

export default KindUpdateModal;