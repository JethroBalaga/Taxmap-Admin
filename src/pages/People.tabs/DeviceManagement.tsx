import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
    IonToast,
    IonAlert,
    IonButtons,
    IonButton
} from '@ionic/react';
import { checkmarkCircleOutline, arrowBack } from 'ionicons/icons';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import { useLocation, useHistory } from 'react-router-dom';

// Electron detection hook
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

// Custom Electron Components
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

const ElectronHeader: React.FC<{ 
  onBack: () => void;
}> = ({ onBack }) => (
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
        Device Management
      </h2>
    </div>
  </div>
);

interface DeviceItem {
    device_id: string;
    user_id: string;
    device_name: string;
    registered: boolean;
    registered_at: string | null;
    created_at: string;
}

const DeviceManagement: React.FC = () => {
    const location = useLocation();
    const history = useHistory();
    const isElectron = useElectron();
    const [devices, setDevices] = useState<DeviceItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRow, setSelectedRow] = useState<DeviceItem | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [showConfirmAlert, setShowConfirmAlert] = useState(false);
    const searchRef = useRef<HTMLIonSearchbarElement>(null);

    // Focus search input on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            searchRef.current?.setFocus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Fetch devices data
    const fetchDevices = useCallback(async () => {
        setIsLoading(true);
        try {
            // Get user_id from URL parameters if available
            const urlParams = new URLSearchParams(location.search);
            const userId = urlParams.get('user_id');

            let query = supabase
                .from('deviceregistration')
                .select('*')
                .order('created_at', { ascending: false });

            // Filter by user_id if provided
            if (userId) {
                query = query.eq('user_id', userId);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Convert device_id to string to ensure consistency
            const devicesWithStringId = (data || []).map(item => ({
                ...item,
                device_id: String(item.device_id),
                user_id: String(item.user_id)
            }));

            setDevices(devicesWithStringId);
        } catch (error) {
            console.error('Error fetching devices:', error);
            setToastMessage('Failed to load devices');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    }, [location.search]);

    // Refresh data on component mount
    useEffect(() => {
        fetchDevices();
    }, [fetchDevices]);

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return devices;

        const term = searchTerm.toLowerCase();
        return devices.filter(item =>
            item.device_name.toLowerCase().includes(term) ||
            item.device_id.toLowerCase().includes(term) ||
            item.user_id.toLowerCase().includes(term)
        );
    }, [devices, searchTerm]);

    const handleRowClick = (rowData: DeviceItem) => {
        setSelectedRow(rowData);
        setShowConfirmAlert(true);
    };

    const handleRegisterDevice = async () => {
        if (!selectedRow) return;

        try {
            setIsLoading(true);

            if (selectedRow.registered) {
                // Unregister device - delete it
                const { error } = await supabase
                    .from('deviceregistration')
                    .delete()
                    .eq('device_id', selectedRow.device_id);

                if (error) throw error;

                setToastMessage('Device unregistered and deleted successfully');
            } else {
                // Register device - set registered to true and update timestamp
                const { error } = await supabase
                    .from('deviceregistration')
                    .update({ 
                        registered: true,
                        registered_at: new Date().toISOString()
                    })
                    .eq('device_id', selectedRow.device_id);

                if (error) throw error;

                setToastMessage('Device registered successfully');
            }

            setShowToast(true);
            setIsError(false);
            
            // Refresh the device list
            fetchDevices();
            
        } catch (error) {
            console.error('Error updating device:', error);
            setToastMessage('Failed to update device');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
            setShowConfirmAlert(false);
        }
    };

    const handleCancelAction = () => {
        if (!selectedRow?.registered) {
            // Only delete if the device was not registered (pending registration)
            handleDeleteDevice();
        } else {
            setShowConfirmAlert(false);
        }
    };

    const handleDeleteDevice = async () => {
        if (!selectedRow) return;

        try {
            setIsLoading(true);

            const { error } = await supabase
                .from('deviceregistration')
                .delete()
                .eq('device_id', selectedRow.device_id);

            if (error) throw error;

            setToastMessage('Device deleted successfully');
            setShowToast(true);
            setIsError(false);
            
            // Refresh the device list
            fetchDevices();
            
        } catch (error) {
            console.error('Error deleting device:', error);
            setToastMessage('Failed to delete device');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
            setShowConfirmAlert(false);
        }
    };

    const handleBackClick = () => {
        if (isElectron) {
            window.location.hash = '/menu/people/user';
        } else {
            history.push('/menu/people/user');
        }
    };

    const iconButtons = [
        {
            icon: checkmarkCircleOutline,
            onClick: () => selectedRow && handleRowClick(selectedRow),
            disabled: !selectedRow,
            title: "Manage Device Registration"
        }
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
                <ElectronHeader onBack={handleBackClick} />
                
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
                                    placeholder="Search devices..."
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
                                    title="Devices"
                                    keyField="device_id"
                                    onRowClick={handleRowClick}
                                    selectedRow={selectedRow} 
                                />
                            </IonCol>
                        </IonRow>
                    </IonGrid>

                    {/* Use custom components for Electron */}
                    <ElectronLoading isOpen={isLoading} />

                    <ElectronAlert
                        isOpen={showConfirmAlert}
                        onClose={() => setShowConfirmAlert(false)}
                        header={selectedRow?.registered ? 'Unregister Device' : 'Register Device'}
                        message={selectedRow?.registered 
                            ? `Do you want to unregister the device "${selectedRow?.device_name}"? This will delete the device record.`
                            : `Allow the device "${selectedRow?.device_name}" to be registered?`
                        }
                        buttons={[
                            {
                                text: 'No',
                                role: 'cancel',
                                handler: selectedRow?.registered ? undefined : handleCancelAction
                            },
                            {
                                text: 'Yes',
                                handler: handleRegisterDevice
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
                    <IonTitle>Device Management</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonGrid>
                    <IonRow>
                        <IonCol size="12" className="search-container">
                            <IonSearchbar
                                ref={searchRef}
                                placeholder="Search devices..."
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
                                title="Devices"
                                keyField="device_id"
                                onRowClick={handleRowClick}
                                selectedRow={selectedRow} 
                            />
                        </IonCol>
                    </IonRow>
                </IonGrid>

                <IonLoading isOpen={isLoading} message="Loading..." />

                <IonAlert
                    isOpen={showConfirmAlert}
                    onDidDismiss={() => setShowConfirmAlert(false)}
                    header={selectedRow?.registered ? 'Unregister Device' : 'Register Device'}
                    message={selectedRow?.registered 
                        ? `Do you want to unregister the device "${selectedRow?.device_name}"? This will delete the device record.`
                        : `Allow the device "${selectedRow?.device_name}" to be registered?`
                    }
                    buttons={[
                        {
                            text: 'No',
                            role: 'cancel',
                            handler: selectedRow?.registered ? undefined : handleCancelAction
                        },
                        {
                            text: 'Yes',
                            handler: handleRegisterDevice
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

export default DeviceManagement;