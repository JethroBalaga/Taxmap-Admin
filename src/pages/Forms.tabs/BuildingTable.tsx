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

interface AssessmentSummary {
  form_id: string;
  class_id: string;
  actual_used_id: string;
  area: number;
  base_market_value: number;
  final_adjusted_market_value: number;
  assessment_percent: string;
  assessed_value: number;
  value_info_id: string;
}

const BuildingTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [generalData, setGeneralData] = useState<GeneralDescription[]>([]);
  const [assessmentSummary, setAssessmentSummary] = useState<AssessmentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const location = useLocation();
  
  const { formId } = location.state as RouteParams || {};

  useEffect(() => {
    if (formId) {
      fetchGeneralDescriptionData();
      fetchAssessmentSummary();
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

  const fetchAssessmentSummary = async () => {
    try {
      const { data, error } = await supabase
        .from('vw_form_assessment_summary')
        .select('*')
        .eq('form_id', formId);

      if (error) {
        console.error('Error fetching assessment summary:', error);
        return;
      }

      setAssessmentSummary(data || []);
    } catch (error) {
      console.error('Failed to load assessment summary:', error);
    }
  };

  // Create display data for general description that excludes ID fields
  const getGeneralDisplayData = () => {
    return generalData.map(item => {
      const { value_info_id, general_id, created_at, ...displayItem } = item;
      return displayItem;
    });
  };

  // Create display data for assessment summary that excludes form_id and value_info_id
  const getAssessmentDisplayData = () => {
    return assessmentSummary.map(item => {
      const { form_id, value_info_id, ...displayItem } = item;
      return displayItem;
    });
  };

  // Handle row clicks if needed in the future
  const handleGeneralRowClick = (rowData: any) => {
    console.log('General description row clicked:', rowData);
    // You can add functionality here later if needed
  };

  const handleAssessmentRowClick = (rowData: any) => {
    console.log('Assessment summary row clicked:', rowData);
    // You can add functionality here later if needed
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
                  data={getGeneralDisplayData()}
                  title="General Description"
                  keyField="general_id"
                  onRowClick={handleGeneralRowClick}
                />
              </IonCol>
            </IonRow>
          )}

          {/* Search Bar */}
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

          {/* Assessment Summary Table - Placed BELOW the search bar */}
          {assessmentSummary.length > 0 && (
            <IonRow>
              <IonCol size="12">
                <DynamicTable
                  data={getAssessmentDisplayData()}
                  title="Assessment Summary"
                  keyField="form_id"
                  onRowClick={handleAssessmentRowClick}
                />
              </IonCol>
            </IonRow>
          )}

          {/* Show message if no assessment data found */}
          {!isLoading && assessmentSummary.length === 0 && (
            <IonRow>
              <IonCol size="12">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  No assessment summary data found for this form.
                </div>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default BuildingTable;