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
import './../../CSS/Modal.css';
import Button from '../Globalcomponents/Button';
import { supabase } from './../../utils/supaBaseClient';

interface DeclarantItem {
  declarant_id: string;
  firstname: string;
  lastname: string;
  created_at?: string;
}

interface DeclarantUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeclarantUpdated?: () => void;
  selectedDeclarant: DeclarantItem | null;
}

const DeclarantUpdateModal: React.FC<DeclarantUpdateModalProps> = ({
  isOpen,
  onClose,
  onDeclarantUpdated = () => {},
  selectedDeclarant,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Populate form fields when selectedDeclarant changes
  useEffect(() => {
    if (selectedDeclarant) {
      setFirstName(selectedDeclarant.firstname);
      setLastName(selectedDeclarant.lastname);
    }
  }, [selectedDeclarant]);

  const handleUpdate = async () => {
    if (!firstName || !lastName || !selectedDeclarant) return;

    setIsLoading(true);
    
    try {
      // Use the discovered table name if available, fallback to declaranttbl
      const activeTable = localStorage.getItem('declarant_table_actual') || 'declaranttbl';
      const targetTable = activeTable.includes('view') ? 'declaranttbl' : activeTable;

      console.log(`[DeclarantUpdate] Attempting update on: ${targetTable}`);

      // Update declarant using declarant_id from selected row
      const { error } = await supabase
        .from(targetTable)
        .update({ 
          firstname: firstName.toUpperCase(),
          lastname: lastName.toUpperCase()
        })
        .eq('declarant_id', selectedDeclarant.declarant_id);

      if (error) throw error;

      setToastMessage('DECLARANT UPDATED SUCCESSFULLY!');
      onDeclarantUpdated();
      setTimeout(onClose, 1000);
    } catch (error: any) {
      const errorMessage = error.message || 'FAILED TO UPDATE DECLARANT';
      setToastMessage(errorMessage);
      setIsError(true);
      console.error('Error updating declarant:', error);
    } finally {
      setIsLoading(false);
      setShowToast(true);
    }
  };

  const handleFirstNameChange = (value: string) => {
    setFirstName(value.toUpperCase());
  };

  const handleLastNameChange = (value: string) => {
    setLastName(value.toUpperCase());
  };

  const handleClose = () => {
    // Reset form fields when closing
    if (selectedDeclarant) {
      setFirstName(selectedDeclarant.firstname);
      setLastName(selectedDeclarant.lastname);
    }
    onClose();
  };

  return (
    <>
      <IonModal
        isOpen={isOpen}
        onDidDismiss={handleClose}
        className="classification-modal"
      >
        <IonHeader>
          <IonToolbar className="modal-header">
            <IonTitle className="modal-title">UPDATE DECLARANT</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="modal-content">
          <IonGrid className="form-grid">
            <IonRow>
              <IonCol className="form-column">
                <div className="input-wrapper">
                  <Input
                    label="FIRST NAME"
                    value={firstName}
                    onChange={handleFirstNameChange}
                    placeholder="ENTER FIRST NAME"
                    className="modal-input"
                  />
                </div>
                
                <div className="input-wrapper">
                  <Input
                    label="LAST NAME"
                    value={lastName}
                    onChange={handleLastNameChange}
                    placeholder="ENTER LAST NAME"
                    className="modal-input"
                  />
                </div>

                {selectedDeclarant && (
                  <div className="selected-item-info">
                    <p>Updating: {selectedDeclarant.firstname} {selectedDeclarant.lastname}</p>
                    <p>ID: {selectedDeclarant.declarant_id}</p>
                  </div>
                )}

                <div className="button-group">
                  <Button
                    variant="secondary"
                    onClick={handleClose}
                    className="cancel-btn"
                    disabled={isLoading}
                  >
                    CANCEL
                  </Button>
                  
                  <Button 
                    variant="primary"
                    onClick={handleUpdate}
                    disabled={!firstName || !lastName || isLoading || 
                             (firstName === selectedDeclarant?.firstname && 
                              lastName === selectedDeclarant?.lastname)}
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

      <IonLoading isOpen={isLoading} message="UPDATING DECLARANT..." />
      
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

export default DeclarantUpdateModal;