import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
import { useLocation } from 'react-router-dom';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import StructureCreateModal from '../../components/StructureModals/StructureCreateModal';
import StructureUpdateModal from '../../components/StructureModals/StructureUpdateModal'; // Import the update modal

// Define the type for the kind data
interface KindData {
  kind_id: number;
  description: string;
}

// Define the type for the location state
interface LocationState {
  kindData?: KindData;
}

// Define the type for structure data
interface StructureItem {
  structure_type_id: number;
  structure_code: string;
  description: string;
  kind_id: number;
  eff_date: string;
  created_at?: string;
}

const Structure: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false); // State for update modal
  const [structures, setStructures] = useState<StructureItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<StructureItem | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const location = useLocation();
  
  // Get kind_id from URL parameters
  const queryParams = new URLSearchParams(location.search);
  const kindId = queryParams.get('kind_id');
  
  // Get kind data from navigation state with proper typing
  const locationState = location.state as LocationState;
  const kindData = locationState?.kindData;

  // Fetch structures when kindId changes
  const fetchStructures = useCallback(async () => {
    if (!kindId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('structure_typetbl')
        .select('*')
        .eq('kind_id', parseInt(kindId))
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStructures(data || []);
    } catch (error) {
      console.error('Error fetching structures:', error);
      setToastMessage('Failed to load structures');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  }, [kindId]);

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return structures;

    const term = searchTerm.toLowerCase();
    return structures.filter(item =>
      item.structure_code.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.eff_date.toLowerCase().includes(term)
    );
  }, [structures, searchTerm]);

  // Create data without kind_id for display
  const displayData = useMemo(() => {
    return filteredData.map(({ kind_id, ...rest }) => rest);
  }, [filteredData]);

  const handleRowClick = (rowData: any) => {
    // Find the full structure item that matches the clicked row
    const fullStructure = structures.find(
      item => item.structure_type_id === rowData.structure_type_id
    );
    setSelectedRow(fullStructure || null);
  };

  const handleAddClick = () => {
    setShowCreateModal(true);
  };

  const handleEditClick = () => {
    if (selectedRow) {
      setShowUpdateModal(true);
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
        .from('structure_typetbl')
        .delete()
        .eq('structure_type_id', selectedRow.structure_type_id);

      if (error) throw error;

      setToastMessage(`${selectedRow.description} deleted successfully!`);
      setSelectedRow(null);
      fetchStructures();
    } catch (error) {
      setToastMessage('Failed to delete structure');
      setIsError(true);
      console.error('Error deleting structure:', error);
    } finally {
      setIsLoading(false);
      setShowDeleteAlert(false);
      setShowToast(true);
    }
  };

  const handleStructureCreated = () => {
    fetchStructures();
    setShowCreateModal(false);
  };

  const handleStructureUpdated = () => {
    fetchStructures();
    setSelectedRow(null);
    setShowUpdateModal(false);
    setToastMessage('Structure updated successfully!');
    setShowToast(true);
  };

  const iconButtons = [
    { icon: add, onClick: handleAddClick, disabled: false, title: "Add Structure" },
    { icon: arrowUpCircle, onClick: handleEditClick, disabled: !selectedRow, title: "Edit Structure" },
    { icon: trash, onClick: handleDeleteClick, disabled: !selectedRow, title: "Delete Structure" }
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            {kindData ? `Structure - ${kindData.description}` : 'Structure Setup'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search structures..."
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
                data={displayData}
                title="Structures"
                keyField="structure_type_id"
                onRowClick={handleRowClick}
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Structure Create Modal */}
        {kindId && (
          <StructureCreateModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onStructureCreated={handleStructureCreated}
            kind_id={kindId}
          />
        )}

        {/* Structure Update Modal */}
        <StructureUpdateModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          onStructureUpdated={handleStructureUpdated}
          structureData={selectedRow ? {
            structure_code: selectedRow.structure_code,
            description: selectedRow.description
          } : null}
        />

        {/* Delete Confirmation */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Confirm Delete"
          message={`Are you sure you want to delete ${selectedRow?.description}?`}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary'
            },
            {
              text: 'Delete',
              handler: handleDeleteConfirm,
              cssClass: 'danger'
            }
          ]}
        />

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

export default Structure;