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
import { add, arrowUpCircle, layersOutline, trash, briefcaseOutline, arrowBack } from 'ionicons/icons';
import './../../CSS/Setup.css';
import ClassificationCreateModal from '../../components/ClassificationModals/ClassificationCreateModal';
import ClassificationUpdateModal from '../../components/ClassificationModals/ClassificationUpdateModal';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import { useHistory, useLocation } from 'react-router-dom';

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
        Classification Setup
      </h2>
    </div>
  </div>
);

interface ClassificationItem {
  class_id: string;
  classification: string;
  created_at?: string;
}

// Error Boundary Component
const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log('ErrorBoundary mounted for Classification page');
  }, []);

  const handleOnError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Error in Classification component:', error);
    console.error('Error details:', errorInfo);
    setHasError(true);
  };

  if (hasError) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        background: '#f5f5f5'
      }}>
        <div style={{ 
          background: '#3880ff',
          color: 'white',
          padding: '12px 16px'
        }}>
          <h2 style={{ margin: 0 }}>Error</h2>
        </div>
        <div style={{ 
          flex: 1, 
          padding: '20px', 
          textAlign: 'center',
          background: 'white'
        }}>
          <h2>Something went wrong</h2>
          <p>There was an error loading the Classification page.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: '#3880ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const Classification: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const isElectron = useElectron();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [classifications, setClassifications] = useState<ClassificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState<ClassificationItem | null>(null);
  const [selectedClassification, setSelectedClassification] = useState<ClassificationItem | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showCannotDeleteAlert, setShowCannotDeleteAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const [isError, setIsError] = useState(false);

  console.log('Classification component rendering, path:', location.pathname);

  // Reset state when location changes (prevents stale data on refresh/navigation)
  useEffect(() => {
    console.log('Classification: Location changed, resetting state');
    setSelectedRow(null);
    setSearchTerm('');
  }, [location.pathname]);

  // Focus search input on mount
  useEffect(() => {
    console.log('Classification: Setting up focus timer');
    const timer = setTimeout(() => {
      console.log('Classification: Attempting to focus searchbar');
      searchRef.current?.setFocus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch data
  const fetchClassifications = useCallback(async () => {
    console.log('Classification: Starting to fetch classifications');
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('classtbl')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Classification: Data fetched successfully, count:', data?.length);
      setClassifications(data || []);
    } catch (error) {
      console.error('Error fetching classifications:', error);
      setToastMessage('Failed to load classifications');
      setIsError(true);
      setShowToast(true);
    } finally {
      console.log('Classification: Fetch completed, setting loading to false');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('Classification: useEffect triggered, calling fetchClassifications');
    fetchClassifications();
  }, [fetchClassifications]);

  // Check if classification is used in other tables
  const checkIfClassificationIsUsed = async (classId: string) => {
    try {
      // Check in subclass table first
      const { count: subclassCount } = await supabase
        .from('subclasstbl')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', classId);

      // Add other related tables if needed
      return (subclassCount || 0) > 0;
    } catch (error) {
      console.error('Error checking classification usage:', error);
      return true;
    }
  };

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return classifications;

    const term = searchTerm.toLowerCase();
    return classifications.filter(item =>
      item.class_id.toLowerCase().includes(term) ||
      item.classification.toLowerCase().includes(term)
    );
  }, [classifications, searchTerm]);

  const handleRowClick = (rowData: ClassificationItem) => {
    setSelectedRow(rowData);
  };

  const handleUpdateClick = () => {
    if (selectedRow) {
      setSelectedClassification(selectedRow);
      setShowUpdateModal(true);
    }
  };

  const handleDeleteClick = async () => {
    if (!selectedRow) return;

    setIsLoading(true);
    try {
      const isUsed = await checkIfClassificationIsUsed(selectedRow.class_id);

      if (isUsed) {
        setShowCannotDeleteAlert(true);
      } else {
        setShowDeleteAlert(true);
      }
    } catch (error) {
      console.error('Error checking classification usage:', error);
      setToastMessage('Error checking if classification can be deleted');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('classtbl')
        .delete()
        .eq('class_id', selectedRow.class_id);

      if (error) throw error;

      await fetchClassifications();
      setSelectedRow(null);
      setToastMessage(`${selectedRow.classification} deleted successfully!`);
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting classification:', error);
      setToastMessage('Failed to delete classification');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
      setShowDeleteAlert(false);
    }
  };

  const navigateToSubclass = () => {
    if (selectedRow) {
      if (isElectron) {
        window.location.hash = `/menu/home/subclass?class_id=${selectedRow.class_id}`;
      } else {
        history.push({
          pathname: '/menu/home/subclass',
          search: `?class_id=${selectedRow.class_id}`,
          state: {
            classificationData: {
              class_id: selectedRow.class_id,
              classification: selectedRow.classification
            }
          }
        });
      }
    }
  };

  const navigateToActualUsed = () => {
    if (selectedRow) {
      if (isElectron) {
        window.location.hash = `/menu/home/actualused?class_id=${selectedRow.class_id}`;
      } else {
        history.push({
          pathname: '/menu/home/actualused',
          search: `?class_id=${selectedRow.class_id}`,
          state: {
            classificationData: {
              class_id: selectedRow.class_id,
              classification: selectedRow.classification
            }
          }
        });
      }
    }
  };

  const handleBackClick = () => {
    if (isElectron) {
      window.location.hash = '/menu';
    } else {
      history.push('/menu');
    }
  };

  const iconButtons = [
    { icon: add, onClick: () => setShowCreateModal(true), disabled: false, title: "Add Classification" },
    { icon: arrowUpCircle, onClick: handleUpdateClick, disabled: !selectedRow, title: "Edit Classification" },
    { icon: trash, onClick: handleDeleteClick, disabled: !selectedRow, title: "Delete Classification" },
    { icon: layersOutline, onClick: navigateToSubclass, disabled: !selectedRow, title: "Manage Subclasses" },
    { icon: briefcaseOutline, onClick: navigateToActualUsed, disabled: !selectedRow, title: "Manage Actual Used" }
  ];

  console.log('Classification: Rendering JSX, isLoading:', isLoading, 'data count:', classifications.length);

  // For Electron: Use simpler structure without nested IonPage
  if (isElectron) {
    return (
      <ErrorBoundary>
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
                    placeholder="Search classifications..."
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
                    title="Classifications"
                    keyField="class_id"
                    onRowClick={handleRowClick}
                    selectedRow={selectedRow} 
                  />
                </IonCol>
              </IonRow>
            </IonGrid>

            {/* Use custom components for Electron */}
            <ElectronLoading isOpen={isLoading} />

            {/* Modals - These should work in Electron if they use proper React Portals */}
            <ClassificationCreateModal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onClassificationCreated={fetchClassifications}
            />

            <ClassificationUpdateModal
              isOpen={showUpdateModal}
              onClose={() => setShowUpdateModal(false)}
              classificationData={selectedClassification}
              onClassificationUpdated={fetchClassifications}
            />

            <ElectronAlert
              isOpen={showDeleteAlert}
              onClose={() => setShowDeleteAlert(false)}
              header={'Confirm Delete'}
              message={`Are you sure you want to delete the classification <strong>${selectedRow?.classification}</strong>?`}
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

            <ElectronAlert
              isOpen={showCannotDeleteAlert}
              onClose={() => setShowCannotDeleteAlert(false)}
              header={'Cannot Delete'}
              message={`The classification <strong>${selectedRow?.classification}</strong> cannot be deleted because it has associated subclasses.`}
              buttons={[{ text: 'OK', handler: () => {} }]}
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
      </ErrorBoundary>
    );
  }

  // Original code for browser
  return (
    <ErrorBoundary>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={handleBackClick}>
                <IonIcon icon={arrowBack} />
              </IonButton>
            </IonButtons>
            <IonTitle>Classification Setup</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent fullscreen>
          <IonGrid>
            <IonRow>
              <IonCol size="12" className="search-container">
                <IonSearchbar
                  ref={searchRef}
                  placeholder="Search classifications..."
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
                  title="Classifications"
                  keyField="class_id"
                  onRowClick={handleRowClick}
                  selectedRow={selectedRow} 
                />
              </IonCol>
            </IonRow>
          </IonGrid>

          <IonLoading isOpen={isLoading} message="Loading..." />

          <ClassificationCreateModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onClassificationCreated={fetchClassifications}
          />

          <ClassificationUpdateModal
            isOpen={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
            classificationData={selectedClassification}
            onClassificationUpdated={fetchClassifications}
          />

          <IonAlert
            isOpen={showDeleteAlert}
            onDidDismiss={() => setShowDeleteAlert(false)}
            header={'Confirm Delete'}
            message={`Are you sure you want to delete the classification <strong>${selectedRow?.classification}</strong>?`}
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

          <IonAlert
            isOpen={showCannotDeleteAlert}
            onDidDismiss={() => setShowCannotDeleteAlert(false)}
            header={'Cannot Delete'}
            message={`The classification <strong>${selectedRow?.classification}</strong> cannot be deleted because it has associated subclasses.`}
            buttons={['OK']}
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
    </ErrorBoundary>
  );
};

export default Classification;