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
    IonAlert,
    IonBadge
} from '@ionic/react';
import { add, arrowUpCircle, trash, arrowBack, checkmarkCircle, closeCircle } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import BuildingSubComCreateModal from '../../components/BuildingSubcomModals/BuildingSubComCreateModal';
import BuildingSubComUpdateModal from '../../components/BuildingSubcomModals/BuildingSubComUpdateModal';

// Add Electron detection
const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    const electronDetected = (
      // @ts-ignore
      window.process?.versions?.electron ||
      // @ts-ignore
      window.navigator.userAgent.includes('Electron') ||
      // @ts-ignore
      (window.require && window.process && window.process.type) ||
      window.location.protocol === 'file:'
    );
    
    setIsElectron(!!electronDetected);
  }, []);

  return isElectron;
};

// Define the type for building subcomponent data
interface BuildingSubComItem {
    building_subcom_id: string;
    description: string;
    rate: number;
    building_com_id: string;
    percent: boolean; // Add percent field
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

// Custom components for Electron
const ElectronLoading: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <div>Loading...</div>
      </div>
    </div>
  );
};

const ElectronAlert: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  header: string;
  message: string;
  buttons: { text: string; handler?: () => void; role?: string }[];
}> = ({ isOpen, onClose, header, message, buttons }) => {
  if (!isOpen) return null;

  const handleButtonClick = (button: { text: string; handler?: () => void; role?: string }) => {
    if (button.handler) {
      button.handler();
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>{header}</h3>
        <div dangerouslySetInnerHTML={{ __html: message }} />
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          {buttons.map((button, index) => (
            <button
              key={index}
              onClick={() => handleButtonClick(button)}
              style={{
                padding: '8px 16px',
                background: button.role === 'cancel' ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {button.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const ElectronToast: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  message: string;
  duration: number;
  color?: string;
}> = ({ isOpen, onClose, message, duration, color = 'success' }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const backgroundColor = color === 'danger' ? '#dc3545' : '#28a745';

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: backgroundColor,
      color: 'white',
      padding: '12px 20px',
      borderRadius: '4px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      {message}
    </div>
  );
};

// Improved ElectronHeader with better back button visibility
const ElectronHeader: React.FC<{ 
  title: string; 
  onBack: () => void;
  subtitle?: string;
}> = ({ title, onBack, subtitle }) => (
  <div style={{
    background: '#3880ff',
    color: 'white',
    borderBottom: '1px solid #2a5fc1',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}>
    <div style={{ 
      padding: '12px 16px',
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px' 
    }}>
      <button 
        onClick={onBack}
        style={{
          background: 'rgba(255,255,255,0.2)',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        <IonIcon 
          icon={arrowBack} 
          style={{ fontSize: '16px', color: 'white' }}
        />
        Back
      </button>
      <h2 style={{ 
        margin: 0, 
        fontSize: '18px', 
        fontWeight: '600',
        flex: 1 
      }}>
        {title}
      </h2>
    </div>
    {subtitle && (
      <div style={{
        background: '#2a5fc1',
        padding: '8px 16px',
        fontSize: '14px',
        borderTop: '1px solid #1e4a9c'
      }}>
        {subtitle}
      </div>
    )}
  </div>
);

// Component to display percent status
const PercentStatus: React.FC<{ percent: boolean }> = ({ percent }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {percent ? (
        <>
          <IonIcon 
            icon={checkmarkCircle} 
            style={{ color: '#28a745', fontSize: '18px' }} 
          />
          <span style={{ color: '#28a745', fontWeight: '500' }}>Percent</span>
        </>
      ) : (
        <>
          <IonIcon 
            icon={closeCircle} 
            style={{ color: '#6c757d', fontSize: '18px' }} 
          />
          <span style={{ color: '#6c757d' }}>Fixed</span>
        </>
      )}
    </div>
  );
};

const BuildingSubCom: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [buildingSubComponents, setBuildingSubComponents] = useState<BuildingSubComItem[]>([]);
    const [selectedRow, setSelectedRow] = useState<BuildingSubComItem | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [buildingComId, setBuildingComId] = useState<string | null>(null);
    const [buildingComData, setBuildingComData] = useState<LocationState['buildingComData'] | null>(null);
    const searchRef = useRef<HTMLIonSearchbarElement>(null);
    const history = useHistory();
    const location = useLocation();
    const isElectron = useElectron();

    // Reset state when URL changes (including tab navigation)
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const comId = queryParams.get('building_com_id');
        
        setBuildingComId(comId);
        setSelectedRow(null);
        setSearchTerm('');
        setBuildingSubComponents([]);
        
        // Get building component data from navigation state or sessionStorage (for Electron)
        let buildingComDataFromStorage = null;
        if (isElectron) {
            // For Electron, get data from sessionStorage
            const storedData = sessionStorage.getItem('buildingComData');
            if (storedData) {
                try {
                    buildingComDataFromStorage = JSON.parse(storedData);
                    sessionStorage.removeItem('buildingComData'); // Clean up after use
                } catch (error) {
                    console.error('Error parsing stored buildingComData:', error);
                }
            }
        }

        const locationState = location.state as LocationState;
        if (locationState?.buildingComData) {
            setBuildingComData(locationState.buildingComData);
        } else if (buildingComDataFromStorage) {
            setBuildingComData(buildingComDataFromStorage);
        } else {
            setBuildingComData(null);
        }
    }, [location.search, location.state, isElectron]);

    // Fetch building sub-components from Supabase
    const fetchBuildingSubComponents = useCallback(async () => {
        if (!buildingComId) return;

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('building_subcomponenttbl')
                .select('building_subcom_id, description, rate, building_com_id, percent, created_at') // Add percent field
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
        if (buildingComId) {
            fetchBuildingSubComponents();
        }
    }, [buildingComId, fetchBuildingSubComponents]);

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return buildingSubComponents;

        const term = searchTerm.toLowerCase();
        return buildingSubComponents.filter(item =>
            item.building_subcom_id.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term) ||
            item.rate.toString().includes(term) ||
            item.building_com_id.toLowerCase().includes(term) ||
            (item.percent ? 'percent' : 'fixed').includes(term) // Search by percent status
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
            setShowUpdateModal(true);
        }
    };

    const handleDeleteClick = () => {
        if (selectedRow) {
            setShowDeleteAlert(true);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedRow || !buildingComId) return;

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('building_subcomponenttbl')
                .delete()
                .eq('building_subcom_id', selectedRow.building_subcom_id)
                .eq('building_com_id', buildingComId);

            if (error) throw error;

            // Refresh the data
            await fetchBuildingSubComponents();
            
            // Clear selection and show success message
            setSelectedRow(null);
            setToastMessage(`"${selectedRow.description}" deleted successfully!`);
            setShowToast(true);
        } catch (error: any) {
            console.error('Error deleting building sub-component:', error);
            setToastMessage(error.message || 'Failed to delete building sub-component');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
            setShowDeleteAlert(false);
        }
    };

    const handleBackClick = () => {
        if (isElectron) {
            window.location.hash = '/menu/home/buildingcom';
        } else {
            history.push('/menu/home/buildingcom');
        }
    };

    const handleBuildingSubComCreated = () => {
        fetchBuildingSubComponents();
        setShowCreateModal(false);
        setToastMessage('Building Sub-Component created successfully!');
        setShowToast(true);
    };

    const handleBuildingSubComUpdated = () => {
        fetchBuildingSubComponents();
        setSelectedRow(null);
        setShowUpdateModal(false);
        setToastMessage('Building Sub-Component updated successfully!');
        setShowToast(true);
    };

    const iconButtons = [
        { icon: add, onClick: handleAddClick, disabled: !buildingComId, title: "Add Building Sub-Component" },
        { icon: arrowUpCircle, onClick: handleEditClick, disabled: !selectedRow, title: "Edit Building Sub-Component" },
        { icon: trash, onClick: handleDeleteClick, disabled: !selectedRow, title: "Delete Building Sub-Component" }
    ];

    // For Electron: Use simpler structure without nested IonPage
    if (isElectron) {
        return (
            <div style={{ 
                height: '100vh', 
                display: 'flex', 
                flexDirection: 'column',
                background: '#f5f5f5'
            }}>
                <ElectronHeader 
                    title="Building Sub-Components"
                    onBack={handleBackClick}
                    subtitle={buildingComData ? `Component: ${buildingComData.building_com_id} - ${buildingComData.description}` : undefined}
                />
                
                <div style={{ 
                    flex: 1, 
                    overflow: 'auto', 
                    padding: '16px',
                    background: 'white'
                }}>
                    <IonGrid style={{ padding: 0 }}>
                        <IonRow>
                            <IonCol size="12" className="search-container">
                                <IonSearchbar
                                    ref={searchRef}
                                    placeholder="Search building sub-components..."
                                    value={searchTerm}
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
                                    keyField="building_subcom_id"
                                    onRowClick={handleRowClick}
                                    selectedRow={selectedRow}
                                />
                            </IonCol>
                        </IonRow>
                    </IonGrid>

                    {/* Use custom components for Electron */}
                    <ElectronLoading isOpen={isLoading} />

                    {/* Create Modal */}
                    {buildingComId && (
                        <BuildingSubComCreateModal
                            isOpen={showCreateModal}
                            onClose={() => setShowCreateModal(false)}
                            onBuildingSubComCreated={handleBuildingSubComCreated}
                            building_com_id={buildingComId}
                        />
                    )}

                    {/* Update Modal */}
                    {selectedRow && (
                        <BuildingSubComUpdateModal
                            isOpen={showUpdateModal}
                            onClose={() => setShowUpdateModal(false)}
                            onBuildingSubComUpdated={handleBuildingSubComUpdated}
                            buildingSubComData={selectedRow}
                        />
                    )}

                    <ElectronAlert
                        isOpen={showDeleteAlert}
                        onClose={() => setShowDeleteAlert(false)}
                        header="Confirm Delete"
                        message={`Are you sure you want to delete "${selectedRow?.description}"?`}
                        buttons={[
                            {
                                text: 'Cancel',
                                role: 'cancel',
                            },
                            {
                                text: 'Delete',
                                handler: handleDeleteConfirm,
                            }
                        ]}
                    />

                    <ElectronToast
                        isOpen={showToast}
                        onClose={() => setShowToast(false)}
                        message={toastMessage}
                        duration={3000}
                        color={isError ? 'danger' : 'success'}
                    />
                </div>
            </div>
        );
    }

    // Original code for browser
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
                                value={searchTerm}
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
                                keyField="building_subcom_id"
                                onRowClick={handleRowClick}
                                selectedRow={selectedRow}
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

                {/* Update Modal */}
                {selectedRow && (
                    <BuildingSubComUpdateModal
                        isOpen={showUpdateModal}
                        onClose={() => setShowUpdateModal(false)}
                        onBuildingSubComUpdated={handleBuildingSubComUpdated}
                        buildingSubComData={selectedRow}
                    />
                )}

                {/* Delete Confirmation Alert */}
                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => setShowDeleteAlert(false)}
                    header="Confirm Delete"
                    message={`Are you sure you want to delete "${selectedRow?.description}"?`}
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

export default BuildingSubCom;