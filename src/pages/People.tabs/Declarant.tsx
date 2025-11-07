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
    IonAlert,
    IonToast,
    IonButtons,
    IonButton
} from '@ionic/react';
import { arrowUpCircle, trash, arrowBack } from 'ionicons/icons';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import DeclarantUpdateModal from '../../components/DeclarantModals/DeclarantUpdateModal';
import { useHistory } from 'react-router-dom';

// Electron detection hook (same as in DeviceManagement)
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

// Custom Electron Components (same as in DeviceManagement)
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
        Declarants from Forms
      </h2>
    </div>
  </div>
);

interface FormItem {
    form_id: string;
    declarant: string;
    created_at?: string;
    status?: string;
    class_id?: string;
}

const Declarant: React.FC = () => {
    const history = useHistory();
    const isElectron = useElectron();
    const [forms, setForms] = useState<FormItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRow, setSelectedRow] = useState<FormItem | null>(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const searchRef = useRef<HTMLIonSearchbarElement>(null);
    const [isError, setIsError] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    // Focus search input on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            searchRef.current?.setFocus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Fetch data from formtbl - only declarant related data
    const fetchForms = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('formtbl')
                .select('form_id, declarant, created_at, status, class_id')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setForms(data || []);
        } catch (error) {
            console.error('Error fetching forms:', error);
            setToastMessage('Failed to load declarants');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchForms();
    }, [fetchForms]);

    // Filter data based on search term - search only declarant names
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return forms;

        const term = searchTerm.toLowerCase();
        return forms.filter(item =>
            item.declarant.toLowerCase().includes(term) ||
            item.form_id.toLowerCase().includes(term)
        );
    }, [forms, searchTerm]);

    const handleRowClick = (rowData: FormItem) => {
        setSelectedRow(rowData);
    };

    const handleUpdateClick = () => {
        if (selectedRow) {
            setShowUpdateModal(true);
        }
    };

    const handleDeleteClick = async () => {
        if (!selectedRow) return;
        setShowDeleteAlert(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedRow) return;

        try {
            setIsLoading(true);
            const { error } = await supabase
                .from('formtbl')
                .delete()
                .eq('form_id', selectedRow.form_id);

            if (error) throw error;

            await fetchForms();
            setSelectedRow(null);
            setToastMessage(`Form with declarant "${selectedRow.declarant}" deleted successfully!`);
            setShowToast(true);
        } catch (error) {
            console.error('Error deleting form:', error);
            setToastMessage('Failed to delete form');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
            setShowDeleteAlert(false);
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
            icon: arrowUpCircle,
            onClick: handleUpdateClick,
            disabled: !selectedRow,
            title: "Update Declarant"
        },
        {
            icon: trash,
            onClick: handleDeleteClick,
            disabled: !selectedRow,
            title: "Delete Form"
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
                                    placeholder="Search declarants..."
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
                                    title="Declarants from Forms"
                                    keyField="form_id"
                                    onRowClick={handleRowClick}
                                    selectedRow={selectedRow}
                                />
                            </IonCol>
                        </IonRow>
                    </IonGrid>

                    {/* Use custom components for Electron */}
                    <ElectronLoading isOpen={isLoading} />

                    {/* Update Modal - You might need to create an Electron version of this too */}
                    <DeclarantUpdateModal
                        isOpen={showUpdateModal}
                        onClose={() => setShowUpdateModal(false)}
                        onDeclarantUpdated={fetchForms}
                        selectedForm={selectedRow}
                    />

                    <ElectronAlert
                        isOpen={showDeleteAlert}
                        onClose={() => setShowDeleteAlert(false)}
                        header={'Confirm Delete'}
                        message={`Are you sure you want to delete the form with declarant <strong>${selectedRow?.declarant}</strong>?`}
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
                    <IonTitle>Declarants from Forms</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonGrid>
                    <IonRow>
                        <IonCol size="12" className="search-container">
                            <IonSearchbar
                                ref={searchRef}
                                placeholder="Search declarants..."
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
                                title="Declarants from Forms"
                                keyField="form_id"
                                onRowClick={handleRowClick}
                                selectedRow={selectedRow}
                            />
                        </IonCol>
                    </IonRow>
                </IonGrid>

                <IonLoading isOpen={isLoading} message="Loading..." />

                <DeclarantUpdateModal
                    isOpen={showUpdateModal}
                    onClose={() => setShowUpdateModal(false)}
                    onDeclarantUpdated={fetchForms}
                    selectedForm={selectedRow}
                />

                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => setShowDeleteAlert(false)}
                    header={'Confirm Delete'}
                    message={`Are you sure you want to delete the form with declarant <strong>${selectedRow?.declarant}</strong>?`}
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

export default Declarant;