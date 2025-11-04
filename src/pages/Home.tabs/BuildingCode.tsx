import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
    IonButton,
    IonLabel,
    IonButtons
} from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import { add, arrowUpCircle, trash, arrowBack } from 'ionicons/icons';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import BuildingCreateModal from '../../components/BuildingCodeModals/BuildingCreateModal';
import BuildingUpdateModal from '../../components/BuildingCodeModals/BuildingUpdateModal';

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

// Define the type for the location state
interface LocationState {
    structureData?: {
        structure_code: string;
        description: string;
        rate: string;
        created_at?: string;
    };
}

// Define the type for building code data
interface BuildingCodeItem {
    building_code: string;
    description: string;
    rate: number;
    created_at?: string;
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

const BuildingCode: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [buildingCodes, setBuildingCodes] = useState<BuildingCodeItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState<BuildingCodeItem | null>(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const searchRef = useRef<HTMLIonSearchbarElement>(null);
    const location = useLocation();
    const history = useHistory();
    const isElectron = useElectron();
    const [structureCode, setStructureCode] = useState<string | null>(null);
    const [structureData, setStructureData] = useState<LocationState['structureData'] | null>(null);

    // Reset state when URL changes (including tab navigation)
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('structure_code');
        
        setStructureCode(code);
        setSelectedRow(null);
        setSearchTerm('');
        setBuildingCodes([]);
        
        // Get structure data from navigation state with proper typing
        const locationState = location.state as LocationState;
        if (locationState?.structureData) {
            setStructureData(locationState.structureData);
        } else {
            setStructureData(null);
        }
    }, [location.search, location.state]);

    // Fetch building codes when structureCode changes
    const fetchBuildingCodes = useCallback(async () => {
        if (!structureCode) return;

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('building_codetbl')
                .select('building_code, description, rate, created_at')
                .eq('structure_code', structureCode)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBuildingCodes(data || []);
        } catch (error) {
            console.error('Error fetching building codes:', error);
            setToastMessage('Failed to load building codes');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    }, [structureCode]);

    useEffect(() => {
        if (structureCode) {
            fetchBuildingCodes();
        }
    }, [structureCode, fetchBuildingCodes]);

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return buildingCodes;

        const term = searchTerm.toLowerCase();
        return buildingCodes.filter(item =>
            item.building_code.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term) ||
            item.rate.toString().toLowerCase().includes(term)
        );
    }, [buildingCodes, searchTerm]);

    const handleRowClick = (rowData: BuildingCodeItem) => {
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

    const handleBackClick = () => {
        if (isElectron) {
            window.location.hash = '/menu/home/structure';
        } else {
            history.push('/menu/home/structure');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedRow) return;

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('building_codetbl')
                .delete()
                .eq('building_code', selectedRow.building_code)
                .eq('structure_code', structureCode);

            if (error) throw error;

            setToastMessage(`${selectedRow.description} deleted successfully!`);
            setSelectedRow(null);
            fetchBuildingCodes();
        } catch (error) {
            setToastMessage('Failed to delete building code');
            setIsError(true);
            console.error('Error deleting building code:', error);
        } finally {
            setIsLoading(false);
            setShowDeleteAlert(false);
            setShowToast(true);
        }
    };

    const handleBuildingCodeCreated = () => {
        fetchBuildingCodes();
        setShowCreateModal(false);
        setToastMessage('Building code created successfully!');
        setShowToast(true);
    };

    const handleBuildingCodeUpdated = () => {
        fetchBuildingCodes();
        setSelectedRow(null);
        setShowUpdateModal(false);
        setToastMessage('Building code updated successfully!');
        setShowToast(true);
    };

    const iconButtons = [
        { icon: add, onClick: handleAddClick, disabled: !structureCode, title: "Add Building Code" },
        { icon: arrowUpCircle, onClick: handleEditClick, disabled: !selectedRow, title: "Edit Building Code" },
        { icon: trash, onClick: handleDeleteClick, disabled: !selectedRow, title: "Delete Building Code" }
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
                    title="Building Codes"
                    onBack={handleBackClick}
                    subtitle={structureData ? `Structure: ${structureData.structure_code} - ${structureData.description}` : undefined}
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
                                    placeholder="Search building codes..."
                                    value={searchTerm}
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
                                    title="Building Codes"
                                    keyField="building_code"
                                    onRowClick={handleRowClick}
                                    selectedRow={selectedRow} 
                                />
                            </IonCol>
                        </IonRow>
                    </IonGrid>

                    {/* Use custom components for Electron */}
                    <ElectronLoading isOpen={isLoading} />

                    {/* Building Code Create Modal */}
                    {structureCode && (
                        <BuildingCreateModal
                            isOpen={showCreateModal}
                            onClose={() => setShowCreateModal(false)}
                            onBuildingCodeCreated={handleBuildingCodeCreated}
                            structure_code={structureCode}
                        />
                    )}

                    {/* Building Code Update Modal */}
                    <BuildingUpdateModal
                        isOpen={showUpdateModal}
                        onClose={() => setShowUpdateModal(false)}
                        onBuildingCodeUpdated={handleBuildingCodeUpdated}
                        buildingCodeData={selectedRow}
                    />

                    <ElectronAlert
                        isOpen={showDeleteAlert}
                        onClose={() => setShowDeleteAlert(false)}
                        header="Confirm Delete"
                        message={`Are you sure you want to delete ${selectedRow?.description}?`}
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
                        Building Codes
                    </IonTitle>
                </IonToolbar>
                {structureData && (
                    <IonToolbar>
                        <IonLabel className="structure-label">
                            Structure: {structureData.structure_code} - {structureData.description}
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
                                placeholder="Search building codes..."
                                value={searchTerm}
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
                                title="Building Codes"
                                keyField="building_code"
                                onRowClick={handleRowClick}
                                selectedRow={selectedRow} 
                            />
                        </IonCol>
                    </IonRow>
                </IonGrid>

                {/* Building Code Create Modal */}
                {structureCode && (
                    <BuildingCreateModal
                        isOpen={showCreateModal}
                        onClose={() => setShowCreateModal(false)}
                        onBuildingCodeCreated={handleBuildingCodeCreated}
                        structure_code={structureCode}
                    />
                )}

                {/* Building Code Update Modal */}
                <BuildingUpdateModal
                    isOpen={showUpdateModal}
                    onClose={() => setShowUpdateModal(false)}
                    onBuildingCodeUpdated={handleBuildingCodeUpdated}
                    buildingCodeData={selectedRow}
                />

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

export default BuildingCode;