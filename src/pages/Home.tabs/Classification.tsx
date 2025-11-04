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
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Error</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Something went wrong</h2>
            <p>There was an error loading the Classification page.</p>
            <IonButton onClick={() => window.location.reload()}>
              Reload Page
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return <>{children}</>;
};

const Classification: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [classifications, setClassifications] = useState<ClassificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  };

  const navigateToActualUsed = () => {
    if (selectedRow) {
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
  };

  const iconButtons = [
    { icon: add, onClick: () => setShowCreateModal(true), disabled: false, title: "Add Classification" },
    { icon: arrowUpCircle, onClick: handleUpdateClick, disabled: !selectedRow, title: "Edit Classification" },
    { icon: trash, onClick: handleDeleteClick, disabled: !selectedRow, title: "Delete Classification" },
    { icon: layersOutline, onClick: navigateToSubclass, disabled: !selectedRow, title: "Manage Subclasses" },
    { icon: briefcaseOutline, onClick: navigateToActualUsed, disabled: !selectedRow, title: "Manage Actual Used" }
  ];

  console.log('Classification: Rendering JSX, isLoading:', isLoading, 'data count:', classifications.length);

  return (
    <ErrorBoundary>
      <IonPage>
        <IonHeader>
          <IonToolbar>
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