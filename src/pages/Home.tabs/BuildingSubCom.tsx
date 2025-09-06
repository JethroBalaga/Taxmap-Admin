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
} from '@ionic/react';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';

// Define the type for building subcomponent data
interface BuildingSubComItem {
    sub_component_code: string;
    description: string;
    building_com_id: string;
    eff_date: string;
    created_at?: string;
}

const BuildingSubCom: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState<BuildingSubComItem | null>(null);
    const searchRef = useRef<HTMLIonSearchbarElement>(null);

    // Mock data for demonstration
    const mockData: BuildingSubComItem[] = [
        { sub_component_code: 'BSC001', description: 'Concrete Foundation', building_com_id: 'BC001', eff_date: '2023-01-01' },
        { sub_component_code: 'BSC002', description: 'Brick Walls', building_com_id: 'BC002', eff_date: '2023-01-01' },
        { sub_component_code: 'BSC003', description: 'Metal Roof', building_com_id: 'BC003', eff_date: '2023-01-01' },
        { sub_component_code: 'BSC004', description: 'Glass Windows', building_com_id: 'BC004', eff_date: '2023-01-01' },
        { sub_component_code: 'BSC005', description: 'Wooden Doors', building_com_id: 'BC005', eff_date: '2023-01-01' },
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
    }, [searchTerm]);

    const handleRowClick = (rowData: BuildingSubComItem) => {
        setSelectedRow(rowData);
    };

    const handleAddClick = () => {
        console.log('Add clicked');
        // Add functionality will be implemented later
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

    const iconButtons = [
        { icon: add, onClick: handleAddClick, disabled: false, title: "Add Building Sub-Component" },
        { icon: arrowUpCircle, onClick: handleEditClick, disabled: !selectedRow, title: "Edit Building Sub-Component" },
        { icon: trash, onClick: handleDeleteClick, disabled: !selectedRow, title: "Delete Building Sub-Component" }
    ];

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Building Sub-Component Setup</IonTitle>
                </IonToolbar>
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

                <IonLoading isOpen={isLoading} message="Loading..." />
            </IonContent>
        </IonPage>
    );
};

export default BuildingSubCom;