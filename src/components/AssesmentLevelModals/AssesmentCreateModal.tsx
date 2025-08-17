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
    IonDatetime,
    IonInput
} from '@ionic/react';
import Input from '../Globalcomponents/Input';
import './../../CSS/Modal.css';
import Button from '../Globalcomponents/Button';
import { supabase } from './../../utils/supaBaseClient';

interface AssessmentLevelCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssessmentLevelCreated?: () => void;
    kind_id: string;
}

const AssessmentCreateModal: React.FC<AssessmentLevelCreateModalProps> = ({
    isOpen,
    onClose,
    onAssessmentLevelCreated = () => { },
    kind_id
}) => {
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [classification, setClassification] = useState('');
    const [range1, setRange1] = useState('');
    const [range2, setRange2] = useState('');
    const [ratePercent, setRatePercent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleCreate = async () => {
        if (!selectedYear || !classification || !range1 || !range2 || !ratePercent) return;

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('assessmentleveltbl')
                .insert([{
                    kind_id,
                    effective_year: selectedYear,
                    class: classification,
                    range1: parseFloat(range1),
                    range2: parseFloat(range2),
                    rate_percent: `${ratePercent}%`
                }]);

            if (error) throw error;

            setToastMessage('Assessment level created successfully!');
            setSelectedYear('');
            setClassification('');
            setRange1('');
            setRange2('');
            setRatePercent('');
            onAssessmentLevelCreated();
            setTimeout(onClose, 1000);
        } catch (error: any) {
            setToastMessage(error.message || 'Failed to create assessment level');
            setIsError(true);
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
            setShowToast(true);
        }
    };

    const handleRateChange = (e: CustomEvent) => {
        const value = (e.target as HTMLInputElement).value;
        setRatePercent(value.replace(/[^0-9.]/g, ''));
    };

    const handleRange1Change = (e: CustomEvent) => {
        const value = (e.target as HTMLInputElement).value;
        setRange1(value.replace(/[^0-9.]/g, ''));
    };

    const handleRange2Change = (e: CustomEvent) => {
        const value = (e.target as HTMLInputElement).value;
        setRange2(value.replace(/[^0-9.]/g, ''));
    };

    const handleClassificationChange = (e: CustomEvent) => {
        setClassification((e.target as HTMLInputElement).value);
    };

    const handleYearChange = (e: CustomEvent) => {
        const fullDate = e.detail.value?.toString() || '';
        const yearOnly = fullDate.split('-')[0];
        setSelectedYear(yearOnly);
    };

    return (
        <>
            <IonModal isOpen={isOpen} onDidDismiss={onClose} className="classification-modal">
                <IonHeader>
                    <IonToolbar className="modal-header">
                        <IonTitle className="modal-title">Create Assessment Level</IonTitle>
                    </IonToolbar>
                </IonHeader>

                <IonContent className="modal-content">
                    <IonGrid className="form-grid">
                        <IonRow>
                            <IonCol className="form-column">
                                {/* Kind ID Label */}
                                <IonItem lines="none" className="district-label-item">
                                    <IonLabel className="district-label">Kind ID: {kind_id}</IonLabel>
                                </IonItem>

                                {/* Year Picker */}
                                <div className="input-wrapper">
                                    <IonLabel className="input-label">Effective Year</IonLabel>
                                    <IonDatetime
                                        presentation="year"
                                        value={selectedYear}
                                        onIonChange={handleYearChange}
                                        className="year-picker"
                                    />
                                </div>

                                {/* Classification Input */}
                                <div className="input-wrapper">
                                    <IonLabel className="input-label">Classification</IonLabel>
                                    <IonInput
                                        value={classification}
                                        onIonChange={handleClassificationChange}
                                        placeholder="Enter class (e.g., Residential)"
                                        className="modal-input"
                                    />
                                </div>

                                {/* Range 1 Input */}
                                <div className="input-wrapper">
                                    <IonLabel className="input-label">Range Start</IonLabel>
                                    <IonInput
                                        value={range1}
                                        onIonChange={handleRange1Change}
                                        placeholder="Enter starting range"
                                        className="modal-input"
                                        type="number"
                                    />
                                </div>

                                {/* Range 2 Input */}
                                <div className="input-wrapper">
                                    <IonLabel className="input-label">Range End</IonLabel>
                                    <IonInput
                                        value={range2}
                                        onIonChange={handleRange2Change}
                                        placeholder="Enter ending range"
                                        className="modal-input"
                                        type="number"
                                    />
                                </div>

                                {/* Rate Percent Input */}
                                <div className="input-wrapper">
                                    <IonLabel className="input-label">Rate Percent</IonLabel>
                                    <IonInput
                                        value={ratePercent}
                                        onIonChange={handleRateChange}
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
                                        disabled={!selectedYear || !classification || !range1 || !range2 || !ratePercent || isLoading}
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

            <IonLoading isOpen={isLoading} message="Creating assessment level..." />
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

export default AssessmentCreateModal;