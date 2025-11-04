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
import './../../CSS/Setup2.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import { useLocation, useHistory } from 'react-router-dom';
import AssessmentCreateModal from '../../components/AssesmentLevelModals/AssesmentCreateModal';
import AssessmentUpdateModal from '../../components/AssesmentLevelModals/AssessmentUpdateModal';

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

interface AssessmentLevelItem {
    assessment_level_id: number;
    kind_id: number;
    class_id: number;
    effective_year: string;
    range1: string | number;
    range2: string | number;
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

const AssessmentLevel: React.FC = () => {
    const [assessmentLevels, setAssessmentLevels] = useState<AssessmentLevelItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRow, setSelectedRow] = useState<AssessmentLevelItem | null>(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const searchRef = useRef<HTMLIonSearchbarElement>(null);
    const [isError, setIsError] = useState(false);
    const location = useLocation();
    const history = useHistory();
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedAssessmentLevel, setSelectedAssessmentLevel] = useState<AssessmentLevelItem | null>(null);
    const [kindId, setKindId] = useState<string | null>(null);
    const isElectron = useElectron();

    // Reset state when URL changes (including tab navigation)
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const id = queryParams.get('kind_id');
        
        setKindId(id);
        setSelectedRow(null);
        setSearchTerm('');
        setAssessmentLevels([]);
    }, [location.search]);

    // Fetch data
    const fetchAssessmentLevels = useCallback(async () => {
        if (!kindId) return;

        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('assessmentleveltbl')
                .select('*')
                .eq('kind_id', kindId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setAssessmentLevels(data || []);
        } catch (error) {
            console.error('Error fetching assessment levels:', error);
            setToastMessage('Failed to load assessment levels');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    }, [kindId]);

    useEffect(() => {
        if (kindId) {
            fetchAssessmentLevels();
        }
    }, [kindId, fetchAssessmentLevels]);

    // Filter data based on search term
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return assessmentLevels;

        const term = searchTerm.toLowerCase();
        return assessmentLevels.filter(item => {
            // Convert all values to strings for comparison
            const assessmentLevelId = item.assessment_level_id?.toString().toLowerCase() || '';
            const classId = item.class_id?.toString().toLowerCase() || '';
            const effectiveYear = item.effective_year?.toString().toLowerCase() || '';
            const range1 = item.range1?.toString().toLowerCase() || '';
            const range2 = item.range2?.toString().toLowerCase() || '';
            const ratePercent = item.rate_percent?.toString().toLowerCase() || '';

            return (
                assessmentLevelId.includes(term) ||
                classId.includes(term) ||
                effectiveYear.includes(term) ||
                range1.includes(term) ||
                range2.includes(term) ||
                ratePercent.includes(term)
            );
        });
    }, [assessmentLevels, searchTerm]);

    const handleRowClick = (rowData: AssessmentLevelItem) => {
        setSelectedRow(rowData);
    };

    const handleCreateClick = () => {
        setShowCreateModal(true);
    };

    const handleEditClick = () => {
        if (!selectedRow) return;
        setSelectedAssessmentLevel(selectedRow);
        setShowUpdateModal(true);
    };

    const handleDeleteClick = () => {
        if (!selectedRow) return;
        setShowDeleteAlert(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedRow) return;

        try {
            setIsLoading(true);
            const { error } = await supabase
                .from('assessmentleveltbl')
                .delete()
                .eq('assessment_level_id', selectedRow.assessment_level_id);

            if (error) throw error;

            await fetchAssessmentLevels();
            setSelectedRow(null);
            setToastMessage('Assessment level deleted successfully');
            setIsError(false);
            setShowToast(true);
        } catch (error) {
            console.error('Error deleting assessment level:', error);
            setToastMessage('Failed to delete assessment level');
            setIsError(true);
            setShowToast(true);
        } finally {
            setIsLoading(false);
            setShowDeleteAlert(false);
        }
    };

    const handleBackClick = () => {
        if (isElectron) {
            window.location.hash = '/menu/home/kind';
        } else {
            history.push('/menu/home/kind');
        }
    };

    // Icon buttons configuration
    const iconButtons = [
        { icon: add, onClick: handleCreateClick, disabled: !kindId, title: "Add Assessment Level" },
        { icon: arrowUpCircle, onClick: handleEditClick, disabled: !selectedRow, title: "Edit Assessment Level" },
        { icon: trash, onClick: handleDeleteClick, disabled: !selectedRow, title: "Delete Assessment Level" }
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
                    title={kindId ? `Assessment Levels - Kind ${kindId}` : 'Assessment Levels'}
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
                                    placeholder="Search by year, ID, or level..."
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
                                <DynamicTable
                                    data={filteredData}
                                    title="Assessment Levels"
                                    keyField="assessment_level_id"
                                    onRowClick={handleRowClick}
                                    selectedRow={selectedRow} 
                                />
                            </IonCol>
                        </IonRow>
                    </IonGrid>

                    {/* Use custom components for Electron */}
                    <ElectronLoading isOpen={isLoading} />

                    {/* Create Modal */}
                    {kindId && (
                        <AssessmentCreateModal
                            isOpen={showCreateModal}
                            onClose={() => setShowCreateModal(false)}
                            onAssessmentLevelCreated={fetchAssessmentLevels}
                            kind_id={kindId}
                        />
                    )}
                    {selectedRow && (
                        <AssessmentUpdateModal
                            isOpen={showUpdateModal}
                            onClose={() => setShowUpdateModal(false)}
                            assessmentLevelData={{
                                assessment_level_id: selectedRow.assessment_level_id,
                                kind_id: kindId || '',
                                class_id: selectedRow.class_id,
                                effective_year: selectedRow.effective_year,
                                range1: typeof selectedRow.range1 === 'string' ?
                                    parseFloat(selectedRow.range1) : selectedRow.range1,
                                range2: typeof selectedRow.range2 === 'string' ?
                                    parseFloat(selectedRow.range2) : selectedRow.range2,
                                rate_percent: selectedRow.rate_percent
                            }}
                            onAssessmentLevelUpdated={fetchAssessmentLevels}
                        />
                    )}

                    <ElectronAlert
                        isOpen={showDeleteAlert}
                        onClose={() => setShowDeleteAlert(false)}
                        header={'Confirm Delete'}
                        message={`Are you sure you want to delete the assessment level for year ${selectedRow?.effective_year}?`}
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
                    <IonTitle>{kindId ? `Assessment Levels - Kind ${kindId}` : 'Assessment Levels'}</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonGrid>
                    <IonRow>
                        <IonCol size="12" className="search-container">
                            <IonSearchbar
                                ref={searchRef}
                                placeholder="Search by year, ID, or level..."
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
                            <DynamicTable
                                data={filteredData}
                                title="Assessment Levels"
                                keyField="assessment_level_id"
                                onRowClick={handleRowClick}
                                selectedRow={selectedRow} 
                            />
                        </IonCol>
                    </IonRow>
                </IonGrid>

                {/* Create Modal */}
                {kindId && (
                    <AssessmentCreateModal
                        isOpen={showCreateModal}
                        onClose={() => setShowCreateModal(false)}
                        onAssessmentLevelCreated={fetchAssessmentLevels}
                        kind_id={kindId}
                    />
                )}
                {selectedRow && (
                    <AssessmentUpdateModal
                        isOpen={showUpdateModal}
                        onClose={() => setShowUpdateModal(false)}
                        assessmentLevelData={{
                            assessment_level_id: selectedRow.assessment_level_id,
                            kind_id: kindId || '',
                            class_id: selectedRow.class_id,
                            effective_year: selectedRow.effective_year,
                            range1: typeof selectedRow.range1 === 'string' ?
                                parseFloat(selectedRow.range1) : selectedRow.range1,
                            range2: typeof selectedRow.range2 === 'string' ?
                                parseFloat(selectedRow.range2) : selectedRow.range2,
                            rate_percent: selectedRow.rate_percent
                        }}
                        onAssessmentLevelUpdated={fetchAssessmentLevels}
                    />
                )}
                <IonLoading isOpen={isLoading} message="Loading..." />

                <IonAlert
                    isOpen={showDeleteAlert}
                    onDidDismiss={() => setShowDeleteAlert(false)}
                    header={'Confirm Delete'}
                    message={`Are you sure you want to delete the assessment level for year ${selectedRow?.effective_year}?`}
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

export default AssessmentLevel;