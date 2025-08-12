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
  IonDatetime
} from '@ionic/react';
import Input from '../Globalcomponents/Input';
import './../../CSS/Modal.css';
import Button from '../Globalcomponents/Button';
import { supabase } from './../../utils/supaBaseClient';

interface TaxrateCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaxrateCreated?: () => void;
  district_id: string;
}

const TaxrateCreateModal: React.FC<TaxrateCreateModalProps> = ({
  isOpen,
  onClose,
  onTaxrateCreated = () => {},
  district_id
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [rate, setRate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleCreate = async () => {
    if (!selectedYear || !rate) return;

    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('taxratetbl')
        .insert([{ 
          district_id,
          eff_year: selectedYear.split('T')[0], // Extract YYYY-MM-DD
          rate: `${rate}%`
        }]);

      if (error) throw error;

      setToastMessage('Tax rate created successfully!');
      setSelectedYear('');
      setRate('');
      onTaxrateCreated();
      setTimeout(onClose, 1000);
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to create tax rate');
      setIsError(true);
      console.error('Error creating tax rate:', error);
    } finally {
      setIsLoading(false);
      setShowToast(true);
    }
  };

  const handleRateChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setRate(numericValue);
  };

  return (
    <>
      <IonModal
        isOpen={isOpen}
        onDidDismiss={onClose}
        className="taxrate-modal"
      >
        <IonHeader>
          <IonToolbar className="modal-header">
            <IonTitle className="modal-title">New Tax Rate</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="modal-content">
          <IonGrid className="form-grid">
            <IonRow>
              <IonCol className="form-column">
                <div className="input-wrapper">
                  <IonLabel className="input-label">District ID</IonLabel>
                  <div className="readonly-value">{district_id}</div>
                </div>
                
                <div className="input-wrapper">
                  <IonLabel className="input-label">Effective Year</IonLabel>
                  <IonDatetime
                    presentation="year"
                    value={selectedYear}
                    onIonChange={e => setSelectedYear(e.detail.value?.toString() || '')}
                    className="year-picker"
                  />
                </div>

                <div className="input-wrapper">
                  <Input
                    label="Rate"
                    value={rate ? `${rate}%` : ''}
                    onChange={handleRateChange}
                    placeholder="e.g. 12"
                    className="modal-input"
                    type="tel"
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
                    disabled={!selectedYear || !rate || isLoading}
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

      <IonLoading isOpen={isLoading} message="Creating..." />
      
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color={isError ? 'danger' : 'success'}
        position="top"
      />
    </>
  );
};

export default TaxrateCreateModal;