import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonLoading,
    IonSearchbar,
    IonAlert,
    IonToast
} from '@ionic/react';
import { arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import DeclarantUpdateModal from '../../components/DeclarantModals/DeclarantUpdateModal';

interface FormItem {
    form_id: string;
    declarant: string; // Only need declarant field from formtbl
    created_at?: string;
    // Other fields from formtbl that you might want to display
    status?: string;
    class_id?: string;
}

const Declarant: React.FC = () => {
    const [forms, setForms] = useState<FormItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRow, setSelectedRow] = useState<FormItem | null>(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const searchRef = useRef<HTMLIonSearchbarElement>(null);
    const [isError, setIsError] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    // Focus search input on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            searchRef.current?.setFocus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Fetch data from formtbl - only declarant related data
    const fetchForms = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('formtbl')
                .select('form_id, declarant, created_at, status, class_id') // Only select needed fields
                .order('created_at', { ascending: false });

            if (error) throw error;

            setForms(data || []);
        } catch (error) {
            console.error('Error fetching forms:', error);
            setToastMessage('Failed to load declarants');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchForms();
    }, [fetchForms]);

    // Filter data based on search term - search only declarant names
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return forms;

        const term = searchTerm.toLowerCase();
        return forms.filter(item =>
            item.declarant.toLowerCase().includes(term) ||
            item.form_id.toLowerCase().includes(term)
        );
    }, [forms, searchTerm]);

    const handleRowClick = (rowData: FormItem) => {
        setSelectedRow(rowData);
    };

    const handleUpdateClick = () => {
        if (selectedRow) {
            setShowUpdateModal(true);
        }
    };

    const handleDeleteClick = async () => {
        if (!selectedRow) return;
        setShowDeleteAlert(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedRow) return;

        try {
            setIsLoading(true);
            const { error } = await supabase
                .from('formtbl')
                .delete()
                .eq('form_id', selectedRow.form_id);

            if (error) throw error;

            await fetchForms();
            setSelectedRow(null);
            setToastMessage(`Form with declarant "${selectedRow.declarant}" deleted successfully!`);
            setShowToast(true);
        } catch (error) {
            console.error('Error deleting form:', error);
            setToastMessage('Failed to delete form');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
            setShowDeleteAlert(false);
        }
    };

    const iconButtons = [
        {
            icon: arrowUpCircle,
            onClick: handleUpdateClick,
            disabled: !selectedRow,
            title: "Update Declarant"
        },
        {
            icon: trash,
            onClick: handleDeleteClick,
            disabled: !selectedRow,
            title: "Delete Form"
        }
    ];

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Declarants from Forms</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonGrid>
                    <IonRow>
                        <IonCol size="12" className="search-container">
                            <IonSearchbar
                                ref={searchRef}
                                placeholder="Search declarants..."
                                onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                                debounce={0}
                            />

                            <div className="icon-group">
                                {iconButtons.map((btn, index) => (
                                    <IonIcon
                                        key={index}
                                        icon={btn.icon}
                                        className={`icon-yellow ${btn.disabled ? 'icon-disabled' : ''}`}
                                        onClick={btn.disabled ? undefined : btn.onClick}
                                        title={btn.title}
                                    />
                                ))}
                            </div>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol size="12">
                            <DynamicTable
                                data={filteredData}
                                title="Declarants from Forms"
                                keyField="form_id"
                                onRowClick={handleRowClick}
                                selectedRow={selectedRow}
                            />
                        </IonCol>
                    </IonRow>
                </IonGrid>

                <IonLoading isOpen={isLoading} message="Loading..." />

                <DeclarantUpdateModal
                    isOpen={showUpdateModal}
                    onClose={() => setShowUpdateModal(false)}
                    onDeclarantUpdated={fetchForms}
                    selectedForm={selectedRow} // Now it matches the prop name
                />

                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => setShowDeleteAlert(false)}
                    header={'Confirm Delete'}
                    message={`Are you sure you want to delete the form with declarant <strong>${selectedRow?.declarant}</strong>?`}
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary',
                        },
                        {
                            text: 'Delete',
                            handler: handleDeleteConfirm
                        }
                    ]}
                />

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={3000}
                    color={isError ? 'danger' : 'success'}
                />
            </IonContent>
        </IonPage>
    );
};

export default Declarant;