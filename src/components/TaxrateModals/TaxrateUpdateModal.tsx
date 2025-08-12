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
    IonItem,
    IonDatetime
} from '@ionic/react';
import Input from '../Globalcomponents/Input';
import './../../CSS/Modal.css';
import Button from '../Globalcomponents/Button';
import { supabase } from './../../utils/supaBaseClient';

interface TaxrateUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTaxrateUpdated?: () => void;
    taxrateData: {
        id: string;
        district_id: string;
        effective_year: string;
        rate_percent: string;
    } | null;
}

const TaxrateUpdateModal: React.FC<TaxrateUpdateModalProps> = ({
    isOpen,
    onClose,
    onTaxrateUpdated = () => { },
    taxrateData
}) => {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [rate, setRate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (taxrateData) {
            setSelectedDate(taxrateData.effective_year);
            // Remove the % sign if present
            setRate(taxrateData.rate_percent.replace('%', ''));
        }
    }, [taxrateData]);

    const handleUpdate = async () => {
        if (!selectedDate || !rate || !taxrateData) return;

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('taxratetbl')
                .update({
                    effective_year: selectedDate.split('T')[0], // Extract YYYY-MM-DD
                    rate_percent: `${rate}%`,
                    updated_at: new Date().toISOString()
                })
                .eq('id', taxrateData.id);

            if (error) throw error;

            setToastMessage('Tax rate updated successfully!');
            onTaxrateUpdated();
            setTimeout(onClose, 1000);
        } catch (error: any) {
            setIsError(true);
            setToastMessage(error.message || 'Failed to update tax rate');
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
                        <IonTitle className="modal-title">Update Tax Rate</IonTitle>
                    </IonToolbar>
                </IonHeader>

                <IonContent className="modal-content">
                    <IonGrid className="form-grid">
                        <IonRow>
                            <IonCol className="form-column">
                                {/* District ID Label */}
                                <IonItem lines="none" className="district-label-item">
                                    <IonLabel className="district-label">District: {taxrateData?.district_id}</IonLabel>
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
                                        onClick={handleUpdate}
                                        disabled={!selectedDate || !rate || isLoading}
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

            <IonLoading isOpen={isLoading} message="Updating tax rate..." />
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

export default TaxrateUpdateModal;