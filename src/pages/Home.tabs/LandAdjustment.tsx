import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonSearchbar,
  IonLoading,
  IonAlert,
  IonToast,
  IonButtons,
  IonButton
} from '@ionic/react';
import { add, arrowUpCircle, trash, arrowBack } from 'ionicons/icons';
import './../../CSS/Setup2.css';
import { supabase } from './../../utils/supaBaseClient';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import LandAdjustmentCreateModal from '../../components/LandAdjustmentModals/LandAdjustmentCreateModal';
import LandAdjustmentUpdateModal from '../../components/LandAdjustmentModals/LandAdjustmentUpdateModal';
import { useHistory, useLocation } from 'react-router-dom';

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

interface LandAdjustmentItem {
  adjustment_id: string;
  description: string;
  adjustment_factor: string;
  adjustment_type: string;
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

const LandAdjustment: React.FC = () => {
  const [landAdjustments, setLandAdjustments] = useState<LandAdjustmentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState<LandAdjustmentItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  // Fetch land adjustments data
  const fetchLandAdjustments = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('landadjustmenttbl')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLandAdjustments(data || []);
    } catch (error) {
      console.error('Error fetching land adjustments:', error);
      setToastMessage('Failed to load land adjustments');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLandAdjustments();
  }, [fetchLandAdjustments]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return landAdjustments;

    const term = searchTerm.toLowerCase();
    return landAdjustments.filter(item =>
      item.adjustment_id.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.adjustment_factor.toLowerCase().includes(term) ||
      item.adjustment_type.toLowerCase().includes(term)
    );
  }, [landAdjustments, searchTerm]);

  // Row selection handler
  const handleRowClick = (rowData: LandAdjustmentItem) => {
    setSelectedRow(rowData);
  };

  // Create functionality
  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  // Edit functionality
  const handleArrowUpClick = () => {
    if (!selectedRow) return;
    setShowUpdateModal(true);
  };

  // Delete functionality
  const handleTrashClick = () => {
    if (!selectedRow) return;
    setShowDeleteAlert(true);
  };

  // Back button functionality
  const handleBackClick = () => {
    if (isElectron) {
      window.location.hash = '/menu/home';
    } else {
      history.push('/menu/home');
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!selectedRow) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('landadjustmenttbl')
        .delete()
        .eq('adjustment_id', selectedRow.adjustment_id);

      if (error) throw error;

      await fetchLandAdjustments();
      setSelectedRow(null);
      setToastMessage('Land adjustment deleted successfully');
      setIsError(false);
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting land adjustment:', error);
      setToastMessage('Failed to delete land adjustment');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
      setShowDeleteAlert(false);
    }
  };

  // Handle creation success
  const handleLandAdjustmentCreated = () => {
    fetchLandAdjustments();
    setShowCreateModal(false);
    setToastMessage('Land adjustment created successfully');
    setIsError(false);
    setShowToast(true);
  };

  // Handle update success
  const handleLandAdjustmentUpdated = () => {
    fetchLandAdjustments();
    setSelectedRow(null);
    setShowUpdateModal(false);
    setToastMessage('Land adjustment updated successfully');
    setIsError(false);
    setShowToast(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
  };

  const iconButtons = [
    { icon: add, onClick: handleCreateClick, disabled: false, title: "Create New" },
    { icon: arrowUpCircle, onClick: handleArrowUpClick, disabled: !selectedRow, title: "Edit" },
    { icon: trash, onClick: handleTrashClick, disabled: !selectedRow, title: "Delete" }
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
          title="Residential Land"
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
                  placeholder="Search land adjustments..."
                  value={searchTerm}
                  onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                  debounce={200}
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
                  title="Land Adjustments"
                  keyField="adjustment_id"
                  onRowClick={handleRowClick}
                  selectedRow={selectedRow}
                />
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Use custom components for Electron */}
          <ElectronLoading isOpen={isLoading} />

          {/* Create Modal */}
          <LandAdjustmentCreateModal
            isOpen={showCreateModal}
            onClose={handleCloseCreateModal}
            onLandAdjustmentCreated={handleLandAdjustmentCreated}
          />

          {/* Update Modal */}
          <LandAdjustmentUpdateModal
            isOpen={showUpdateModal}
            onClose={handleCloseUpdateModal}
            onLandAdjustmentUpdated={handleLandAdjustmentUpdated}
            landAdjustmentData={selectedRow}
          />

          <ElectronAlert
            isOpen={showDeleteAlert}
            onClose={() => setShowDeleteAlert(false)}
            header={'Confirm Delete'}
            message={`Are you sure you want to delete adjustment ${selectedRow?.adjustment_id} (${selectedRow?.description})?`}
            buttons={[
              {
                text: 'Cancel',
                role: 'cancel',
              },
              {
                text: 'Delete',
                handler: handleDeleteConfirm
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
          <IonTitle>Residential Land</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search land adjustments..."
                value={searchTerm}
                onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                debounce={200}
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
                title="Land Adjustments"
                keyField="adjustment_id"
                onRowClick={handleRowClick}
                selectedRow={selectedRow}
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading isOpen={isLoading} message="Loading..." />

        {/* Create Modal */}
        <LandAdjustmentCreateModal
          isOpen={showCreateModal}
          onClose={handleCloseCreateModal}
          onLandAdjustmentCreated={handleLandAdjustmentCreated}
        />

        {/* Update Modal */}
        <LandAdjustmentUpdateModal
          isOpen={showUpdateModal}
          onClose={handleCloseUpdateModal}
          onLandAdjustmentUpdated={handleLandAdjustmentUpdated}
          landAdjustmentData={selectedRow}
        />

        {/* Delete Confirmation Alert */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={'Confirm Delete'}
          message={`Are you sure you want to delete adjustment ${selectedRow?.adjustment_id} (${selectedRow?.description})?`}
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

export default LandAdjustment;