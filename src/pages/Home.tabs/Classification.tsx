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
  IonToast
} from '@ionic/react';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Classification.css';
import ClassificationCreateModal from '../../components/ClassificationModals/ClassificationCreateModal';
import ClassificationUpdateModal from '../../components/ClassificationModals/ClassificationUpdateModal';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';

interface ClassificationItem {
  class_id: string;
  classification: string;
  created_at?: string;
}

const Classification: React.FC = () => {
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

  // Focus search input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      searchRef.current?.setFocus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch data
  const fetchClassifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('classtbl')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClassifications(data || []);
    } catch (error) {
      console.error('Error fetching classifications:', error);
      setToastMessage('Failed to load classifications');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClassifications();
  }, [fetchClassifications]);

  // Check if classification is used in other tables
  const checkIfClassificationIsUsed = async (classId: string) => {
    try {
      // Check in related tables (replace with your actual table names)
      const { count: count1 } = await supabase
        .from('related_table1')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', classId);

      const { count: count2 } = await supabase
        .from('related_table2')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', classId);

      return (count1 || 0) + (count2 || 0) > 0;
    } catch (error) {
      console.error('Error checking classification usage:', error);
      return true;
    }
  };

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return classifications;
    }
    
    return classifications.filter(item =>
      item.class_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.classification.toLowerCase().includes(searchTerm.toLowerCase())
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
      setToastMessage('Classification deleted successfully');
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting classification:', error);
      setToastMessage('Failed to delete classification');
      setShowToast(true);
    } finally {
      setIsLoading(false);
      setShowDeleteAlert(false);
    }
  };

  return (
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
                onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                debounce={0}
              />
              
              <div className="icon-group">
                <IonIcon 
                  icon={add} 
                  className="icon-yellow"
                  onClick={() => setShowCreateModal(true)} 
                />
                <IonIcon 
                  icon={arrowUpCircle} 
                  className={`icon-yellow ${!selectedRow ? 'icon-disabled' : ''}`}
                  onClick={handleUpdateClick}
                />
                <IonIcon 
                  icon={trash} 
                  className={`icon-yellow ${!selectedRow ? 'icon-disabled' : ''}`}
                  onClick={handleDeleteClick}
                />
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
          message={`The classification <strong>${selectedRow?.classification}</strong> cannot be deleted because it is being used in other records.`}
          buttons={['OK']}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
        />
      </IonContent>
    </IonPage>
  );
};

export default Classification;