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
    IonToast,
    IonItem,
    IonLabel,
    IonInput,
    IonButton
} from '@ionic/react';
import { add, arrowUpCircle, trash, eye } from 'ionicons/icons';
import './../../CSS/Setup.css';
import DeclarantCreateModal from '../../components/DeclarantModals/DeclarantCreateModal';
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
    const [showCreateModal, setShowCreateModal] = useState(false);
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

    // Fetch data with multi-table fallback
    const fetchDeclarants = useCallback(async () => {
        setIsLoading(true);
        setIsError(false);
        
        // Variations to try
        const tableVariations = [
            'declaranttbl', 
            '"declaranttbl"',
            'form_view',
            'property_details_view',
            'declarants',
            'taxpayers',
            'taxpayertbl'
        ];

        let lastErr: any = null;
        let searched: string[] = [];

        for (const tableName of tableVariations) {
            searched.push(tableName);
            try {
                console.log(`[Declarant] Probing: ${tableName}...`);
                
                const { data, error } = await supabase
                    .from(tableName as any)
                    .select('*')
                    .limit(200);

                if (error) {
                    console.warn(`[Declarant] ${tableName} probe failed:`, error.message);
                    if (!error.message.includes('not find') && !error.message.includes('does not exist')) {
                        lastErr = error;
                    }
                    continue;
                }

                console.log(`[Declarant] SUCCESS! Data found in ${tableName}`);

                // Map fields - handle different name patterns from views
                const mappedData = (data || []).map(item => {
                    const id = String(item.declarant_id || item.id || item.taxpayer_id || item.owner_id || '');
                    
                    let fname = item.firstname || item.declarant_firstname;
                    let lname = item.lastname || item.declarant_lastname;
                    
                    if (!fname && item.declarant_name) {
                        const parts = item.declarant_name.split(' ');
                        fname = parts[0];
                        lname = parts.slice(1).join(' ');
                    }

                    return {
                        ...item,
                        declarant_id: id,
                        firstname: fname || 'N/A',
                        lastname: lname || 'N/A'
                    };
                });

                // Filter for uniqueness if using a view or if we have many rows
                let finalData = mappedData;
                if (tableName.includes('view') || mappedData.length > 50) {
                    const seen = new Set();
                    finalData = mappedData.filter(d => {
                        const key = `${d.firstname}-${d.lastname}`.toLowerCase();
                        if (seen.has(key) || d.firstname === 'N/A') return false;
                        seen.add(key);
                        return true;
                    });
                }

                setDeclarants(finalData);
                localStorage.setItem('declarant_table_actual', tableName);
                setIsLoading(false);
                return; // Success!

            } catch (err: any) {
                console.error(`[Declarant] Exception for ${tableName}:`, err);
            }
        }

        // Failure if loop finishes
        const errorMsg = 'Failed to load declarants. ' + (lastErr?.message || 'Please check database permissions.');
        console.error('[Declarant] All attempts failed:', searched);
        setToastMessage(errorMsg);
        setIsError(true);
        setShowToast(true);
        setIsLoading(false);
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
            
            // Use same discovery logic as modals
            const activeTable = localStorage.getItem('declarant_table_actual') || 'declaranttbl';
            const targetTable = activeTable.includes('view') ? 'declaranttbl' : activeTable;
            
            console.log(`[DeclarantDelete] Attempting delete from: ${targetTable}`);

            const { error } = await supabase
                .from(targetTable)
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
            icon: add,
            onClick: () => setShowCreateModal(true),
            disabled: false,
            title: "Add Declarant"
        },
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

                <DeclarantCreateModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onDeclarantCreated={fetchDeclarants}
                />

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