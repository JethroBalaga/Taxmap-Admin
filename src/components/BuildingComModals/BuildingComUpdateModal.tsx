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
} from '@ionic/react';
import Input from '../Globalcomponents/Input';
import './../../CSS/Modal.css';
import Button from '../Globalcomponents/Button';
import { supabase } from './../../utils/supaBaseClient';

interface BuildingComUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuildingComUpdated?: () => void;
  buildingComData: {
    building_com_id: string;
    description: string;
  };
}

const BuildingComUpdateModal: React.FC<BuildingComUpdateModalProps> = ({
  isOpen,
  onClose,
  onBuildingComUpdated = () => {},
  buildingComData
}) => {
  const [buildingComId, setBuildingComId] = useState(buildingComData.building_com_id);
  const [description, setDescription] = useState(buildingComData.description);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Update form fields when buildingComData changes
  useEffect(() => {
    setBuildingComId(buildingComData.building_com_id);
    setDescription(buildingComData.description);
  }, [buildingComData]);

  const handleUpdate = async () => {
    if (!buildingComId || !description) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('building_componenttbl')
        .update({
          description: description.toUpperCase(),
        })
        .eq('building_com_id', buildingComData.building_com_id);

      if (error) throw error;

      setToastMessage('Building Component updated successfully!');
      onBuildingComUpdated();
      setTimeout(onClose, 1000);
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to update building component');
      setIsError(true);
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
      setShowToast(true);
    }
  };

  const handleBuildingComIdChange = (value: string) => {
    setBuildingComId(value.toUpperCase());
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value.toUpperCase());
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose} className="classification-modal">
        <IonHeader>
          <IonToolbar className="modal-header">
            <IonTitle className="modal-title">UPDATE BUILDING COMPONENT</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="modal-content">
          <IonGrid className="form-grid">
            <IonRow>
              <IonCol className="form-column">
                {/* Building Component ID Input (Read-only) */}
                <div className="input-wrapper">
                  <Input
                    label="BUILDING COMPONENT ID"
                    value={buildingComId}
                    onChange={handleBuildingComIdChange}
                    placeholder="BUILDING COMPONENT ID"
                    className="modal-input"
                    disabled={true}
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
                    onClick={handleUpdate}
                    disabled={!buildingComId || !description || isLoading}
                    className="update-btn"
                  >
                    {isLoading ? 'UPDATING...' : 'UPDATE'}
                  </Button>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonModal>

      <IonLoading isOpen={isLoading} message="UPDATING BUILDING COMPONENT..." />
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

export default BuildingComUpdateModal;