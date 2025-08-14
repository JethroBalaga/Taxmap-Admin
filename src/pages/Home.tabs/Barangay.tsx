import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  IonSearchbar
} from '@ionic/react';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../utils/supaBaseClient';

interface BarangayItem {
  barangay_id: string;
  barangay_name: string;
  district_id: number;
  created_at?: string;
}

const Barangay: React.FC = () => {
  const location = useLocation();
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [barangays, setBarangays] = useState<BarangayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState<BarangayItem | null>(null);
  const searchRef = useRef<HTMLIonSearchbarElement>(null);

  // Get district_id from URL params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('district_id');
    if (id) {
      setDistrictId(Number(id));
    }
  }, [location]);

  // Fetch barangays when districtId changes
  useEffect(() => {
    const fetchBarangays = async () => {
      if (!districtId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('barangaytbl')
          .select('*')
          .eq('district_id', districtId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBarangays(data || []);
      } catch (error) {
        console.error('Error fetching barangays:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBarangays();
  }, [districtId]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    return searchTerm.trim() 
      ? barangays.filter(item =>
          item.barangay_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.barangay_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : barangays;
  }, [barangays, searchTerm]);

  const handleRowClick = (rowData: BarangayItem) => {
    setSelectedRow(rowData);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            {districtId ? `Barangays (District ID: ${districtId})` : 'Barangays'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search barangays..."
                onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                debounce={0}
              />

              <div className="icon-group">
                <IonIcon icon={add} className="icon-yellow" title="Add Barangay" />
                <IonIcon 
                  icon={arrowUpCircle} 
                  className={`icon-yellow ${!selectedRow ? 'icon-disabled' : ''}`} 
                  title="Edit Barangay" 
                />
                <IonIcon 
                  icon={trash} 
                  className={`icon-yellow ${!selectedRow ? 'icon-disabled' : ''}`} 
                  title="Delete Barangay" 
                />
              </div>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <DynamicTable
                data={filteredData}
                title="Barangays"
                keyField="barangay_id"
                onRowClick={handleRowClick}
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading isOpen={isLoading} message="Loading..." />
      </IonContent>
    </IonPage>
  );
};

export default Barangay;