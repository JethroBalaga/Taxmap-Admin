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
import { add, arrowUpCircle, readerOutline, trash } from 'ionicons/icons';
import './../../CSS/Setup2.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import KindCreateModal from '../../components/KindModals/KindCreateModal';
import KindUpdateModal from '../../components/KindModals/KindUpdateModal';

interface KindItem {
  kind_id: number;
  description: string;
  created_at?: string;
}

const Kind: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [kinds, setKinds] = useState<KindItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState<KindItem | null>(null);
  const [selectedKind, setSelectedKind] = useState<KindItem | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showCannotDeleteAlert, setShowCannotDeleteAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const [isError, setIsError] = useState(false);

  // Focus search input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      searchRef.current?.setFocus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch data
  const fetchKinds = useCallback(async () => {
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
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKinds();
  }, [fetchKinds]);

  // Check if kind is used in other tables
  const checkIfKindIsUsed = async (kindId: number) => {
    try {
      const { count: count1 } = await supabase
        .from('related_table1')
        .select('*', { count: 'exact', head: true })
        .eq('kind_id', kindId);

      const { count: count2 } = await supabase
        .from('related_table2')
        .select('*', { count: 'exact', head: true })
        .eq('kind_id', kindId);

      return (count1 || 0) + (count2 || 0) > 0;
    } catch (error) {
      console.error('Error checking kind usage:', error);
      return true;
    }
  };

  // Filter data based on search term with null checks
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return kinds;
    }

    const term = searchTerm.toLowerCase();
    return kinds.filter(item =>
      item.kind_id.toString().includes(term) ||  // Convert number to string for search
      item.description.toLowerCase().includes(term)
    );
  }, [kinds, searchTerm]);



  const handleRowClick = (rowData: KindItem) => {
    setSelectedRow(rowData);
  };

  const handleUpdateClick = () => {
    if (selectedRow) {
      setSelectedKind(selectedRow);
      setShowUpdateModal(true);
    }
  };

  const handleDeleteClick = async () => {
    if (!selectedRow) return;

    setIsLoading(true);
    try {
      const isUsed = await checkIfKindIsUsed(selectedRow.kind_id);

      if (isUsed) {
        setShowCannotDeleteAlert(true);
      } else {
        setShowDeleteAlert(true);
      }
    } catch (error) {
      console.error('Error checking kind usage:', error);
      setToastMessage('Error checking if kind can be deleted');
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
        .from('kindtbl')
        .delete()
        .eq('id', selectedRow.kind_id);

      if (error) throw error;

      await fetchKinds();
      setSelectedRow(null);
      setToastMessage('Kind deleted successfully');
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting kind:', error);
      setToastMessage('Failed to delete kind');
      setShowToast(true);
    } finally {
      setIsLoading(false);
      setShowDeleteAlert(false);
    }
  };

    const addAssesment = () => {

  };

  const iconButtons = [
    { icon: add, onClick: () => setShowCreateModal(true), disabled: false, title: "Add Kind" },
    { icon: arrowUpCircle, onClick: handleUpdateClick, disabled: !selectedRow, title: "Edit Kind" },
    { icon: trash, onClick: handleDeleteClick, disabled: !selectedRow, title: "Delete Kind" },
    { icon: readerOutline, onClick: addAssesment, disabled: !selectedRow, title: "Add Assesment" }
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
                title="Kinds"
                keyField="kind_id"
                onRowClick={handleRowClick}
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading isOpen={isLoading} message="Loading..." />

        <KindCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onKindCreated={fetchKinds}
        />

        <KindUpdateModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          kindData={selectedKind}
          onKindUpdated={fetchKinds}
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

        <IonAlert
          isOpen={showCannotDeleteAlert}
          onDidDismiss={() => setShowCannotDeleteAlert(false)}
          header={'Cannot Delete'}
          message={`Kind #${selectedRow?.kind_id} cannot be deleted because it is being used in other records.`}
          buttons={['OK']}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={isError ? 'green' : 'success'}
        />
      </IonContent>
    </IonPage>
  );
};

export default Kind;