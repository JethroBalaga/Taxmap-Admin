import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
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
  IonAlert
} from '@ionic/react';
import { add, arrowUpCircle, cashOutline, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';
import SubclassCreateModal from '../../components/SubclassModals/SubclassCreateModal';
import SubclassUpdateModal from '../../components/SubclassModals/SubclassUpdateModal'; // Add this import
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';

interface SubclassItem {
  subclass_id: string;
  subclass: string;
  class_id: string;
  barangay_id: string | null;
  created_at: string;
}

const Subclass: React.FC = () => {
  const location = useLocation();
  const [classId, setClassId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // New state for update modal
  const [subclasses, setSubclasses] = useState<SubclassItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<SubclassItem | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Get class_id from URL when component mounts
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('class_id');
    if (id) {
      setClassId(id);
    }
  }, [location]);

  // Fetch subclasses when classId changes
  const fetchSubclasses = useCallback(async () => {
    if (!classId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('subclasstbl')
        .select('subclass_id, class_id, barangay_id, subclass, created_at')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubclasses(data || []);
    } catch (error) {
      console.error('Error fetching subclasses:', error);
      setToastMessage('Failed to load subclasses');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchSubclasses();
  }, [fetchSubclasses]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return subclasses;

    const term = searchTerm.toLowerCase();
    return subclasses.filter(item =>
      item.subclass_id.toLowerCase().includes(term) ||
      item.subclass.toLowerCase().includes(term)
    );
  }, [subclasses, searchTerm]);

  const handleRowClick = (rowData: SubclassItem) => {
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
        .from('subclasstbl')
        .delete()
        .eq('subclass_id', selectedRow.subclass_id);

      if (error) throw error;

      await fetchSubclasses();
      setSelectedRow(null);
      setToastMessage('Subclass deleted successfully!');
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting subclass:', error);
      setToastMessage('Failed to delete subclass');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
      setShowDeleteAlert(false);
    }
  };

  const handleSubclassCreated = () => {
    fetchSubclasses();
    setToastMessage('Subclass created successfully!');
    setShowToast(true);
  };

  const handleSubclassUpdated = () => {
    fetchSubclasses();
    setToastMessage('Subclass updated successfully!');
    setShowToast(true);
    setIsUpdateModalOpen(false);
  };

  const handleRate = () => {

  }

  const iconButtons = [
    { 
      icon: add, 
      onClick: () => setIsCreateModalOpen(true), 
      disabled: !classId, 
      title: "Add Subclass" 
    },
    { 
      icon: arrowUpCircle, 
      onClick: handleUpdateClick, 
      disabled: !selectedRow, 
      title: "Edit Subclass" 
    },
    { 
      icon: trash, 
      onClick: handleDeleteClick, 
      disabled: !selectedRow, 
      title: "Delete Subclass" 
    },
    { 
      icon: cashOutline, 
      onClick: handleRate, 
      disabled: !selectedRow, 
      title: "Add Rate" 
    },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            {classId ? `Subclasses (Class ID: ${classId})` : 'Subclasses'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                placeholder="Search subclasses..."
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
                title="Subclasses"
                keyField="subclass_id"
                onRowClick={handleRowClick}
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading isOpen={isLoading} message="Loading..." />

        {classId && (
          <>
            <SubclassCreateModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSubclassCreated={handleSubclassCreated}
              class_id={classId}
            />
            
            <SubclassUpdateModal
              isOpen={isUpdateModalOpen}
              onClose={() => setIsUpdateModalOpen(false)}
              subclassData={selectedRow}
              onSubclassUpdated={handleSubclassUpdated}
            />
          </>
        )}

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={'Confirm Delete'}
          message={`Are you sure you want to delete the subclass <strong>${selectedRow?.subclass}</strong>?`}
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

export default Subclass;