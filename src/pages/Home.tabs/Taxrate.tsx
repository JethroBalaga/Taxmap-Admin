import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonLoading,
  IonAlert,
  IonToast
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';
import TaxrateCreateModal from '../../components/TaxrateModals/TaxrateCreateModal';
import TaxrateUpdateModal from '../../components/TaxrateModals/TaxrateUpdateModal'; // Add this import
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';

interface TaxrateItem {
  tax_rate_id: string;
  effective_year: string;
  rate_percent: string;
  created_at?: string;
}

const Taxrate: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [taxrates, setTaxrates] = useState<TaxrateItem[]>([]);
  const [selectedRow, setSelectedRow] = useState<TaxrateItem | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false); // Add this state
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const location = useLocation();
  const [isError, setIsError] = useState(false);

  // Get district_id from URL
  const queryParams = new URLSearchParams(location.search);
  const districtId = queryParams.get('district_id');

  // Fetch tax rates
  const fetchTaxrates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('taxratetbl')
        .select('tax_rate_id, effective_year, rate_percent, created_at')
        .eq('district_id', districtId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTaxrates(data || []);
    } catch (error) {
      console.error('Error fetching tax rates:', error);
      setToastMessage('Failed to load tax rates');
      setIsError(true);
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (districtId) {
      fetchTaxrates();
    }
  }, [districtId]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return taxrates;
    const term = searchTerm.toLowerCase();

    return taxrates.filter(item => {
      const taxRateId = item.tax_rate_id?.toString().toLowerCase() || '';
      const effectiveYear = item.effective_year?.toString().toLowerCase() || '';
      const ratePercent = item.rate_percent?.toString().toLowerCase() || '';

      return (
        taxRateId.includes(term) ||
        effectiveYear.includes(term) ||
        ratePercent.includes(term)
      );
    });
  }, [taxrates, searchTerm]);

  const handleRowClick = (rowData: TaxrateItem) => {
    setSelectedRow(rowData);
  };

  const handleDeleteClick = () => {
    if (!selectedRow) return;
    setShowDeleteAlert(true);
  };

  const handleUpdateClick = () => {
    if (!selectedRow) return;
    setShowUpdateModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('taxratetbl')
        .delete()
        .eq('tax_rate_id', selectedRow.tax_rate_id);

      if (error) throw error;

      await fetchTaxrates();
      setSelectedRow(null);
      setToastMessage('Tax rate deleted successfully');
      setIsError(false);
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting tax rate:', error);
      setToastMessage('Failed to delete tax rate');
      setIsError(true);
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
          <IonTitle>Tax Rates - District {districtId}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search by year, ID, or rate..."
                onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                debounce={200}
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
                title="Tax Rates"
                keyField="tax_rate_id"
                onRowClick={handleRowClick}
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Taxrate Create Modal */}
        {districtId && (
          <TaxrateCreateModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            district_id={districtId}
            onTaxrateCreated={fetchTaxrates}
          />
        )}

        {/* Taxrate Update Modal */}
        {selectedRow && districtId && (
          <TaxrateUpdateModal
            isOpen={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
            taxrateData={{
              tax_rate_id: selectedRow.tax_rate_id,  // Changed from id to tax_rate_id
              district_id: districtId,
              effective_year: selectedRow.effective_year,
              rate_percent: selectedRow.rate_percent
            }}
            onTaxrateUpdated={fetchTaxrates}
          />
        )}

        <IonLoading isOpen={isLoading} message="Loading..." />

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={'Confirm Delete'}
          message={`Are you sure you want to delete the tax rate for year ${selectedRow?.effective_year}?`}
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

export default Taxrate;