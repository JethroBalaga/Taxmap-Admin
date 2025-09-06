import React, { useState, useRef, useEffect, useMemo } from 'react';
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

// Define the type for building component data
interface BuildingComItem {
    component_code: string;
    description: string;
    eff_date: string;
    created_at?: string;
}

const BuildingCom: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [buildingComponents, setBuildingComponents] = useState<BuildingComItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState<BuildingComItem | null>(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const searchRef = useRef<HTMLIonSearchbarElement>(null);

    // Mock data for demonstration (replace with actual data fetching)
    const mockData: BuildingComItem[] = [
        { component_code: 'BC001', description: 'Foundation', eff_date: '2023-01-01' },
        { component_code: 'BC002', description: 'Walls', eff_date: '2023-01-01' },
        { component_code: 'BC003', description: 'Roof', eff_date: '2023-01-01' },
        { component_code: 'BC004', description: 'Windows', eff_date: '2023-01-01' },
        { component_code: 'BC005', description: 'Doors', eff_date: '2023-01-01' },
    ];

    // Fetch building components (mock implementation for now)
    const fetchBuildingComponents = () => {
        setIsLoading(true);
        try {
            // Simulate API call
            setTimeout(() => {
                setBuildingComponents(mockData);
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error fetching building components:', error);
            setToastMessage('Failed to load building components');
            setIsError(true);
            setShowToast(true);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBuildingComponents();
    }, []);

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return buildingComponents;

        const term = searchTerm.toLowerCase();
        return buildingComponents.filter(item =>
            item.component_code.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term) ||
            item.eff_date.toLowerCase().includes(term)
        );
    }, [buildingComponents, searchTerm]);

    const handleRowClick = (rowData: BuildingComItem) => {
        setSelectedRow(rowData);
    };

    const handleAddClick = () => {
        setShowCreateModal(true);
    };

    const handleEditClick = () => {
        if (selectedRow) {
            setShowUpdateModal(true);
        }
    };

    const handleDeleteClick = () => {
        if (!selectedRow) return;
        setShowDeleteAlert(true);
    };

    const handleDeleteConfirm = () => {
        // Placeholder for delete functionality
        console.log('Delete confirmed for:', selectedRow);
        setToastMessage(`${selectedRow?.description} delete functionality not implemented yet`);
        setShowDeleteAlert(false);
        setShowToast(true);
        setSelectedRow(null);
    };

    const handleBuildingComCreated = () => {
        // Placeholder for create functionality
        console.log('Building component created');
        setShowCreateModal(false);
        setToastMessage('Create functionality not implemented yet');
        setShowToast(true);
    };

    const handleBuildingComUpdated = () => {
        // Placeholder for update functionality
        console.log('Building component updated');
        setSelectedRow(null);
        setShowUpdateModal(false);
        setToastMessage('Update functionality not implemented yet');
        setShowToast(true);
    };

    const iconButtons = [
        { icon: add, onClick: handleAddClick, disabled: false, title: "Add Building Component" },
        { icon: arrowUpCircle, onClick: handleEditClick, disabled: !selectedRow, title: "Edit Building Component" },
        { icon: trash, onClick: handleDeleteClick, disabled: !selectedRow, title: "Delete Building Component" }
    ];

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Building Component Setup</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonGrid>
                    <IonRow>
                        <IonCol size="12" className="search-container">
                            <IonSearchbar
                                ref={searchRef}
                                placeholder="Search building components..."
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
                                title="Building Components"
                                keyField="component_code"
                                onRowClick={handleRowClick}
                            />
                        </IonCol>
                    </IonRow>
                </IonGrid>

                {/* Create Modal (Placeholder) */}
                {showCreateModal && (
                    <div className="modal-placeholder">
                        <p>Create Modal - Functionality not implemented yet</p>
                        <button onClick={() => setShowCreateModal(false)}>Close</button>
                    </div>
                )}

                {/* Update Modal (Placeholder) */}
                {showUpdateModal && (
                    <div className="modal-placeholder">
                        <p>Update Modal - Functionality not implemented yet</p>
                        <p>Selected: {selectedRow?.component_code}</p>
                        <button onClick={() => setShowUpdateModal(false)}>Close</button>
                    </div>
                )}

                {/* Delete Confirmation */}
                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => setShowDeleteAlert(false)}
                    header="Confirm Delete"
                    message={`Are you sure you want to delete ${selectedRow?.description}?`}
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            cssClass: 'secondary'
                        },
                        {
                            text: 'Delete',
                            handler: handleDeleteConfirm,
                            cssClass: 'danger'
                        }
                    ]}
                />

                <IonLoading isOpen={isLoading} message="Loading..." />
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

export default BuildingCom;