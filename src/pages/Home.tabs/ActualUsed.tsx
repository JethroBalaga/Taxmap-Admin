import React, { useState, useRef, useEffect } from 'react';
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
  IonToast,
  IonLoading,
  IonAlert
} from '@ionic/react';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../utils/supaBaseClient';
import ActualUsedCreateModal from '../../components/ActualUsedModals/ActualUsedCreateModal'; // Import the modal

interface ClassificationData {
  class_id: string;
  classification: string;
}

interface ActualUsedItem {
  actual_used_id: string;
  actual_used: string;
  class_id: string;
  created_at: string;
}

const ActualUsed: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const location = useLocation();
  const [classificationData, setClassificationData] = useState<ClassificationData | null>(null);
  const [actualUsedItems, setActualUsedItems] = useState<ActualUsedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ActualUsedItem | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // Modal state

  // Get classification data from URL and location state when component mounts
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const classId = queryParams.get('class_id');
    
    // Get classification data from location state
    try {
      if (location.state) {
        const stateData = location.state as any;
        
        if (stateData.classificationData) {
          setClassificationData(stateData.classificationData);
        } else if (stateData.class_id && stateData.classification) {
          setClassificationData({
            class_id: stateData.class_id,
            classification: stateData.classification
          });
        } else if (classId) {
          setClassificationData({
            class_id: classId,
            classification: `Classification ${classId}`
          });
        }
      } else if (classId) {
        setClassificationData({
          class_id: classId,
          classification: `Classification ${classId}`
        });
      }
    } catch (error) {
      console.error('Error parsing classification data:', error);
    }
  }, [location]);

  // Fetch actual used items
  const fetchActualUsedItems = async () => {
    if (!classificationData) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('actual_usedtbl') // Replace with your actual table name
        .select('*')
        .eq('class_id', classificationData.class_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setActualUsedItems(data || []);
    } catch (error) {
      console.error('Error fetching actual used items:', error);
      setToastMessage('Failed to load actual used items');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActualUsedItems();
  }, [classificationData]);

  // Filter data based on search term
  const filteredData = actualUsedItems.filter(item =>
    !searchTerm.trim() ||
    item.actual_used_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.actual_used.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (rowData: ActualUsedItem) => {
    setSelectedRow(rowData);
  };

  const handleUpdateClick = () => {
    // To be implemented
    console.log('Update clicked for:', selectedRow);
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
      // Replace with your actual delete operation
      const { error } = await supabase
        .from('actual_used_tbl')
        .delete()
        .eq('actual_used_id', selectedRow.actual_used_id);

      if (error) throw error;

      await fetchActualUsedItems();
      setSelectedRow(null);
      setToastMessage('Actual used item deleted successfully!');
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting actual used item:', error);
      setToastMessage('Failed to delete actual used item');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
      setShowDeleteAlert(false);
    }
  };

  const handleCreateClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleActualUsedCreated = () => {
    fetchActualUsedItems();
    setToastMessage('Actual Used created successfully!');
    setShowToast(true);
  };

  const iconButtons = [
    { icon: add, onClick: handleCreateClick, disabled: !classificationData, title: "Add Actual Used" },
    { icon: arrowUpCircle, onClick: handleUpdateClick, disabled: !selectedRow, title: "Edit Actual Used" },
    { icon: trash, onClick: handleDeleteClick, disabled: !selectedRow, title: "Delete Actual Used" },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            {classificationData ? `Actual Used (Class ID: ${classificationData.class_id})` : 'Actual Used Setup'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search actual used items..."
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
              {/* Replace with your actual table component */}
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                <h3>Actual Used Items Table</h3>
                <p>This would display the actual used items for the selected classification</p>
                <p>Total items: {filteredData.length}</p>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading isOpen={isLoading} message="Loading..." />

        {/* Actual Used Create Modal */}
        {classificationData && (
          <ActualUsedCreateModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onActualUsedCreated={handleActualUsedCreated}
            class_id={classificationData.class_id}
          />
        )}

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={'Confirm Delete'}
          message={`Are you sure you want to delete the actual used item <strong>${selectedRow?.actual_used}</strong>?`}
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

export default ActualUsed;