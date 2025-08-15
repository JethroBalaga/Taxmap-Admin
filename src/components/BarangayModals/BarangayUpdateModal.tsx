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
  IonLabel,
  IonItem
} from '@ionic/react';
import Input from '../Globalcomponents/Input';
import './../../CSS/Modal.css';
import Button from '../Globalcomponents/Button';
import { supabase } from './../../utils/supaBaseClient';

interface BarangayUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  barangayData: { 
    barangay_id: string;
    barangay_name: string;
    district_id: number;
  } | null;
  onBarangayUpdated?: () => void;
}

const BarangayUpdateModal: React.FC<BarangayUpdateModalProps> = ({
  isOpen,
  onClose,
  barangayData,
  onBarangayUpdated = () => {}
}) => {
  const [barangayId, setBarangayId] = useState('');
  const [barangayName, setBarangayName] = useState('');
  const [districtId, setDistrictId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    setIsFormValid(!!barangayId && !!barangayName);
  }, [barangayId, barangayName]);

  useEffect(() => {
    if (barangayData) {
      setBarangayId(barangayData.barangay_id);
      setBarangayName(barangayData.barangay_name);
      setDistrictId(barangayData.district_id);
      setIsFormValid(true);
    }
  }, [barangayData]);

  const handleUpdate = async () => {
    if (!isFormValid || !barangayData) return;

    setIsLoading(true);

    try {
      if (barangayId !== barangayData.barangay_id) {
        const { count } = await supabase
          .from('barangaytbl')
          .select('*', { count: 'exact', head: true })
          .eq('barangay_id', barangayId);

        if (count && count > 0) {
          throw new Error('This Barangay ID already exists!');
        }
      }

      const { error } = await supabase
        .from('barangaytbl')
        .update({ 
          barangay_id: barangayId,
          barangay_name: barangayName,
          district_id: districtId
        })
        .eq('barangay_id', barangayData.barangay_id);

      if (error) throw error;

      setToastMessage('Barangay updated successfully!');
      onBarangayUpdated();
      setTimeout(onClose, 1000);
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to update barangay');
      setIsError(true);
    } finally {
      setIsLoading(false);
      setShowToast(true);
    }
  };

  const handleBarangayIdChange = (value: string) => {
    setBarangayId(value);
  };

  const handleBarangayNameChange = (value: string) => {
    setBarangayName(value);
  };

  const isChangingId = barangayId !== (barangayData?.barangay_id || '');

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose} className="classification-modal">
        <IonHeader>
          <IonToolbar className="modal-header">
            <IonTitle className="modal-title">Update Barangay</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="modal-content">
          <IonGrid className="form-grid">
            <IonRow>
              <IonCol className="form-column">
                {isChangingId && (
                  <div className="warning-message">
                    Warning: Changing Barangay ID will affect all related records
                  </div>
                )}

                <IonItem lines="none" className="district-label-item">
                  <IonLabel className="district-label">District ID: {districtId}</IonLabel>
                </IonItem>

                <div className="input-wrapper">
                  <Input
                    label="Barangay ID"
                    value={barangayId}
                    onChange={handleBarangayIdChange}
                    placeholder="Enter barangay ID"
                    className="modal-input"
                  />
                </div>

                <div className="input-wrapper">
                  <Input
                    label="Barangay Name"
                    value={barangayName}
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
                    onClick={handleUpdate}
                    disabled={!isFormValid || isLoading}
                    className="update-btn"
                  >
                    {isLoading ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonModal>

      <IonLoading isOpen={isLoading} message="Updating barangay..." />
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

export default BarangayUpdateModal;