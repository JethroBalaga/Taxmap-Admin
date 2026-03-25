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
  IonToast
} from '@ionic/react';
import Input from '../Globalcomponents/Input';
import './../../CSS/Modal.css';
import Button from '../Globalcomponents/Button';
import { supabase } from './../../utils/supaBaseClient';

interface DeclarantCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeclarantCreated?: () => void;
}

const DeclarantCreateModal: React.FC<DeclarantCreateModalProps> = ({
  isOpen,
  onClose,
  onDeclarantCreated = () => {},
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleCreate = async () => {
    if (!firstName || !lastName) return;

    setIsLoading(true);
    
    try {
      // Use the discovered table name if available, fallback to declaranttbl
      const activeTable = localStorage.getItem('declarant_table_actual') || 'declaranttbl';
      // If it's a view, we probably can't insert into it directly, so fallback to declaranttbl
      const targetTable = activeTable.includes('view') ? 'declaranttbl' : activeTable;

      console.log(`[DeclarantCreate] Attempting insert into: ${targetTable}`);

      // Insert new declarant
      const { data, error } = await supabase
        .from(targetTable)
        .insert([{ 
          firstname: firstName.toUpperCase(),
          lastname: lastName.toUpperCase()
        }])
        .select();

      if (error) throw error;

      setToastMessage('DECLARANT CREATED SUCCESSFULLY!');
      setFirstName('');
      setLastName('');
      onDeclarantCreated();
      setTimeout(onClose, 1000);
    } catch (error: any) {
      const errorMessage = error.message || 'FAILED TO CREATE DECLARANT';
      setToastMessage(errorMessage);
      setIsError(true);
      console.error('Error creating declarant:', error);
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

  return (
    <>
      <IonModal
        isOpen={isOpen}
        onDidDismiss={onClose}
        className="classification-modal"
      >
        <IonHeader>
          <IonToolbar className="modal-header">
            <IonTitle className="modal-title">CREATE NEW DECLARANT</IonTitle>
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
                    disabled={!firstName || !lastName || isLoading}
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

      <IonLoading isOpen={isLoading} message="CREATING DECLARANT..." />
      
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

export default DeclarantCreateModal;