import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
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
import { add, arrowUpCircle, trash, arrowBack } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import BuildingSubComCreateModal from '../../components/BuildingSubcomModals/BuildingSubComCreateModal';

// Define the type for building subcomponent data
interface BuildingSubComItem {
    building_subcom_id: string; // Updated column name
    description: string;
    rate: number;
    building_com_id: string;
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
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [buildingSubComponents, setBuildingSubComponents] = useState<BuildingSubComItem[]>([]);
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

    // Fetch building sub-components from Supabase
    const fetchBuildingSubComponents = useCallback(async () => {
        if (!buildingComId) return;

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('building_subcomponenttbl') // Updated table name
                .select('building_subcom_id, description, rate, building_com_id, created_at') // Updated column name
                .eq('building_com_id', buildingComId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setBuildingSubComponents(data || []);
        } catch (error: any) {
            console.error('Error fetching building sub-components:', error);
            setToastMessage(error.message || 'Failed to load building sub-components');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    }, [buildingComId]);

    useEffect(() => {
        fetchBuildingSubComponents();
    }, [fetchBuildingSubComponents]);

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return buildingSubComponents;

        const term = searchTerm.toLowerCase();
        return buildingSubComponents.filter(item =>
            item.building_subcom_id.toLowerCase().includes(term) || // Updated column name
            item.description.toLowerCase().includes(term) ||
            item.rate.toString().includes(term) ||
            item.building_com_id.toLowerCase().includes(term)
        );
    }, [buildingSubComponents, searchTerm]);

    const handleRowClick = (rowData: BuildingSubComItem) => {
        setSelectedRow(rowData);
    };

    const handleAddClick = () => {
        setShowCreateModal(true);
    };

    const handleEditClick = () => {
        if (selectedRow) {
            console.log('Edit clicked for:', selectedRow.building_subcom_id); // Updated column name
        }
    };

    const handleDeleteClick = () => {
        if (selectedRow) {
            console.log('Delete clicked for:', selectedRow.building_subcom_id); // Updated column name
        }
    };

    const handleBackClick = () => {
        history.push('/menu/home/buildingcom');
    };

    const handleBuildingSubComCreated = () => {
        fetchBuildingSubComponents();
        setToastMessage('Building Sub-Component created successfully!');
        setShowToast(true);
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
                                keyField="building_subcom_id" // Updated column name
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