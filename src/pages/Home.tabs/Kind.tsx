import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  IonLoading,
  IonSearchbar,
  IonToast,
  IonButtons,
  IonButton
} from '@ionic/react';
import { businessOutline, readerOutline, buildOutline, earthOutline, arrowBack } from 'ionicons/icons';
import './../../CSS/Setup2.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import { useHistory } from 'react-router-dom';

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
        Kind Setup
      </h2>
    </div>
  </div>
);

interface KindItem {
  kind_id: number;
  description: string;
  created_at?: string;
}

const Kind: React.FC = () => {
  const [kinds, setKinds] = useState<KindItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState<KindItem | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const history = useHistory();
  const isElectron = useElectron();

  // Check if selected row has description "BUILDING"
  const isBuilding = selectedRow && selectedRow.description.toUpperCase() === 'BUILDING';
  
  // Check if selected row has description "MACHINERY"
  const isMachinery = selectedRow && selectedRow.description.toUpperCase() === 'MACHINERY';

  // Check if selected row has description "LAND"
  const isLand = selectedRow && selectedRow.description.toUpperCase() === 'LAND';

  // Fetch data
  const fetchKinds = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('kindtbl')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setKinds(data || []);
    } catch (error) {
      console.error('Error fetching kinds:', error);
      setToastMessage('Failed to load kinds');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKinds();
  }, []);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return kinds;

    const term = searchTerm.toLowerCase();
    return kinds.filter(item =>
      item.kind_id.toString().includes(term) ||
      item.description.toLowerCase().includes(term)
    );
  }, [kinds, searchTerm]);

  const handleRowClick = (rowData: KindItem) => {
    setSelectedRow(rowData);
  };

  const handleManageAssessmentLevels = () => {
    if (!selectedRow) return;
    if (isElectron) {
      window.location.hash = `/menu/home/assesmentlevel?kind_id=${selectedRow.kind_id}`;
    } else {
      history.push(`/menu/home/assesmentlevel?kind_id=${selectedRow.kind_id}`);
    }
  };

  const handleBuildingStructuralType = () => {
    if (!selectedRow || !isBuilding) return;
    
    if (isElectron) {
      window.location.hash = `/menu/home/structure?kind_id=${selectedRow.kind_id}`;
    } else {
      history.push({
        pathname: '/menu/home/structure',
        search: `?kind_id=${selectedRow.kind_id}`,
        state: {
          kindData: {
            kind_id: selectedRow.kind_id,
            description: selectedRow.description
          }
        }
      });
    }
  };

  const handleManageEquipment = () => {
    if (!selectedRow || !isMachinery) return;
    
    if (isElectron) {
      window.location.hash = `/menu/home/equipment?kind_id=${selectedRow.kind_id}`;
    } else {
      history.push({
        pathname: '/menu/home/equipment',
        search: `?kind_id=${selectedRow.kind_id}`,
        state: {
          kindData: {
            kind_id: selectedRow.kind_id,
            description: selectedRow.description
          }
        }
      });
    }
  };

  const handleLandManagement = () => {
    if (!selectedRow || !isLand) return;
    
    if (isElectron) {
      window.location.hash = `/menu/home/landadjustment?kind_id=${selectedRow.kind_id}`;
    } else {
      history.push({
        pathname: '/menu/home/landadjustment',
        search: `?kind_id=${selectedRow.kind_id}`,
        state: {
          kindData: {
            kind_id: selectedRow.kind_id,
            description: selectedRow.description
          }
        }
      });
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
    { icon: readerOutline, onClick: handleManageAssessmentLevels, disabled: !selectedRow, title: "Manage Assessment Levels" },
    { icon: businessOutline, onClick: handleBuildingStructuralType, disabled: !isBuilding, title: "Building Structural Type" },
    { icon: buildOutline, onClick: handleManageEquipment, disabled: !isMachinery, title: "Manage Equipment" },
    { icon: earthOutline, onClick: handleLandManagement, disabled: !isLand, title: "Land Management" }
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
                  placeholder="Search kinds..."
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
                  title="Kinds"
                  keyField="kind_id"
                  onRowClick={handleRowClick}
                  selectedRow={selectedRow} 
                />
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Use custom components for Electron */}
          <ElectronLoading isOpen={isLoading} />

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
          <IonTitle>Kind Setup</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search kinds..."
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
                title="Kinds"
                keyField="kind_id"
                onRowClick={handleRowClick}
                selectedRow={selectedRow} 
              />
            </IonCol>
          </IonRow>
        </IonGrid>

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

export default Kind;