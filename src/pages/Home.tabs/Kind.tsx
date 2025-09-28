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
  IonAlert,
  IonToast
} from '@ionic/react';
import { add, arrowUpCircle, buildOutline, businessOutline, readerOutline, trash } from 'ionicons/icons';
import './../../CSS/Setup2.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import { useHistory } from 'react-router-dom';
import KindUpdateModal from '../../components/KindModals/KindUpdateModal';

interface KindItem {
  kind_id: number;
  description: string;
  created_at?: string;
}

const Kind: React.FC = () => {
  const [kinds, setKinds] = useState<KindItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState<KindItem | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const history = useHistory();

  // Check if selected row has description "BUILDING"
  const isBuilding = selectedRow && selectedRow.description.toUpperCase() === 'BUILDING';
  
  // Check if selected row has description "MACHINERY"
  const isMachinery = selectedRow && selectedRow.description.toUpperCase() === 'MACHINERY';

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

  const handleUpdateClick = () => {
    if (!selectedRow) return;
    setShowUpdateModal(true);
  };

  const handleDeleteClick = () => {
    if (!selectedRow) return;
    setShowDeleteAlert(true);
  };

  const handleManageAssessmentLevels = () => {
    if (!selectedRow) return;
    history.push(`/menu/home/assesmentlevel?kind_id=${selectedRow.kind_id}`);
  };

  const handleBuildingStructuralType = () => {
    if (!selectedRow || !isBuilding) return;
    
    // Navigate to Structure tab with kind_id as a parameter
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
  };

  const handleManageEquipment = () => {
    if (!selectedRow || !isMachinery) return;
    
    // Navigate to Equipment page
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
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('kindtbl')
        .delete()
        .eq('kind_id', selectedRow.kind_id);

      if (error) throw error;

      await fetchKinds();
      setSelectedRow(null);
      setToastMessage('Kind deleted successfully');
      setIsError(false);
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting kind:', error);
      setToastMessage('Failed to delete kind');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
      setShowDeleteAlert(false);
    }
  };

  const handleKindUpdated = () => {
    fetchKinds();
    setSelectedRow(null);
    setToastMessage('Kind updated successfully');
    setIsError(false);
    setShowToast(true);
  };

  const iconButtons = [
    { icon: add, onClick: () => { setToastMessage('Add functionality to be implemented'); setShowToast(true); }, disabled: false, title: "Add Kind" },
    { icon: arrowUpCircle, onClick: handleUpdateClick, disabled: !selectedRow, title: "Edit Kind" },
    { icon: trash, onClick: handleDeleteClick, disabled: !selectedRow, title: "Delete Kind" },
    { icon: readerOutline, onClick: handleManageAssessmentLevels, disabled: !selectedRow, title: "Manage Assessment Levels" },
    { icon: businessOutline, onClick: handleBuildingStructuralType, disabled: !isBuilding, title: "Building Structural Type" },
    { icon: buildOutline, onClick: handleManageEquipment, disabled: !isMachinery, title: "Manage Equipment" }
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
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

        <KindUpdateModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          kindData={selectedRow}
          onKindUpdated={handleKindUpdated}
        />

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={'Confirm Delete'}
          message={`Are you sure you want to delete kind #${selectedRow?.kind_id} (${selectedRow?.description})?`}
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

export default Kind;