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
  IonToast
} from '@ionic/react';
import Input from '../Globalcomponents/Input';
import './../../CSS/ClassificationModal.css';
import Button from '../Globalcomponents/Button';
import { supabase } from './../../utils/supaBaseClient';

interface ClassificationUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  classificationData: { class_id: string; classification: string } | null;
  onClassificationUpdated?: () => void;
}

const ClassificationUpdateModal: React.FC<ClassificationUpdateModalProps> = ({
  isOpen,
  onClose,
  classificationData,
  onClassificationUpdated = () => {}
}) => {
  const [code, setCode] = useState('');
  const [classification, setClassification] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (classificationData) {
      setCode(classificationData.class_id || '');
      setClassification(classificationData.classification || '');
    }
  }, [classificationData]);

  const handleUpdate = async () => {
    if (!code || !classification) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('classtbl')
        .update({ classification })
        .eq('class_id', code);

      if (error) throw error;

      setToastMessage('Classification updated successfully!');
      onClassificationUpdated();
      setTimeout(onClose, 1000);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update classification';
      setToastMessage(errorMessage);
      setIsError(true);
      console.error('Error updating classification:', error);
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
            <IonTitle className="modal-title">Update Classification</IonTitle>
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
                    placeholder="Enter classification code"
                    className="modal-input"
                    // Optionally disable if you don't want code to be changed
                    disabled
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
                    onClick={handleUpdate}
                    disabled={!code || !classification || isLoading}
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

      <IonLoading isOpen={isLoading} message="Updating classification..." />

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

export default ClassificationUpdateModal;
