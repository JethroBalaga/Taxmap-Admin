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
    IonButtons,
    IonLabel
} from '@ionic/react';
import { add, arrowUpCircle, trash, arrowBack, appsOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import BuildingComCreateModal from '../../components/BuildingComModals/BuildingComCreateModal';
import BuildingComUpdateModal from '../../components/BuildingComModals/BuildingComUpdateModal';
import { supabase } from '../../utils/supaBaseClient';

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

// Define the type for building component data
interface BuildingComItem {
    building_com_id: string;
    description: string;
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
}> = ({ title, onBack }) => (
  <div style={{
    background: '#3880ff',
    color: 'white',
    padding: '12px 16px',
    borderBottom: '1px solid #2a5fc1',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
  </div>
);

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
    const history = useHistory();
    const location = useLocation();
    const isElectron = useElectron();

    // Reset state when location changes (including tab navigation)
    useEffect(() => {
        setSelectedRow(null);
        setSearchTerm('');
        // Note: We don't reset buildingComponents here since we want to keep the data
        // but we reset selection and search when navigating
    }, [location.pathname]);

    // Fetch building components from Supabase
    const fetchBuildingComponents = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('building_componenttbl')
                .select('building_com_id, description, created_at')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setBuildingComponents(data || []);
        } catch (error: any) {
            console.error('Error fetching building components:', error);
            setToastMessage(error.message || 'Failed to load building components');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBuildingComponents();
    }, [fetchBuildingComponents]);

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return buildingComponents;

        const term = searchTerm.toLowerCase();
        return buildingComponents.filter(item =>
            item.building_com_id.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term)
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

    const handleManageSubcomponents = () => {
        if (selectedRow) {
            // Navigate to BuildingSubCom with the selected building component data
            if (isElectron) {
                window.location.hash = `/menu/home/buildingsubcom?building_com_id=${selectedRow.building_com_id}`;
                // Store the data in sessionStorage for Electron since we can't pass state
                sessionStorage.setItem('buildingComData', JSON.stringify(selectedRow));
            } else {
                history.push({
                    pathname: '/menu/home/buildingsubcom',
                    search: `?building_com_id=${selectedRow.building_com_id}`,
                    state: {
                        buildingComData: selectedRow
                    }
                });
            }
        }
    };

    const handleBackClick = () => {
        // Navigate back to the structure page
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
                .from('building_componenttbl')
                .delete()
                .eq('building_com_id', selectedRow.building_com_id);

            if (error) throw error;

            await fetchBuildingComponents();
            setSelectedRow(null);
            setToastMessage('Building component deleted successfully!');
            setShowToast(true);
        } catch (error: any) {
            console.error('Error deleting building component:', error);
            setToastMessage(error.message || 'Failed to delete building component');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
            setShowDeleteAlert(false);
        }
    };

    const handleBuildingComCreated = () => {
        fetchBuildingComponents();
        setShowCreateModal(false);
        setToastMessage('Building component created successfully!');
        setShowToast(true);
    };

    const handleBuildingComUpdated = () => {
        fetchBuildingComponents();
        setSelectedRow(null);
        setShowUpdateModal(false);
        setToastMessage('Building component updated successfully!');
        setShowToast(true);
    };

    const iconButtons = [
        { icon: add, onClick: handleAddClick, disabled: false, title: "Add Building Component" },
        { icon: arrowUpCircle, onClick: handleEditClick, disabled: !selectedRow, title: "Edit Building Component" },
        { icon: trash, onClick: handleDeleteClick, disabled: !selectedRow, title: "Delete Building Component" },
        { icon: appsOutline, onClick: handleManageSubcomponents, disabled: !selectedRow, title: "Manage Subcomponents" }
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
                    title="Building Component Setup"
                    onBack={handleBackClick}
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
                                    placeholder="Search building components..."
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
                                    title="Building Components"
                                    keyField="building_com_id"
                                    onRowClick={handleRowClick}
                                    selectedRow={selectedRow} 
                                />
                            </IonCol>
                        </IonRow>
                    </IonGrid>

                    {/* Use custom components for Electron */}
                    <ElectronLoading isOpen={isLoading} />

                    {/* Create Modal */}
                    <BuildingComCreateModal
                        isOpen={showCreateModal}
                        onClose={() => setShowCreateModal(false)}
                        onBuildingComCreated={handleBuildingComCreated}
                    />

                    {/* Update Modal */}
                    {selectedRow && (
                        <BuildingComUpdateModal
                            isOpen={showUpdateModal}
                            onClose={() => setShowUpdateModal(false)}
                            onBuildingComUpdated={handleBuildingComUpdated}
                            buildingComData={selectedRow}
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
                                title="Building Components"
                                keyField="building_com_id"
                                onRowClick={handleRowClick}
                                selectedRow={selectedRow} 
                            />
                        </IonCol>
                    </IonRow>
                </IonGrid>

                {/* Create Modal */}
                <BuildingComCreateModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onBuildingComCreated={handleBuildingComCreated}
                />

                {/* Update Modal */}
                {selectedRow && (
                    <BuildingComUpdateModal
                        isOpen={showUpdateModal}
                        onClose={() => setShowUpdateModal(false)}
                        onBuildingComUpdated={handleBuildingComUpdated}
                        buildingComData={selectedRow}
                    />
                )}

                {/* Delete Confirmation */}
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

export default BuildingCom;