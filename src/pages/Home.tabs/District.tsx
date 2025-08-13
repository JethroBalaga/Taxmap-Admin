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
  IonRouterOutlet,
} from '@ionic/react';
import { add, arrowUpCircle, trash, cashOutline, podiumOutline } from 'ionicons/icons';
import './../../CSS/Setup2.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';
import DistrictCreateModal from '../../components/DistrictModal/DistrictCreateModal';
import DistrictUpdateModal from '../../components/DistrictModal/DistrictUpdateModal';
import { useHistory } from 'react-router-dom';
import Taxrate from './Taxrate';

interface DistrictItem {
  district_id: number;
  district_name: string;
  founded: string;
  created_at?: string;
}

const District: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [districts, setDistricts] = useState<DistrictItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState<DistrictItem | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictItem | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showCannotDeleteAlert, setShowCannotDeleteAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const history = useHistory();
  const [isError, setIsError] = useState(false);

  // Focus search input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      searchRef.current?.setFocus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);


  // Fetch data
  const fetchDistricts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('districttbl')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        ...item,
        founded: new Date(item.founded).toLocaleDateString()
      })) || [];

      setDistricts(formattedData);
    } catch (error) {
      console.error('Error fetching districts:', error);
      setToastMessage('Failed to load districts');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDistricts();
  }, [fetchDistricts]);

  // Check if district is used in other tables
  const checkIfDistrictIsUsed = async (districtId: number) => {
    try {
      const { count: count1 } = await supabase
        .from('related_table1')
        .select('*', { count: 'exact', head: true })
        .eq('district_id', districtId);

      const { count: count2 } = await supabase
        .from('related_table2')
        .select('*', { count: 'exact', head: true })
        .eq('district_id', districtId);

      return (count1 || 0) + (count2 || 0) > 0;
    } catch (error) {
      console.error('Error checking district usage:', error);
      return true;
    }
  };

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return districts;
    }

    const term = searchTerm.toLowerCase();
    return districts.filter(item =>
      item.district_id.toString().includes(term) ||
      item.district_name.toLowerCase().includes(term) ||
      item.founded.toLowerCase().includes(term)
    );
  }, [districts, searchTerm]);

  const handleRowClick = (rowData: DistrictItem) => {
    setSelectedRow(rowData);
  };

  const handleUpdateClick = () => {
    if (selectedRow) {
      setSelectedDistrict({
        ...selectedRow,
        founded: new Date(selectedRow.founded).toISOString()
      });
      setShowUpdateModal(true);
    }
  };

  const handleDeleteClick = async () => {
    if (!selectedRow) return;

    setIsLoading(true);
    try {
      const isUsed = await checkIfDistrictIsUsed(selectedRow.district_id);

      if (isUsed) {
        setShowCannotDeleteAlert(true);
      } else {
        setShowDeleteAlert(true);
      }
    } catch (error) {
      console.error('Error checking district usage:', error);
      setToastMessage('Error checking if district can be deleted');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCashClick = () => {
    if (!selectedRow) return;
    history.push(`/menu/home/taxrate?district_id=${selectedRow.district_id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('districttbl')
        .delete()
        .eq('district_id', selectedRow.district_id);

      if (error) throw error;

      await fetchDistricts();
      setSelectedRow(null);
      setToastMessage('District deleted successfully');
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting district:', error);
      setToastMessage('Failed to delete district');
      setShowToast(true);
    } finally {
      setIsLoading(false);
      setShowDeleteAlert(false);
    }
  };

  const handleBarangayClick = () => {
  if (!selectedRow) return;
  history.push({
    pathname: '/menu/home/barangay',
    search: `?district_id=${selectedRow.district_id}`,
    state: { districtName: selectedRow.district_name } // optional: pass additional data
  });
};
  
  const iconButtons = [
    { icon: add, onClick: () => setShowCreateModal(true), disabled: false, title: "Add District" },
    { icon: arrowUpCircle, onClick: handleUpdateClick, disabled: !selectedRow, title: "Edit District" },
    { icon: trash, onClick: handleDeleteClick, disabled: !selectedRow, title: "Delete District" },
    { icon: cashOutline, onClick: handleCashClick, disabled: !selectedRow, title: "Manage Tax Rates" },
    { icon: podiumOutline, onClick:  handleBarangayClick, disabled: !selectedRow, title: "Manage Barangay" },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>District Setup</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search districts..."
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
                    title={btn.title} // Tooltip on hover
                  />
                ))}
              </div>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <DynamicTable
                data={filteredData}
                title="Districts"
                keyField="district_id"
                onRowClick={handleRowClick}
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading isOpen={isLoading} message="Loading..." />

        <DistrictCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onDistrictCreated={fetchDistricts}
        />

        <DistrictUpdateModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          districtData={selectedDistrict}
          onDistrictUpdated={fetchDistricts}
        />

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={'Confirm Delete'}
          message={`Are you sure you want to delete district #${selectedRow?.district_id} (${selectedRow?.district_name})?`}
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
          message={`District #${selectedRow?.district_id} cannot be deleted because it is being used in other records.`}
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

export default District;