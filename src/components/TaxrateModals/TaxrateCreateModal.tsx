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
    IonItem,
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
    onTaxrateCreated = () => { },
    district_id
}) => {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [rate, setRate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleCreate = async () => {
        if (!selectedDate || !rate) return;

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('taxratetbl')
                .insert([{
                    district_id,
                    effective_year: selectedDate.split('T')[0], // Extract YYYY-MM-DD
                    rate_percent: `${rate}%`
                }]);

            if (error) throw error;

            setToastMessage('Tax rate created successfully!');
            setSelectedDate('');
            setRate('');
            onTaxrateCreated();
            setTimeout(onClose, 1000);
        } catch (error: any) {
            setToastMessage(error.message || 'Failed to create tax rate');
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
            setShowToast(true);
        }
    };

    const handleRateChange = (value: string) => {
        setRate(value.replace(/[^0-9]/g, ''));
    };

    return (
        <>
            <IonModal isOpen={isOpen} onDidDismiss={onClose} className="classification-modal">
                <IonHeader>
                    <IonToolbar className="modal-header">
                        <IonTitle className="modal-title">Create Tax Rate</IonTitle>
                    </IonToolbar>
                </IonHeader>

                <IonContent className="modal-content">
                    <IonGrid className="form-grid">
                        <IonRow>
                            <IonCol className="form-column">
                                {/* District ID Label */}
                                <IonItem lines="none" className="district-label-item">
                                    <IonLabel className="district-label">District: {district_id}</IonLabel>
                                </IonItem>

                                {/* Year Picker */}
                                <div className="input-wrapper">
                                    <IonLabel className="input-label">Effective Year</IonLabel>
                                    <IonDatetime
                                        presentation="year"
                                        value={selectedDate}
                                        onIonChange={e => setSelectedDate(e.detail.value?.toString() || '')}
                                        className="year-picker"
                                    />
                                </div>

                                {/* Rate Input */}
                                <div className="input-wrapper">
                                    <Input
                                        label="Rate"
                                        value={rate ? `${rate}%` : ''}
                                        onChange={handleRateChange}
                                        placeholder="Enter rate (e.g., 12)"
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
                                        disabled={!selectedDate || !rate || isLoading}
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

            <IonLoading isOpen={isLoading} message="Creating tax rate..." />
            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={toastMessage}
                duration={3000}
                color={isError ? 'green' : 'success'}
            />
        </>
    );
};

export default TaxrateCreateModal;