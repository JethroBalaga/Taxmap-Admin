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

interface MachineUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMachineUpdated?: () => void;
  machineData: {
    serial_no: string;
    machine_description: string;
    equipment_id: string;
  } | null;
}

const MachineUpdateModal: React.FC<MachineUpdateModalProps> = ({
  isOpen,
  onClose,
  onMachineUpdated = () => {},
  machineData
}) => {
  const [serial_no, setSerialNo] = useState('');
  const [machine_description, setMachineDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Populate form when modal opens or data changes
  useEffect(() => {
    if (machineData) {
      setSerialNo(machineData.serial_no);
      setMachineDescription(machineData.machine_description || '');
    }
  }, [machineData, isOpen]);

  const handleUpdate = async () => {
    if (!serial_no || !machineData) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('machine')
        .update({
          serial_no: serial_no.toUpperCase(),
          machine_description: machine_description.toUpperCase()
        })
        .eq('serial_no', machineData.serial_no);

      if (error) throw error;

      setToastMessage('Machine updated successfully!');
      onMachineUpdated();
      setTimeout(onClose, 1000);
    } catch (error: any) {
      setIsError(true);
      setToastMessage(error.message || 'Failed to update machine');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      setShowToast(true);
    }
  };

  const handleSerialNoChange = (value: string) => {
    setSerialNo(value.toUpperCase());
  };

  const handleMachineDescriptionChange = (value: string) => {
    setMachineDescription(value.toUpperCase());
  };

  const resetForm = () => {
    setSerialNo('');
    setMachineDescription('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={handleClose} className="classification-modal">
        <IonHeader>
          <IonToolbar className="modal-header">
            <IonTitle className="modal-title">Update Machine</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="modal-content">
          <IonGrid className="form-grid">
            <IonRow>
              <IonCol className="form-column">
                <IonItem lines="none" className="district-label-item">
                  <IonLabel className="district-label">Equipment ID: {machineData?.equipment_id}</IonLabel>
                </IonItem>

                <div className="input-wrapper">
                  <Input
                    label="Serial No"
                    value={serial_no}
                    onChange={handleSerialNoChange}
                    placeholder="Enter serial number"
                    className="modal-input"
                  />
                </div>

                <div className="input-wrapper">
                  <Input
                    label="Machine Description"
                    value={machine_description}
                    onChange={handleMachineDescriptionChange}
                    placeholder="Enter machine description"
                    className="modal-input"
                  />
                </div>

                <div className="button-group">
                  <Button
                    variant="secondary"
                    onClick={handleClose}
                    className="cancel-btn"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="primary"
                    onClick={handleUpdate}
                    disabled={!serial_no || isLoading}
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

      <IonLoading isOpen={isLoading} message="Updating Machine..." />
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

export default MachineUpdateModal;