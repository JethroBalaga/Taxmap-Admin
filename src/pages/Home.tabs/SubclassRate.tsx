import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
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
  IonSearchbar,
  IonLoading,
  IonToast,
  IonAlert,
  IonButtons,
  IonButton
} from '@ionic/react';
import { add, arrowUpCircle, trash, arrowBack } from 'ionicons/icons';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import ScrCreateModal from '../../components/SubclassRateModals/ScrCreateModal';
import ScrUpdateModal from '../../components/SubclassRateModals/ScrUpdateModal';
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

interface SubclassRateItem {
  subclassrate_id: string;
  subclass_id: string;
  rate: number;
  eff_year: string;
  created_at: string;
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

const SubclassRate: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const isElectron = useElectron();
  const [subclassId, setSubclassId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rates, setRates] = useState<SubclassRateItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<SubclassRateItem | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Reset state when URL changes (including tab navigation)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('subclass_id');
    
    setSubclassId(id);
    setSelectedRow(null);
    setRates([]);
    setSearchTerm('');
  }, [location.search]);

  // Fetch rates when subclassId changes
  const fetchRates = useCallback(async () => {
    if (!subclassId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('subclassratetbl')
        .select('subclassrate_id, subclass_id, rate, eff_year, created_at')
        .eq('subclass_id', subclassId)
        .order('eff_year', { ascending: false });

      if (error) throw error;

      setRates(data || []);
    } catch (error) {
      console.error('Error fetching rates:', error);
      setToastMessage('Failed to load rates');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  }, [subclassId]);

  useEffect(() => {
    if (subclassId) {
      fetchRates();
    }
  }, [subclassId, fetchRates]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return rates;

    const term = searchTerm.toLowerCase();
    return rates.filter(item => {
      const subclassrateIdStr = item.subclassrate_id?.toString().toLowerCase() || '';
      const rateStr = item.rate?.toString() || '';
      const effYearStr = item.eff_year?.toString() || '';

      return (
        subclassrateIdStr.includes(term) ||
        rateStr.includes(term) ||
        effYearStr.includes(term)
      );
    });
  }, [rates, searchTerm]);

  const handleRowClick = (rowData: SubclassRateItem) => {
    setSelectedRow(rowData);
  };

  const handleUpdateClick = () => {
    if (selectedRow) {
      setIsUpdateModalOpen(true);
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
        .from('subclassratetbl')
        .delete()
        .eq('subclassrate_id', selectedRow.subclassrate_id);

      if (error) throw error;

      await fetchRates();
      setSelectedRow(null);
      setToastMessage('Rate deleted successfully!');
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting rate:', error);
      setToastMessage('Failed to delete rate');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
      setShowDeleteAlert(false);
    }
  };

  const handleAddRate = () => {
    setIsCreateModalOpen(true);
  };

  const handleScrCreated = () => {
    fetchRates();
    setToastMessage('Subclass rate created successfully!');
    setShowToast(true);
  };

  const handleScrUpdated = () => {
    fetchRates();
    setToastMessage('Subclass rate updated successfully!');
    setShowToast(true);
    setIsUpdateModalOpen(false);
  };

  const handleBackClick = () => {
    const queryParams = new URLSearchParams(location.search);
    const classId = queryParams.get('class_id');

    if (isElectron) {
      if (classId) {
        window.location.hash = `/menu/home/subclass?class_id=${classId}`;
      } else {
        window.location.hash = '/menu/home/subclass';
      }
    } else {
      if (classId) {
        history.push(`/menu/home/subclass?class_id=${classId}`);
      } else {
        history.push('/menu/home/subclass');
      }
    }
  };

  const iconButtons = [
    { icon: add, onClick: handleAddRate, disabled: !subclassId, title: "Add Rate" },
    { icon: arrowUpCircle, onClick: handleUpdateClick, disabled: !selectedRow, title: "Edit Rate" },
    { icon: trash, onClick: handleDeleteClick, disabled: !selectedRow, title: "Delete Rate" }
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
          title={subclassId ? `Subclass Rates (Subclass ID: ${subclassId})` : 'Subclass Rates'}
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
                  placeholder="Search rates..."
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
                  title="Subclass Rates"
                  keyField="subclassrate_id"
                  onRowClick={handleRowClick}
                  selectedRow={selectedRow} 
                />
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Use custom components for Electron */}
          <ElectronLoading isOpen={isLoading} />

          {subclassId && (
            <ScrCreateModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onScrCreated={handleScrCreated}
              subclass_id={subclassId}
            />
          )}

          <ScrUpdateModal
            isOpen={isUpdateModalOpen}
            onClose={() => setIsUpdateModalOpen(false)}
            onScrUpdated={handleScrUpdated}
            subclassRateData={selectedRow}
          />

          <ElectronAlert
            isOpen={showDeleteAlert}
            onClose={() => setShowDeleteAlert(false)}
            header={'Confirm Delete'}
            message={`Are you sure you want to delete this rate?`}
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
          <IonTitle>
            {subclassId ? `Subclass Rates (Subclass ID: ${subclassId})` : 'Subclass Rates'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                placeholder="Search rates..."
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
                title="Subclass Rates"
                keyField="subclassrate_id"
                onRowClick={handleRowClick}
                selectedRow={selectedRow} 
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading isOpen={isLoading} message="Loading..." />

        {subclassId && (
          <ScrCreateModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onScrCreated={handleScrCreated}
            subclass_id={subclassId}
          />
        )}

        <ScrUpdateModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          onScrUpdated={handleScrUpdated}
          subclassRateData={selectedRow}
        />

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={'Confirm Delete'}
          message={`Are you sure you want to delete this rate?`}
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

export default SubclassRate;