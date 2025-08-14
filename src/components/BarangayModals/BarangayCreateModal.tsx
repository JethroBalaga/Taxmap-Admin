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
  IonToast,
  IonLabel,
  IonItem
} from '@ionic/react';
import Input from '../Globalcomponents/Input';
import './../../CSS/Modal.css';
import Button from '../Globalcomponents/Button';
import { supabase } from './../../utils/supaBaseClient';

interface BarangayCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBarangayCreated?: () => void;
  district_id: number;
}

const BarangayCreateModal: React.FC<BarangayCreateModalProps> = ({
  isOpen,
  onClose,
  onBarangayCreated = () => {},
  district_id
}) => {
  const [barangay_id, setBarangayId] = useState('');
  const [barangay_name, setBarangayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleCreate = async () => {
    if (!barangay_id || !barangay_name) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('barangaytbl')
        .insert([{
          barangay_id,
          barangay_name,
          district_id
        }]);

      if (error) throw error;

      setToastMessage('Barangay created successfully!');
      setBarangayId('');
      setBarangayName('');
      onBarangayCreated();
      setTimeout(onClose, 1000);
    } catch (error: any) {
      setIsError(true);
      setToastMessage(error.message || 'Failed to create barangay');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      setShowToast(true);
    }
  };

  // Safe input handlers that work with different Input component implementations
  const handleBarangayIdChange = (value: string) => {
    setBarangayId(value);
  };

  const handleBarangayNameChange = (value: string) => {
    setBarangayName(value);
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose} className="classification-modal">
        <IonHeader>
          <IonToolbar className="modal-header">
            <IonTitle className="modal-title">Create Barangay</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="modal-content">
          <IonGrid className="form-grid">
            <IonRow>
              <IonCol className="form-column">
                {/* District ID Label */}
                <IonItem lines="none" className="district-label-item">
                  <IonLabel className="district-label">District ID: {district_id}</IonLabel>
                </IonItem>

                {/* Barangay ID Input */}
                <div className="input-wrapper">
                  <Input
                    label="Barangay ID"
                    value={barangay_id}
                    onChange={handleBarangayIdChange}
                    placeholder="Enter barangay ID"
                    className="modal-input"
                  />
                </div>

                {/* Barangay Name Input */}
                <div className="input-wrapper">
                  <Input
                    label="Barangay Name"
                    value={barangay_name}
                    onChange={handleBarangayNameChange}
                    placeholder="Enter barangay name"
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
                    disabled={!barangay_id || !barangay_name || isLoading}
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

      <IonLoading isOpen={isLoading} message="Creating barangay..." />
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

export default BarangayCreateModal;