import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
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
  IonAlert,
  IonButtons,
  IonButton
} from '@ionic/react';
import { add, arrowUpCircle, trash, arrowBack } from 'ionicons/icons';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import ScrCreateModal from '../../components/SubclassRateModals/ScrCreateModal';
import ScrUpdateModal from '../../components/SubclassRateModals/ScrUpdateModal'; // Import the update modal
import { supabase } from '../../utils/supaBaseClient';

interface SubclassRateItem {
  subclassrate_id: string;
  subclass_id: string;
  rate: number;
  eff_year: string;
  created_at: string;
}

const SubclassRate: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const [subclassId, setSubclassId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rates, setRates] = useState<SubclassRateItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<SubclassRateItem | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false); // State for update modal

  // Get subclass_id from URL when component mounts
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('subclass_id');
    if (id) {
      setSubclassId(id);
    }
  }, [location]);

  // Fetch rates when subclassId changes
  const fetchRates = useCallback(async () => {
    if (!subclassId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('subclassratetbl')
        .select('subclassrate_id, subclass_id, rate, eff_year, created_at')
        .eq('subclass_id', subclassId)
        .order('eff_year', { ascending: false });

      if (error) throw error;

      setRates(data || []);
    } catch (error) {
      console.error('Error fetching rates:', error);
      setToastMessage('Failed to load rates');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  }, [subclassId]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return rates;

    const term = searchTerm.toLowerCase();
    return rates.filter(item => {
      const subclassrateIdStr = item.subclassrate_id?.toString().toLowerCase() || '';
      const rateStr = item.rate?.toString() || '';
      const effYearStr = item.eff_year?.toString() || '';

      return (
        subclassrateIdStr.includes(term) ||
        rateStr.includes(term) ||
        effYearStr.includes(term)
      );
    });
  }, [rates, searchTerm]);

  const handleRowClick = (rowData: SubclassRateItem) => {
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
        .from('subclassratetbl')
        .delete()
        .eq('subclassrate_id', selectedRow.subclassrate_id);

      if (error) throw error;

      await fetchRates();
      setSelectedRow(null);
      setToastMessage('Rate deleted successfully!');
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting rate:', error);
      setToastMessage('Failed to delete rate');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
      setShowDeleteAlert(false);
    }
  };

  const handleAddRate = () => {
    setIsCreateModalOpen(true);
  };

  const handleScrCreated = () => {
    fetchRates();
    setToastMessage('Subclass rate created successfully!');
    setShowToast(true);
  };

  const handleScrUpdated = () => {
    fetchRates();
    setToastMessage('Subclass rate updated successfully!');
    setShowToast(true);
    setIsUpdateModalOpen(false);
  };

  const handleBackClick = () => {
    const queryParams = new URLSearchParams(location.search);
    const classId = queryParams.get('class_id');

    if (classId) {
      history.push(`/menu/home/subclass?class_id=${classId}`);
    } else {
      history.push('/menu/home/subclass');
    }
  };

  const iconButtons = [
    { icon: add, onClick: handleAddRate, disabled: !subclassId, title: "Add Rate" },
    { icon: arrowUpCircle, onClick: handleUpdateClick, disabled: !selectedRow, title: "Edit Rate" },
    { icon: trash, onClick: handleDeleteClick, disabled: !selectedRow, title: "Delete Rate" }

  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleBackClick}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>
            {subclassId ? `Subclass Rates (Subclass ID: ${subclassId})` : 'Subclass Rates'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                placeholder="Search rates..."
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
                title="Subclass Rates"
                keyField="subclassrate_id"
                onRowClick={handleRowClick}
                selectedRow={selectedRow} 
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading isOpen={isLoading} message="Loading..." />

        {/* ScrCreateModal */}
        {subclassId && (
          <ScrCreateModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onScrCreated={handleScrCreated}
            subclass_id={subclassId}
          />
        )}

        {/* ScrUpdateModal */}
        <ScrUpdateModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          onScrUpdated={handleScrUpdated}
          subclassRateData={selectedRow}
        />

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={'Confirm Delete'}
          message={`Are you sure you want to delete this rate?`}
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

export default SubclassRate;