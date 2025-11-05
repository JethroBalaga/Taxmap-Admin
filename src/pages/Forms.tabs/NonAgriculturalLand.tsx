import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonLoading,
  IonAlert,
  IonButtons,
  IonText
} from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import { supabase } from '../../utils/supaBaseClient';
import { useHistory, useParams } from 'react-router-dom';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import '../../CSS/Setup.css';

interface FormData {
  form_id: string;
  declarant_name: string;
  district_name: string;
  class_id: string;
  kind_description: string;
  status: string;
  [key: string]: any;
}

interface ComprehensiveValuation {
  value_info_id: string;
  rate: number;
  base_market_value: number;
  adjusted_market_value: number;
  assessment_level: string;
  assessed_value: number;
}

interface AdjustmentData {
  value_info_id: string;
  adjustment_id: string;
  adjustment_type: string;
  description: string;
  adjustment_factor: number;
  additional_factor?: number;
  adjusted_market_value: number;
}

const NonAgriculturalLand: React.FC = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [valuationData, setValuationData] = useState<ComprehensiveValuation[]>([]);
  const [adjustmentData, setAdjustmentData] = useState<AdjustmentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const history = useHistory();
  const { formId } = useParams<{ formId: string }>();

  useEffect(() => {
    if (formId) {
      loadFormData();
    }
  }, [formId]);

  useEffect(() => {
    if (formData) {
      loadValuationData();
      loadAdjustmentData();
    }
  }, [formData]);

  const loadFormData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('form_view')
        .select('*')
        .eq('form_id', formId)
        .single();

      if (error) {
        console.error('Error fetching form data:', error);
        setAlertMessage('Failed to load form data');
        setShowAlert(true);
        return;
      }

      console.log('Raw form data:', data);

      if (data) {
        const kind = data.kind_description?.toUpperCase();
        const classId = data.class_id?.toUpperCase();
        
        console.log(`Checking conditions - Kind: ${kind}, Class: ${classId}`);
        
        // Check if it's LAND but NOT Class A
        if (kind === 'LAND' && classId !== 'A') {
          setFormData(data);
        } else {
          setAlertMessage(`This form is not a Non-Agricultural Land. Found: Kind=${kind}, Class=${classId}. Required: Kind=LAND, Class≠A`);
          setShowAlert(true);
        }
      }
    } catch (error) {
      console.error('Failed to load form data:', error);
      setAlertMessage('An error occurred while loading the form');
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadValuationData = async () => {
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
        setValuationData([]);
        return;
      }

      const valueInfoIds = valueInfoData.map(item => item.value_info_id);

      // Then get comprehensive valuation data using value_info_ids
      const { data: valuationData, error: valuationError } = await supabase
        .from('comprehensive_valuation_view')
        .select('*')
        .in('value_info_id', valueInfoIds);

      if (valuationError) {
        console.error('Error fetching comprehensive valuation:', valuationError);
        return;
      }

      console.log('Comprehensive valuation data:', valuationData);
      setValuationData(valuationData || []);
    } catch (error) {
      console.error('Failed to load valuation data:', error);
    }
  };

  const loadAdjustmentData = async () => {
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
        setAdjustmentData([]);
        return;
      }

      const valueInfoIds = valueInfoData.map(item => item.value_info_id);

      // First try to get other adjustments
      const { data: otherAdjustments, error: otherError } = await supabase
        .from('other_adjustments_view')
        .select('*')
        .in('value_info_id', valueInfoIds);

      if (otherError) {
        console.error('Error fetching other adjustments:', otherError);
      }

      console.log('Other adjustments data:', otherAdjustments);

      // If other adjustments exist, use them
      if (otherAdjustments && otherAdjustments.length > 0) {
        setAdjustmentData(otherAdjustments);
        return;
      }

      // If no other adjustments, try stripping adjustments
      const { data: strippingAdjustments, error: strippingError } = await supabase
        .from('stripping_adjustments_view')
        .select('*')
        .in('value_info_id', valueInfoIds);

      if (strippingError) {
        console.error('Error fetching stripping adjustments:', strippingError);
      }

      console.log('Stripping adjustments data:', strippingAdjustments);
      
      // Use stripping adjustments if available, otherwise empty array
      setAdjustmentData(strippingAdjustments || []);
      
    } catch (error) {
      console.error('Failed to load adjustment data:', error);
      setAdjustmentData([]);
    }
  };

  const handleBack = () => {
    history.goBack();
  };

  const formatFieldName = (fieldName: string): string => {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Filter out form_id from the form data to display
  const getDisplayData = () => {
    if (!formData) return [];
    
    return Object.entries(formData)
      .filter(([key]) => key !== 'form_id')
      .map(([key, value]) => ({
        field: formatFieldName(key),
        value: value || 'N/A'
      }));
  };

  // Format valuation data for DynamicTable
  const getValuationDisplayData = () => {
    return valuationData.map(item => {
      const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
          style: 'currency',
          currency: 'PHP',
          minimumFractionDigits: 2
        }).format(value);
      };

      return {
        rate: `₱${item.rate.toLocaleString()}`,
        base_market_value: formatCurrency(item.base_market_value),
        adjusted_market_value: formatCurrency(item.adjusted_market_value),
        assessment_level: item.assessment_level,
        assessed_value: formatCurrency(item.assessed_value)
      };
    });
  };

  // Format adjustment data for DynamicTable
  const getAdjustmentDisplayData = () => {
    const adjustmentRows = adjustmentData.map(item => {
      const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
          style: 'currency',
          currency: 'PHP',
          minimumFractionDigits: 2
        }).format(value);
      };

      const formatPercentage = (value: number) => {
        return `${value}%`;
      };

      const rowData: any = {
        adjustment_type: item.adjustment_type,
        description: item.description,
        adjustment_factor: formatPercentage(item.adjustment_factor),
        adjusted_market_value: formatCurrency(item.adjusted_market_value)
      };

      // Only include additional_factor if it exists and is not null/undefined
      if (item.additional_factor !== null && item.additional_factor !== undefined) {
        rowData.additional_factor = formatPercentage(item.additional_factor);
      }

      return rowData;
    });

    return adjustmentRows;
  };

  // Handle row clicks for valuation table
  const handleValuationRowClick = (rowData: any) => {
    console.log('Valuation row clicked:', rowData);
  };

  // Handle row clicks for adjustment table
  const handleAdjustmentRowClick = (rowData: any) => {
    console.log('Adjustment row clicked:', rowData);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleBack}>
              <IonIcon icon={arrowBackOutline} />
              Back to Forms
            </IonButton>
          </IonButtons>
          <IonTitle>Non-Agricultural Land - Form {formId}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonLoading isOpen={isLoading} message="Loading non-agricultural land details..." />
        
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => {
            setShowAlert(false);
            history.goBack();
          }}
          header={'Access Denied'}
          message={alertMessage}
          buttons={['OK']}
        />

        <IonGrid>
          {/* Main Form Data Card */}
          {formData && (
            <IonRow>
              <IonCol size="12">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Form Details</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {getDisplayData().map((item, index) => (
                      <div key={index} className="data-field">
                        <strong>{item.field}:</strong> 
                        <span className="field-value">{item.value}</span>
                      </div>
                    ))}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          )}

          {/* Comprehensive Valuation Table */}
          {valuationData.length > 0 && (
            <IonRow>
              <IonCol size="12">
                <DynamicTable
                  data={getValuationDisplayData()}
                  title="Comprehensive Valuation"
                  keyField="value_info_id"
                  onRowClick={handleValuationRowClick}
                />
              </IonCol>
            </IonRow>
          )}

          {/* Adjustments Table */}
          {adjustmentData.length > 0 && (
            <IonRow>
              <IonCol size="12">
                <DynamicTable
                  data={getAdjustmentDisplayData()}
                  title="Adjustments"
                  keyField="adjustment_id"
                  onRowClick={handleAdjustmentRowClick}
                />
              </IonCol>
            </IonRow>
          )}

          {/* Show message if no valuation data found */}
          {!isLoading && valuationData.length === 0 && formData && (
            <IonRow>
              <IonCol size="12">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  No valuation data found for this non-agricultural land.
                </div>
              </IonCol>
            </IonRow>
          )}

          {/* Show message if no adjustment data found */}
          {!isLoading && adjustmentData.length === 0 && formData && (
            <IonRow>
              <IonCol size="12">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  No adjustment data found for this non-agricultural land.
                </div>
              </IonCol>
            </IonRow>
          )}

          {/* Show message if no form data found */}
          {!isLoading && !formData && (
            <IonRow>
              <IonCol size="12">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  No non-agricultural land data found for this form.
                </div>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default NonAgriculturalLand;