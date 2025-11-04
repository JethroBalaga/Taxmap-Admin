import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
import { add, arrowUpCircle, trash, arrowBack } from 'ionicons/icons';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { useLocation, useHistory } from 'react-router-dom';
import { supabase } from '../../utils/supaBaseClient';
import BarangayCreateModal from '../../components/BarangayModals/BarangayCreateModal';
import BarangayUpdateModal from '../../components/BarangayModals/BarangayUpdateModal';

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

interface BarangayItem {
  barangay_id: string;
  barangay: string;
  district_id: number;
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

const Barangay: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const isElectron = useElectron();
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [barangays, setBarangays] = useState<BarangayItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState<BarangayItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const searchRef = useRef<HTMLIonSearchbarElement>(null);

  // Reset state when URL changes (including tab navigation)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('district_id');
    
    if (id) {
      setDistrictId(Number(id));
    } else {
      setDistrictId(null);
    }
    setSelectedRow(null);
    setSearchTerm('');
    setBarangays([]);
  }, [location.search]);

  // Fetch barangays when districtId changes
  const fetchBarangays = useCallback(async () => {
    if (!districtId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('barangaytbl')
        .select('*')
        .eq('district_id', districtId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBarangays(data || []);
    } catch (error) {
      console.error('Error fetching barangays:', error);
      setToastMessage('Failed to load barangays');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  }, [districtId]);

  useEffect(() => {
    if (districtId) {
      fetchBarangays();
    }
  }, [districtId, fetchBarangays]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return barangays;

    const term = searchTerm.toLowerCase();
    return barangays.filter(item =>
      item.barangay_id.toLowerCase().includes(term) ||
      item.barangay.toLowerCase().includes(term)
    );
  }, [barangays, searchTerm]);

  const handleRowClick = (rowData: BarangayItem) => {
    setSelectedRow(rowData);
  };

  const handleCreateClick = () => {
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
    if (!selectedRow) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('barangaytbl')
        .delete()
        .eq('barangay_id', selectedRow.barangay_id);

      if (error) throw error;

      setToastMessage(`${selectedRow.barangay} deleted successfully!`);
      setSelectedRow(null);
      fetchBarangays();
    } catch (error) {
      setToastMessage('Failed to delete barangay');
      setIsError(true);
      console.error('Error deleting barangay:', error);
    } finally {
      setIsLoading(false);
      setShowDeleteAlert(false);
      setShowToast(true);
    }
  };

  const handleBarangayCreated = () => {
    fetchBarangays();
    setShowCreateModal(false);
    setToastMessage('Barangay created successfully!');
    setShowToast(true);
  };

  const handleBarangayUpdated = () => {
    fetchBarangays();
    setSelectedRow(null);
    setShowUpdateModal(false);
    setToastMessage('Barangay updated successfully!');
    setShowToast(true);
  };

  const handleBackClick = () => {
    if (isElectron) {
      window.location.hash = '/menu/home/district';
    } else {
      history.push('/menu/home/district');
    }
  };

  const iconButtons = [
    { icon: add, onClick: handleCreateClick, disabled: !districtId, title: "Add Barangay" },
    { icon: arrowUpCircle, onClick: handleEditClick, disabled: !selectedRow, title: "Edit Barangay" },
    { icon: trash, onClick: handleDeleteClick, disabled: !selectedRow, title: "Delete Barangay" }
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
          title={districtId ? `Barangays (District ID: ${districtId})` : 'Barangays'}
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
                  placeholder="Search barangays..."
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
                  title="Barangays"
                  keyField="barangay_id"
                  onRowClick={handleRowClick}
                  selectedRow={selectedRow} 
                />
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Use custom components for Electron */}
          <ElectronLoading isOpen={isLoading} />

          {/* Create Modal */}
          {districtId && (
            <BarangayCreateModal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onBarangayCreated={handleBarangayCreated}
              district_id={districtId}
            />
          )}

          {/* Update Modal */}
          <BarangayUpdateModal
            isOpen={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
            barangayData={selectedRow ? {
              barangay_id: selectedRow.barangay_id,
              barangay_name: selectedRow.barangay,
              district_id: selectedRow.district_id
            } : null}
            onBarangayUpdated={handleBarangayUpdated}
          />

          <ElectronAlert
            isOpen={showDeleteAlert}
            onClose={() => setShowDeleteAlert(false)}
            header="Confirm Delete"
            message={`Are you sure you want to delete ${selectedRow?.barangay}?`}
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
            {districtId ? `Barangays (District ID: ${districtId})` : 'Barangays'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search barangays..."
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
                title="Barangays"
                keyField="barangay_id"
                onRowClick={handleRowClick}
                selectedRow={selectedRow} 
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Create Modal */}
        {districtId && (
          <BarangayCreateModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onBarangayCreated={handleBarangayCreated}
            district_id={districtId}
          />
        )}

        {/* Update Modal */}
        <BarangayUpdateModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          barangayData={selectedRow ? {
            barangay_id: selectedRow.barangay_id,
            barangay_name: selectedRow.barangay,
            district_id: selectedRow.district_id
          } : null}
          onBarangayUpdated={handleBarangayUpdated}
        />

        {/* Delete Confirmation */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Confirm Delete"
          message={`Are you sure you want to delete ${selectedRow?.barangay}?`}
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

export default Barangay;