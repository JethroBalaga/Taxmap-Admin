import React, { useState, useRef, useMemo } from 'react';
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
    IonButton,
    IonButtons,
    IonLabel,
    IonToast,
    IonAlert
} from '@ionic/react';
import { add, arrowUpCircle, trash, arrowBack, appsOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import BuildingSubComCreateModal from '../../components/BuildingSubcomModals/BuildingSubComCreateModal';

// Define the type for building subcomponent data
interface BuildingSubComItem {
    sub_component_code: string;
    description: string;
    building_com_id: string;
    eff_date: string;
    created_at?: string;
}

// Define the type for the location state
interface LocationState {
    buildingComData?: {
        building_com_id: string;
        description: string;
        created_at?: string;
    };
}

const BuildingSubCom: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false); // State for create modal
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState<BuildingSubComItem | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const searchRef = useRef<HTMLIonSearchbarElement>(null);
    const history = useHistory();
    const location = useLocation();

    // Get building_com_id from URL parameters
    const queryParams = new URLSearchParams(location.search);
    const buildingComId = queryParams.get('building_com_id');

    // Get building component data from navigation state
    const locationState = location.state as LocationState;
    const buildingComData = locationState?.buildingComData;

    // Mock data for demonstration
    const mockData: BuildingSubComItem[] = [
        { sub_component_code: 'BSC001', description: 'Concrete Foundation', building_com_id: buildingComId || 'BC001', eff_date: '2023-01-01' },
        { sub_component_code: 'BSC002', description: 'Brick Walls', building_com_id: buildingComId || 'BC001', eff_date: '2023-01-01' },
        { sub_component_code: 'BSC003', description: 'Metal Roof', building_com_id: buildingComId || 'BC001', eff_date: '2023-01-01' },
        { sub_component_code: 'BSC004', description: 'Glass Windows', building_com_id: buildingComId || 'BC001', eff_date: '2023-01-01' },
        { sub_component_code: 'BSC005', description: 'Wooden Doors', building_com_id: buildingComId || 'BC001', eff_date: '2023-01-01' },
    ];

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return mockData;

        const term = searchTerm.toLowerCase();
        return mockData.filter(item =>
            item.sub_component_code.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term) ||
            item.building_com_id.toLowerCase().includes(term) ||
            item.eff_date.toLowerCase().includes(term)
        );
    }, [searchTerm, buildingComId]);

    const handleRowClick = (rowData: BuildingSubComItem) => {
        setSelectedRow(rowData);
    };

    const handleAddClick = () => {
        setShowCreateModal(true); // Open the create modal
    };

    const handleEditClick = () => {
        if (selectedRow) {
            console.log('Edit clicked for:', selectedRow.sub_component_code);
            // Edit functionality will be implemented later
        }
    };

    const handleDeleteClick = () => {
        if (selectedRow) {
            console.log('Delete clicked for:', selectedRow.sub_component_code);
            // Delete functionality will be implemented later
        }
    };

    const handleBackClick = () => {
        // Navigate back to the building component page
        history.push('/menu/home/buildingcom');
    };

    const handleBuildingSubComCreated = () => {
        // Refresh the data or show success message
        setToastMessage('Building Sub-Component created successfully!');
        setShowToast(true);
        // You would typically fetch data again here
        console.log('Building Sub-Component created, refresh data');
    };

    const iconButtons = [
        { icon: add, onClick: handleAddClick, disabled: false, title: "Add Building Sub-Component" },
        { icon: arrowUpCircle, onClick: handleEditClick, disabled: !selectedRow, title: "Edit Building Sub-Component" },
        { icon: trash, onClick: handleDeleteClick, disabled: !selectedRow, title: "Delete Building Sub-Component" }
    ];

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={handleBackClick}>
                            <IonIcon icon={arrowBack} />
                        </IonButton>
                    </IonButtons>
                    <IonTitle>
                        Building Sub-Components
                    </IonTitle>
                </IonToolbar>
                {buildingComData && (
                    <IonToolbar>
                        <IonLabel className="structure-label">
                            Component: {buildingComData.building_com_id} - {buildingComData.description}
                        </IonLabel>
                    </IonToolbar>
                )}
            </IonHeader>

            <IonContent fullscreen>
                <IonGrid>
                    <IonRow>
                        <IonCol size="12" className="search-container">
                            <IonSearchbar
                                ref={searchRef}
                                placeholder="Search building sub-components..."
                                onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                                debounce={300}
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
                                title="Building Sub-Components"
                                keyField="sub_component_code"
                                onRowClick={handleRowClick}
                            />
                        </IonCol>
                    </IonRow>
                </IonGrid>

                {/* Create Modal */}
                {buildingComId && (
                    <BuildingSubComCreateModal
                        isOpen={showCreateModal}
                        onClose={() => setShowCreateModal(false)}
                        onBuildingSubComCreated={handleBuildingSubComCreated}
                        building_com_id={buildingComId}
                    />
                )}

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

export default BuildingSubCom;