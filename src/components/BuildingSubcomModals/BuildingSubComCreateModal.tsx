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
} from '@ionic/react';
import Input from '../Globalcomponents/Input';
import './../../CSS/Modal.css';
import Button from '../Globalcomponents/Button';
import { supabase } from './../../utils/supaBaseClient';

interface BuildingSubComCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuildingSubComCreated?: () => void;
  building_com_id: string; // Inherited from parent component
}

const BuildingSubComCreateModal: React.FC<BuildingSubComCreateModalProps> = ({
  isOpen,
  onClose,
  onBuildingSubComCreated = () => {},
  building_com_id
}) => {
  const [buildingSubComId, setBuildingSubComId] = useState('');
  const [description, setDescription] = useState('');
  const [rate, setRate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleCreate = async () => {
    if (!buildingSubComId || !description || !rate) return;

    // Validate rate is a valid number
    const rateValue = parseFloat(rate);
    if (isNaN(rateValue) || rateValue < 0) {
      setToastMessage('Please enter a valid rate (positive number)');
      setIsError(true);
      setShowToast(true);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('building_sub_componenttbl') // Assuming your table name is building_sub_componenttbl
        .insert([{
          building_sub_com_id: buildingSubComId.toUpperCase(),
          description: description.toUpperCase(),
          rate: rateValue,
          building_com_id: building_com_id, // Inherited from parent
        }]);

      if (error) throw error;

      setToastMessage('Building Sub-Component created successfully!');
      setBuildingSubComId('');
      setDescription('');
      setRate('');
      onBuildingSubComCreated();
      setTimeout(onClose, 1000);
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to create building sub-component');
      setIsError(true);
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      setShowToast(true);
    }
  };

  const handleBuildingSubComIdChange = (value: string) => {
    setBuildingSubComId(value.toUpperCase());
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value.toUpperCase());
  };

  const handleRateChange = (value: string) => {
    // Allow only numbers and decimal point
    const validatedValue = value.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const decimalCount = (validatedValue.match(/\./g) || []).length;
    if (decimalCount <= 1) {
      setRate(validatedValue);
    }
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose} className="classification-modal">
        <IonHeader>
          <IonToolbar className="modal-header">
            <IonTitle className="modal-title">CREATE BUILDING SUB-COMPONENT</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="modal-content">
          <IonGrid className="form-grid">
            <IonRow>
              <IonCol className="form-column">
                {/* Building Sub-Component ID Input */}
                <div className="input-wrapper" style={{ textTransform: 'uppercase' }}>
                  <Input
                    label="BUILDING SUB-COMPONENT ID"
                    value={buildingSubComId}
                    onChange={handleBuildingSubComIdChange}
                    placeholder="ENTER BUILDING SUB-COMPONENT ID"
                    className="modal-input"
                  />
                </div>

                {/* Description Input */}
                <div className="input-wrapper" style={{ textTransform: 'uppercase' }}>
                  <Input
                    label="DESCRIPTION"
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="ENTER DESCRIPTION"
                    className="modal-input"
                  />
                </div>

                {/* Rate Input */}
                <div className="input-wrapper">
                  <Input
                    label="RATE"
                    value={rate}
                    onChange={handleRateChange}
                    placeholder="ENTER RATE"
                    className="modal-input"
                    type="number"
                  />
                </div>

                {/* Building Component ID (Display only) */}
                <div className="input-wrapper">
                  <Input
                    label="BUILDING COMPONENT ID"
                    value={building_com_id}
                    onChange={() => {}} // Read-only
                    placeholder="BUILDING COMPONENT ID"
                    className="modal-input"
                    disabled={true}
                  />
                </div>

                <div className="button-group">
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    className="cancel-btn"
                    disabled={isLoading}
                  >
                    CANCEL
                  </Button>

                  <Button
                    variant="primary"
                    onClick={handleCreate}
                    disabled={!buildingSubComId || !description || !rate || isLoading}
                    className="create-btn"
                  >
                    {isLoading ? 'CREATING...' : 'CREATE'}
                  </Button>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonModal>

      <IonLoading isOpen={isLoading} message="CREATING BUILDING SUB-COMPONENT..." />
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

export default BuildingSubComCreateModal;