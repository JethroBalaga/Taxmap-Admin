import React, { useState, useRef, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  IonLoading
} from '@ionic/react';
import '../../CSS/Setup.css';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../utils/supaBaseClient';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';

interface RouteParams {
  formId: string;
}

interface GeneralDescription {
  building_code: string;
  storey: number;
  floor_order: number;
  bld_age: string;
  bldg_permit: string;
  construction_percent: string;
  date_constructed: string;
  date_occupied: string;
  date_completed: string;
  depreciation_rate: string;
  value_info_id: string;
  general_id: string;
  created_at?: string;
}

const BuildingTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [generalData, setGeneralData] = useState<GeneralDescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const location = useLocation();
  
  const { formId } = location.state as RouteParams || {};

  useEffect(() => {
    if (formId) {
      fetchGeneralDescriptionData();
    }
  }, [formId]);

  const fetchGeneralDescriptionData = async () => {
    setIsLoading(true);
    try {
      // First get value_info_id from form_id
      const { data: valueInfoData, error: valueError } = await supabase
        .from('value_info')
        .select('value_info_id')
        .eq('form_id', formId);

      if (valueError) {
        console.error('Error fetching value_info:', valueError);
        return;
      }

      if (!valueInfoData || valueInfoData.length === 0) {
        console.log('No value_info found for form_id:', formId);
        setGeneralData([]);
        return;
      }

      const valueInfoIds = valueInfoData.map(item => item.value_info_id);

      // Then get general description data using value_info_ids
      const { data: generalData, error: generalError } = await supabase
        .from('general_descriptiontbl')
        .select('*')
        .in('value_info_id', valueInfoIds);

      if (generalError) {
        console.error('Error fetching general_descriptiontbl:', generalError);
        return;
      }

      setGeneralData(generalData || []);
    } catch (error) {
      console.error('Failed to load general description data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create display data that excludes ID fields but keeps them in the original state
  const getDisplayData = () => {
    return generalData.map(item => {
      // Create a copy of the item without the ID fields
      const { value_info_id, general_id, created_at, ...displayItem } = item;
      return displayItem;
    });
  };

  // Create a custom columns list that excludes the ID fields from display
  const getDisplayColumns = () => {
    if (generalData.length === 0) return [];
    
    const firstItem = generalData[0];
    const allColumns = Object.keys(firstItem);
    
    // Filter out the columns we don't want to display
    return allColumns.filter(column => 
      column !== 'created_at' && 
      column !== 'value_info_id' && 
      column !== 'general_id'
    );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Building Details</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <IonLoading isOpen={isLoading} message="Loading building details..." />
        
        <IonGrid>
          {/* General Description Table - Placed ABOVE the search */}
          {generalData.length > 0 && (
            <IonRow>
              <IonCol size="12">
                <DynamicTable
                  data={getDisplayData()}
                  title="General Description"
                  keyField="general_id" // This can stay as it's used internally by DynamicTable
                  onRowClick={undefined} // Make table non-clickable
                />
              </IonCol>
            </IonRow>
          )}

          {/* Search Bar - Placed BELOW the table */}
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search buildings..."
                onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                debounce={300}
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default BuildingTable;