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
  IonDatetime,
  IonLabel,
  IonDatetimeButton,
  IonPopover
} from '@ionic/react';
import Input from '../Globalcomponents/Input';
import './../../CSS/ClassificationModal.css';
import Button from '../Globalcomponents/Button';
import { supabase } from './../../utils/supaBaseClient';

interface DistrictCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDistrictCreated?: () => void;
}

const DistrictCreateModal: React.FC<DistrictCreateModalProps> = ({
  isOpen,
  onClose,
  onDistrictCreated = () => {},
}) => {
  const [districtId, setDistrictId] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [foundedDate, setFoundedDate] = useState<string>(new Date().toISOString());
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleCreate = async () => {
    if (!districtId || !districtName || !foundedDate) return;

    setIsLoading(true);
    
    try {
      // Check if district ID already exists
      const { data: existingData, error: existingError } = await supabase
        .from('districttbl')
        .select('district_id')
        .eq('district_id', districtId)
        .maybeSingle();

      if (existingData) {
        throw new Error('District ID already exists');
      }

      // Format the date for Supabase (YYYY-MM-DD)
      const formattedDate = new Date(foundedDate).toISOString().split('T')[0];

      // Insert new district
      const { data, error } = await supabase
        .from('districttbl')
        .insert([{ 
          district_id: districtId, 
          district_name: districtName,
          founded: formattedDate
        }])
        .select();

      if (error) throw error;

      setToastMessage('District created successfully!');
      setDistrictId('');
      setDistrictName('');
      setFoundedDate(new Date().toISOString());
      onDistrictCreated();
      setTimeout(onClose, 1000);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create district';
      setToastMessage(errorMessage);
      setIsError(true);
      console.error('Error creating district:', error);
    } finally {
      setIsLoading(false);
      setShowToast(true);
    }
  };

  const handleDistrictIdChange = (value: string) => {
    setDistrictId(value.toUpperCase());
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
            <IonTitle className="modal-title">Create New District</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="modal-content">
          <IonGrid className="form-grid">
            <IonRow>
              <IonCol className="form-column">
                <div className="input-wrapper">
                  <Input
                    label="District#"
                    value={districtId}
                    onChange={handleDistrictIdChange}
                    placeholder="Enter district code (e.g., D001)"
                    className="modal-input"
                  />
                </div>
                
                <div className="input-wrapper">
                  <Input
                    label="District Name"
                    value={districtName}
                    onChange={setDistrictName}
                    placeholder="Enter district name"
                    className="modal-input"
                  />
                </div>

                <div className="input-wrapper">
                  <IonLabel className="input-label">Founded Date</IonLabel>
                  <IonDatetimeButton datetime="datetime" />
                  <IonPopover keepContentsMounted={true}>
                    <IonDatetime 
                      id="datetime"
                      value={foundedDate}
                      onIonChange={(e) => setFoundedDate(e.detail.value?.toString() || new Date().toISOString())}
                      presentation="date"
                      showDefaultButtons={true}
                      doneText="Select"
                      cancelText="Cancel"
                    />
                  </IonPopover>
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
                    disabled={!districtId || !districtName || !foundedDate || isLoading}
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

      <IonLoading isOpen={isLoading} message="Creating district..." />
      
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

export default DistrictCreateModal;