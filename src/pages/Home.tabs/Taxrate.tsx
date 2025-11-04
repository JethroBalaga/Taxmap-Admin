import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonLoading,
  IonAlert,
  IonToast,
  IonButtons,
  IonButton
} from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import { add, arrowUpCircle, trash, arrowBack } from 'ionicons/icons';
import './../../CSS/Setup.css';
import TaxrateCreateModal from '../../components/TaxrateModals/TaxrateCreateModal';
import TaxrateUpdateModal from '../../components/TaxrateModals/TaxrateUpdateModal';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
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

interface TaxrateItem {
  tax_rate_id: string;
  effective_year: string;
  rate_percent: string;
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

const Taxrate: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [taxrates, setTaxrates] = useState<TaxrateItem[]>([]);
  const [selectedRow, setSelectedRow] = useState<TaxrateItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const location = useLocation();
  const history = useHistory();
  const isElectron = useElectron();
  const [isError, setIsError] = useState(false);
  const [districtId, setDistrictId] = useState<string | null>(null);

  // Reset state when URL changes (including tab navigation)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('district_id');
    
    setDistrictId(id);
    setSelectedRow(null);
    setSearchTerm('');
    setTaxrates([]);
  }, [location.search]);

  // Fetch tax rates
  const fetchTaxrates = useCallback(async () => {
    if (!districtId) {
      setToastMessage('District ID is missing');
      setIsError(true);
      setShowToast(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('taxratetbl')
        .select('tax_rate_id, effective_year, rate_percent, created_at')
        .eq('district_id', districtId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTaxrates(data || []);
    } catch (error) {
      console.error('Error fetching tax rates:', error);
      setToastMessage('Failed to load tax rates');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  }, [districtId]);

  useEffect(() => {
    if (districtId) {
      fetchTaxrates();
    }
  }, [districtId, fetchTaxrates]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return taxrates;
    const term = searchTerm.toLowerCase();

    return taxrates.filter(item => {
      const taxRateId = item.tax_rate_id?.toString().toLowerCase() || '';
      const effectiveYear = item.effective_year?.toString().toLowerCase() || '';
      const ratePercent = item.rate_percent?.toString().toLowerCase() || '';

      return (
        taxRateId.includes(term) ||
        effectiveYear.includes(term) ||
        ratePercent.includes(term)
      );
    });
  }, [taxrates, searchTerm]);

  const handleRowClick = (rowData: TaxrateItem) => {
    setSelectedRow(rowData);
  };

  const handleDeleteClick = () => {
    if (!selectedRow) return;
    setShowDeleteAlert(true);
  };

  const handleUpdateClick = () => {
    if (!selectedRow) return;
    setShowUpdateModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('taxratetbl')
        .delete()
        .eq('tax_rate_id', selectedRow.tax_rate_id);

      if (error) throw error;

      await fetchTaxrates();
      setSelectedRow(null);
      setToastMessage('Tax rate deleted successfully');
      setIsError(false);
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting tax rate:', error);
      setToastMessage('Failed to delete tax rate');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
      setShowDeleteAlert(false);
    }
  };

  const handleBackClick = () => {
    if (isElectron) {
      window.location.hash = '/menu/home/district';
    } else {
      history.push('/menu/home/district');
    }
  };

  const iconButtons = [
    { icon: add, onClick: () => setShowCreateModal(true), disabled: !districtId, title: "Add Tax Rate" },
    { icon: arrowUpCircle, onClick: handleUpdateClick, disabled: !selectedRow, title: "Edit Tax Rate" },
    { icon: trash, onClick: handleDeleteClick, disabled: !selectedRow, title: "Delete Tax Rate" },
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
          title={districtId ? `Tax Rates - District ${districtId}` : 'Tax Rates'}
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
                  placeholder="Search by year, ID, or rate..."
                  value={searchTerm}
                  onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                  debounce={200}
                />

                <div className="icon-group">
                  {iconButtons.map((button, index) => (
                    <IonIcon
                      key={index}
                      icon={button.icon}
                      className={`icon-yellow ${button.disabled ? 'icon-disabled' : ''}`}
                      onClick={button.disabled ? undefined : button.onClick}
                      title={button.title}
                    />
                  ))}
                </div>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol size="12">
                {filteredData.length > 0 ? (
                  <DynamicTable
                    data={filteredData}
                    title="Tax Rates"
                    keyField="tax_rate_id"
                    onRowClick={handleRowClick}
                    selectedRow={selectedRow} 
                  />
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    {isLoading ? 'Loading...' : 'No tax rates found for this district'}
                  </div>
                )}
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Use custom components for Electron */}
          <ElectronLoading isOpen={isLoading} />

          {/* Taxrate Create Modal */}
          {districtId && (
            <TaxrateCreateModal
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              district_id={districtId}
              onTaxrateCreated={fetchTaxrates}
            />
          )}

          {/* Taxrate Update Modal */}
          {selectedRow && districtId && (
            <TaxrateUpdateModal
              isOpen={showUpdateModal}
              onClose={() => setShowUpdateModal(false)}
              taxrateData={{
                tax_rate_id: selectedRow.tax_rate_id,
                district_id: districtId,
                effective_year: selectedRow.effective_year,
                rate_percent: selectedRow.rate_percent
              }}
              onTaxrateUpdated={fetchTaxrates}
            />
          )}

          <ElectronAlert
            isOpen={showDeleteAlert}
            onClose={() => setShowDeleteAlert(false)}
            header={'Confirm Delete'}
            message={`Are you sure you want to delete the tax rate for year ${selectedRow?.effective_year}?`}
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
          <IonTitle>{districtId ? `Tax Rates - District ${districtId}` : 'Tax Rates'}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search by year, ID, or rate..."
                value={searchTerm}
                onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                debounce={200}
              />

              <div className="icon-group">
                {iconButtons.map((button, index) => (
                  <IonIcon
                    key={index}
                    icon={button.icon}
                    className={`icon-yellow ${button.disabled ? 'icon-disabled' : ''}`}
                    onClick={button.disabled ? undefined : button.onClick}
                    title={button.title}
                  />
                ))}
              </div>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              {filteredData.length > 0 ? (
                <DynamicTable
                  data={filteredData}
                  title="Tax Rates"
                  keyField="tax_rate_id"
                  onRowClick={handleRowClick}
                  selectedRow={selectedRow} 
                />
              ) : (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  {isLoading ? 'Loading...' : 'No tax rates found for this district'}
                </div>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Taxrate Create Modal */}
        {districtId && (
          <TaxrateCreateModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            district_id={districtId}
            onTaxrateCreated={fetchTaxrates}
          />
        )}

        {/* Taxrate Update Modal */}
        {selectedRow && districtId && (
          <TaxrateUpdateModal
            isOpen={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
            taxrateData={{
              tax_rate_id: selectedRow.tax_rate_id,
              district_id: districtId,
              effective_year: selectedRow.effective_year,
              rate_percent: selectedRow.rate_percent
            }}
            onTaxrateUpdated={fetchTaxrates}
          />
        )}

        <IonLoading isOpen={isLoading} message="Loading..." />

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={'Confirm Delete'}
          message={`Are you sure you want to delete the tax rate for year ${selectedRow?.effective_year}?`}
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

export default Taxrate;