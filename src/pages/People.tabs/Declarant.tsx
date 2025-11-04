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
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import DeclarantUpdateModal from '../../components/DeclarantModals/DeclarantUpdateModal';

interface DeclarantItem {
    declarant_id: string; // Changed to string to match the filter logic
    firstname: string;
    lastname: string;
    created_at?: string;
}

const Declarant: React.FC = () => {
    const [declarants, setDeclarants] = useState<DeclarantItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRow, setSelectedRow] = useState<DeclarantItem | null>(null);
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

    // Fetch data
    const fetchDeclarants = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('declaranttbl')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Convert declarant_id to string to ensure consistency
            const declarantsWithStringId = (data || []).map(item => ({
                ...item,
                declarant_id: String(item.declarant_id)
            }));

            setDeclarants(declarantsWithStringId);
        } catch (error) {
            console.error('Error fetching declarants:', error);
            setToastMessage('Failed to load declarants');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDeclarants();
    }, [fetchDeclarants]);

    // Filter data based on search term - FIXED VERSION
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return declarants;

        const term = searchTerm.toLowerCase();
        return declarants.filter(item =>
            item.firstname.toLowerCase().includes(term) ||
            item.lastname.toLowerCase().includes(term) ||
            item.declarant_id.toLowerCase().includes(term) // Now safe since we converted to string
        );
    }, [declarants, searchTerm]);

    const handleRowClick = (rowData: DeclarantItem) => {
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
                .from('declaranttbl')
                .delete()
                .eq('declarant_id', selectedRow.declarant_id);

            if (error) throw error;

            await fetchDeclarants();
            setSelectedRow(null);
            setToastMessage(`${selectedRow.firstname} ${selectedRow.lastname} deleted successfully!`);
            setShowToast(true);
        } catch (error) {
            console.error('Error deleting declarant:', error);
            setToastMessage('Failed to delete declarant');
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
            title: "Edit Declarant"
        },
        {
            icon: trash,
            onClick: handleDeleteClick,
            disabled: !selectedRow,
            title: "Delete Declarant"
        }
    ];

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Declarant</IonTitle>
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
                                title="Declarants"
                                keyField="declarant_id"
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
                    onDeclarantUpdated={fetchDeclarants}
                    selectedDeclarant={selectedRow}
                />

                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => setShowDeleteAlert(false)}
                    header={'Confirm Delete'}
                    message={`Are you sure you want to delete the declarant <strong>${selectedRow?.firstname} ${selectedRow?.lastname}</strong>?`}
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