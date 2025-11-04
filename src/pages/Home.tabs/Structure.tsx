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
    IonButtons,
    IonButton
} from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import { add, arrowUpCircle, constructOutline, cubeOutline, trash, arrowBack } from 'ionicons/icons';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import StructureCreateModal from '../../components/StructureModals/StructureCreateModal';
import StructureUpdateModal from '../../components/StructureModals/StructureUpdateModal';

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

// Define the type for structure data
interface StructureItem {
    structure_code: string;
    description: string;
    eff_date: string;
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

const Structure: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [structures, setStructures] = useState<StructureItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState<StructureItem | null>(null);
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
    }, [location.pathname]);

    // Fetch structures
    const fetchStructures = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('structure_typetbl')
                .select('structure_code, description, eff_date, created_at')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setStructures(data || []);
        } catch (error) {
            console.error('Error fetching structures:', error);
            setToastMessage('Failed to load structures');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStructures();
    }, [fetchStructures]);

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return structures;

        const term = searchTerm.toLowerCase();
        return structures.filter(item =>
            item.structure_code.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term) ||
            item.eff_date.toLowerCase().includes(term)
        );
    }, [structures, searchTerm]);

    const handleRowClick = (rowData: StructureItem) => {
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

    const handleConstructClick = () => {
        if (!selectedRow) return;
        
        if (isElectron) {
            window.location.hash = `/menu/home/buildingcode?structure_code=${selectedRow.structure_code}`;
            // Store the data in sessionStorage for Electron since we can't pass state
            sessionStorage.setItem('structureData', JSON.stringify(selectedRow));
        } else {
            history.push({
                pathname: '/menu/home/buildingcode',
                search: `?structure_code=${selectedRow.structure_code}`,
                state: { structureData: selectedRow }
            });
        }
    };

    const handleCubeOutlineClick = () => {
        // Always enabled - navigate to building components without requiring selected row
        if (isElectron) {
            window.location.hash = '/menu/home/buildingcom';
        } else {
            history.push('/menu/home/buildingcom');
        }
    };

    // Add back button handler
    const handleBackClick = () => {
        if (isElectron) {
            window.location.hash = '/menu/home';
        } else {
            history.push('/menu/home');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedRow) return;

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('structure_typetbl')
                .delete()
                .eq('structure_code', selectedRow.structure_code);

            if (error) throw error;

            setToastMessage(`${selectedRow.description} deleted successfully!`);
            setSelectedRow(null);
            fetchStructures();
        } catch (error) {
            setToastMessage('Failed to delete structure');
            setIsError(true);
            console.error('Error deleting structure:', error);
        } finally {
            setIsLoading(false);
            setShowDeleteAlert(false);
            setShowToast(true);
        }
    };

    const handleStructureCreated = () => {
        fetchStructures();
        setShowCreateModal(false);
        setToastMessage('Structure created successfully!');
        setShowToast(true);
    };

    const handleStructureUpdated = () => {
        fetchStructures();
        setSelectedRow(null);
        setShowUpdateModal(false);
        setToastMessage('Structure updated successfully!');
        setShowToast(true);
    };

    const iconButtons = [
        { icon: add, onClick: handleAddClick, disabled: false, title: "Add Structure" },
        { icon: arrowUpCircle, onClick: handleEditClick, disabled: !selectedRow, title: "Edit Structure" },
        { icon: trash, onClick: handleDeleteClick, disabled: !selectedRow, title: "Delete Structure" },
        { icon: constructOutline, onClick: handleConstructClick, disabled: !selectedRow, title: "Building Code" },
        { icon: cubeOutline, onClick: handleCubeOutlineClick, disabled: false, title: "Building Component" } // Always enabled
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
                    title="Structure Setup"
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
                                    placeholder="Search structures..."
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
                                    title="Structures"
                                    keyField="structure_code"
                                    onRowClick={handleRowClick}
                                    selectedRow={selectedRow} 
                                />
                            </IonCol>
                        </IonRow>
                    </IonGrid>

                    {/* Use custom components for Electron */}
                    <ElectronLoading isOpen={isLoading} />

                    {/* Structure Create Modal */}
                    <StructureCreateModal
                        isOpen={showCreateModal}
                        onClose={() => setShowCreateModal(false)}
                        onStructureCreated={handleStructureCreated}
                    />

                    {/* Structure Update Modal */}
                    <StructureUpdateModal
                        isOpen={showUpdateModal}
                        onClose={() => setShowUpdateModal(false)}
                        onStructureUpdated={handleStructureUpdated}
                        structureData={selectedRow}
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
                    <IonTitle>Structure Setup</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonGrid>
                    <IonRow>
                        <IonCol size="12" className="search-container">
                            <IonSearchbar
                                ref={searchRef}
                                placeholder="Search structures..."
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
                                title="Structures"
                                keyField="structure_code"
                                onRowClick={handleRowClick}
                                selectedRow={selectedRow} 
                            />
                        </IonCol>
                    </IonRow>
                </IonGrid>

                {/* Structure Create Modal */}
                <StructureCreateModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onStructureCreated={handleStructureCreated}
                />

                {/* Structure Update Modal */}
                <StructureUpdateModal
                    isOpen={showUpdateModal}
                    onClose={() => setShowUpdateModal(false)}
                    onStructureUpdated={handleStructureUpdated}
                    structureData={selectedRow}
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

export default Structure;