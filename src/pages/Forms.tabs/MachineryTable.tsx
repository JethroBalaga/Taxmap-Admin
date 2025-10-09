import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonSpinner,
  IonChip,
} from '@ionic/react';
import { arrowBack, construct, location, person, cube, calendar, cash } from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { supabase } from '../../utils/supaBaseClient';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import '../../CSS/MachineryTable.css';

interface RouteParams {
  formId: string;
}

interface FormContextData {
  district_name: string;
  declarant_name: string;
}

interface MachineAssessmentData {
  value_info_id: string;
  class_id: string;
  actual_used_id: string;
  base_market_value: number;
  adjusted_market_value: number;
  assessment_level: string;
  assessed_value: number;
}

interface MachineCalculationsData {
  machinedata_id: string;
  total_cost: number;
  adjusted_market_value: number;
  years_remaining: number;
  selected_equipment: string;
  serial_no: string;
  brand_model: string;
  condition: string;
  years_used: number;
  estimated_life: number;
  // Additional machine data fields that may contain null values
  machine_description: string | null;
  machine_details: string | null;
  purchase_type: string | null;
  date_acquired: string | null;
  date_installed: string | null;
  date_operated: string | null;
  number_of_units: number | null;
  original_cost: number | null;
  freight: number | null;
  insurance: number | null;
  installation: number | null;
  others: number | null;
  depreciation: number | null;
}

const MachineryTable: React.FC = () => {
  const { formId } = useParams<RouteParams>();
  const history = useHistory();
  const [formContext, setFormContext] = useState<FormContextData | null>(null);
  const [assessmentData, setAssessmentData] = useState<MachineAssessmentData[]>([]);
  const [calculationsData, setCalculationsData] = useState<MachineCalculationsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMachineryData();
  }, [formId]);

  const loadMachineryData = async () => {
    setIsLoading(true);
    try {
      // First, get the form details
      const { data: formData, error: formError } = await supabase
        .from('form_view')
        .select('*')
        .eq('form_id', formId)
        .single();

      if (formError) throw formError;

      if (formData) {
        setFormContext({
          district_name: formData.district_name,
          declarant_name: formData.declarant_name
        });
      }

      // Get value_info_id for this form
      const { data: valueInfoData, error: valueInfoError } = await supabase
        .from('value_info')
        .select('value_info_id')
        .eq('form_id', formId);

      if (valueInfoError) throw valueInfoError;

      if (valueInfoData && valueInfoData.length > 0) {
        const valueInfoIds = valueInfoData.map(v => v.value_info_id);

        // Load assessment data using value_info_id
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('machine_assessment_view')
          .select('*')
          .in('value_info_id', valueInfoIds);

        if (assessmentError) throw assessmentError;
        setAssessmentData(assessmentData || []);

        // Load ALL machine data including columns with null values
        const { data: machineData, error: machineError } = await supabase
          .from('machinedatatbl')
          .select('*')
          .in('value_info_id', valueInfoIds);

        if (machineError) throw machineError;

        if (machineData) {
          // Get calculations for each machine
          const machineIds = machineData.map(m => m.machinedata_id);
          const { data: calculationsData, error: calcError } = await supabase
            .from('machine_calculations_view')
            .select('*')
            .in('machinedata_id', machineIds);

          if (calcError) throw calcError;

          // Combine ALL machine data with calculations
          const combinedData = machineData.map(machine => {
            const calculations = calculationsData?.find(c => c.machinedata_id === machine.machinedata_id);
            return {
              machinedata_id: machine.machinedata_id,
              selected_equipment: machine.selected_equipment,
              serial_no: machine.serial_no,
              brand_model: machine.brand_model,
              condition: machine.condition,
              years_used: machine.years_used,
              estimated_life: machine.estimated_life,
              // Include all machine data fields including potential null values
              machine_description: machine.machine_description,
              machine_details: machine.machine_details,
              purchase_type: machine.purchase_type,
              date_acquired: machine.date_acquired,
              date_installed: machine.date_installed,
              date_operated: machine.date_operated,
              number_of_units: machine.number_of_units,
              original_cost: machine.original_cost,
              freight: machine.freight,
              insurance: machine.insurance,
              installation: machine.installation,
              others: machine.others,
              depreciation: machine.depreciation,
              // Calculated values
              total_cost: calculations?.total_cost || 0,
              adjusted_market_value: calculations?.adjusted_market_value || 0,
              years_remaining: calculations?.years_remaining || 0
            };
          });

          setCalculationsData(combinedData);
        }
      }

    } catch (error) {
      console.error('Error loading machinery data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    history.goBack();
  };

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'excellent': return 'success';
      case 'good': return 'warning';
      case 'fair': return 'medium';
      case 'poor': return 'danger';
      default: return 'medium';
    }
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={handleBack}>
                <IonIcon slot="icon-only" icon={arrowBack} />
              </IonButton>
            </IonButtons>
            <IonTitle>Machinery Equipment</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <IonText>Loading machinery data...</IonText>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleBack}>
              <IonIcon slot="icon-only" icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>Machinery - Form {formId}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="machinery-admin-container">
          {/* Form Info Cards - Only District and Declarant */}
          {formContext && (
            <div className="form-info-cards">
              <IonRow class="ion-justify-content-center">
                <IonCol size="12" size-md="6" size-lg="3">
                  <IonCard className="info-card district-card">
                    <IonCardHeader>
                      <IonCardTitle>
                        <IonIcon icon={location} className="card-icon" />
                        District
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonText className="card-value">{formContext.district_name}</IonText>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
                
                <IonCol size="12" size-md="6" size-lg="3">
                  <IonCard className="info-card declarant-card">
                    <IonCardHeader>
                      <IonCardTitle>
                        <IonIcon icon={person} className="card-icon" />
                        Declarant
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonText className="card-value">{formContext.declarant_name}</IonText>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </div>
          )}

          {/* Assessment Level Table */}
          {assessmentData.length > 0 && (
            <div className="assessment-section">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Assessment Summary</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <DynamicTable
                    data={assessmentData.map(item => ({
                      ...item,
                      base_market_value_formatted: formatCurrency(item.base_market_value),
                      adjusted_market_value_formatted: formatCurrency(item.adjusted_market_value),
                      assessed_value_formatted: formatCurrency(item.assessed_value)
                    }))}
                    keyField="value_info_id"
                  />
                </IonCardContent>
              </IonCard>
            </div>
          )}

          {/* Machinery Equipment Cards with Complete Data */}
          {calculationsData.length === 0 ? (
            <div className="empty-state">
              <IonIcon icon={construct} size="large" />
              <IonText>
                <h3>No Machinery Equipment Found</h3>
                <p>No machinery has been added to Form {formId} yet.</p>
              </IonText>
            </div>
          ) : (
            <IonGrid>
              <IonRow class="ion-justify-content-center">
                {calculationsData.map((machine, index) => (
                  <IonCol size="12" size-lg="10" size-xl="8" key={machine.machinedata_id}>
                    <IonCard className="machine-card">
                      <IonCardHeader>
                        <IonCardTitle className="card-title">
                          <IonIcon icon={construct} className="card-title-icon" />
                          {machine.selected_equipment || `Equipment ${index + 1}`}
                        </IonCardTitle>
                      </IonCardHeader>

                      <IonCardContent>
                        {/* Basic Information */}
                        <div className="card-section">
                          <IonText color="medium" className="section-title">
                            <h4>Basic Information</h4>
                          </IonText>
                          <div className="info-grid">
                            <div className="info-item">
                              <label>Serial Number</label>
                              <IonText>{machine.serial_no || 'N/A'}</IonText>
                            </div>
                            <div className="info-item">
                              <label>Brand & Model</label>
                              <IonText>{machine.brand_model || 'N/A'}</IonText>
                            </div>
                            <div className="info-item">
                              <label>Condition</label>
                              <IonChip color={getConditionColor(machine.condition)}>
                                {machine.condition || 'Unknown'}
                              </IonChip>
                            </div>
                            <div className="info-item full-width">
                              <label>Machine Description</label>
                              <IonText>{machine.machine_description || 'N/A'}</IonText>
                            </div>
                            <div className="info-item full-width">
                              <label>Machine Details</label>
                              <IonText>{machine.machine_details || 'N/A'}</IonText>
                            </div>
                            <div className="info-item">
                              <label>Purchase Type</label>
                              <IonText>{machine.purchase_type || 'N/A'}</IonText>
                            </div>
                          </div>
                        </div>

                        {/* Timeline Information */}
                        <div className="card-section">
                          <IonText color="medium" className="section-title">
                            <IonIcon icon={calendar} className="section-icon" />
                            <h4>Timeline</h4>
                          </IonText>
                          <div className="info-grid">
                            <div className="info-item">
                              <label>Date Acquired</label>
                              <IonText>{formatDate(machine.date_acquired)}</IonText>
                            </div>
                            <div className="info-item">
                              <label>Date Installed</label>
                              <IonText>{formatDate(machine.date_installed)}</IonText>
                            </div>
                            <div className="info-item">
                              <label>Date Operated</label>
                              <IonText>{formatDate(machine.date_operated)}</IonText>
                            </div>
                          </div>
                        </div>

                        {/* Life Metrics */}
                        <div className="card-section">
                          <IonText color="medium" className="section-title">
                            <h4>Life Metrics</h4>
                          </IonText>
                          <div className="info-grid">
                            <div className="info-item">
                              <label>Years Used</label>
                              <IonText>{machine.years_used || 'N/A'}</IonText>
                            </div>
                            <div className="info-item">
                              <label>Estimated Life</label>
                              <IonText>{machine.estimated_life ? `${machine.estimated_life} years` : 'N/A'}</IonText>
                            </div>
                            <div className="info-item">
                              <label>Remaining Life</label>
                              <IonText className="calculated-value">
                                {machine.years_remaining ? `${machine.years_remaining} years` : 'N/A'}
                              </IonText>
                            </div>
                            <div className="info-item">
                              <label>Number of Units</label>
                              <IonText>{machine.number_of_units || 'N/A'}</IonText>
                            </div>
                          </div>
                        </div>

                        {/* Cost Information */}
                        <div className="card-section">
                          <IonText color="medium" className="section-title">
                            <IonIcon icon={cash} className="section-icon" />
                            <h4>Cost Information</h4>
                          </IonText>
                          <div className="info-grid">
                            <div className="info-item">
                              <label>Original Cost</label>
                              <IonText>{formatCurrency(machine.original_cost)}</IonText>
                            </div>
                            <div className="info-item">
                              <label>Freight</label>
                              <IonText>{formatCurrency(machine.freight)}</IonText>
                            </div>
                            <div className="info-item">
                              <label>Insurance</label>
                              <IonText>{formatCurrency(machine.insurance)}</IonText>
                            </div>
                            <div className="info-item">
                              <label>Installation</label>
                              <IonText>{formatCurrency(machine.installation)}</IonText>
                            </div>
                            <div className="info-item">
                              <label>Other Costs</label>
                              <IonText>{formatCurrency(machine.others)}</IonText>
                            </div>
                            <div className="info-item">
                              <label>Depreciation</label>
                              <IonText>{machine.depreciation ? `${machine.depreciation}%` : 'N/A'}</IonText>
                            </div>
                            <div className="info-item full-width">
                              <label>Base Market Value</label>
                              <IonText className="calculated-value total-cost">
                                {formatCurrency(machine.total_cost)}
                              </IonText>
                            </div>
                            <div className="info-item full-width">
                              <label>Adjusted Market Value</label>
                              <IonText className="calculated-value market-value">
                                {formatCurrency(machine.adjusted_market_value)}
                              </IonText>
                            </div>
                          </div>
                        </div>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MachineryTable;