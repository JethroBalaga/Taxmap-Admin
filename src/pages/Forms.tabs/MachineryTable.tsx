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
  IonSearchbar,
  IonChip,
  IonLabel
} from '@ionic/react';
import { arrowBack, calculator, cash, time } from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import { supabase } from '../../utils/supaBaseClient';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import '../../CSS/MachineryTable.css';

interface RouteParams {
  formId: string;
}

interface MachineryData {
  machinedata_id: string;
  selected_equipment: string;
  serial_no: string;
  brand_model: string;
  condition: string;
  years_used: number;
  estimated_life: number;
  total_cost: number;
  adjusted_market_value: number;
  years_remaining: number;
  assessed_value: number;
}

interface FormDetails {
  district_name: string;
  declarant_name: string;
  classification: string;
  actual_use: string;
}

const MachineryTable: React.FC = () => {
  const { formId } = useParams<RouteParams>();
  const history = useHistory();
  const [machineryData, setMachineryData] = useState<MachineryData[]>([]);
  const [formDetails, setFormDetails] = useState<FormDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMachineryData();
  }, [formId]);

  const loadMachineryData = async () => {
    setIsLoading(true);
    try {
      // Load machinery calculations from the view
      const { data: machineryData, error: machineryError } = await supabase
        .from('machine_calculations_view')
        .select('*')
        .eq('machinedata_id', formId); // Adjust this based on your actual relationship

      if (machineryError) throw machineryError;

      // Load assessment data from the view
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('machine_assessment_view')
        .select('*')
        .eq('value_info_id', formId); // Adjust this based on your actual relationship

      if (assessmentError) throw assessmentError;

      // Combine the data (you might need to adjust this based on your data structure)
      const combinedData = machineryData?.map(machine => {
        const assessment = assessmentData?.find(a => a.machinedata_id === machine.machinedata_id);
        return {
          ...machine,
          assessed_value: assessment?.assessed_value || 0
        };
      }) || [];

      setMachineryData(combinedData);

      // Load form details
      const { data: formData, error: formError } = await supabase
        .from('form_view')
        .select('district_name, declarant_name, classification, actual_use')
        .eq('form_id', formId)
        .single();

      if (!formError && formData) {
        setFormDetails(formData);
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(value);
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

  const filteredMachinery = machineryData.filter(machine =>
    machine.selected_equipment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.serial_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    machine.brand_model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <IonTitle>Machinery Equipment</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="machinery-admin-container">
          {/* Form Details Cards */}
          {formDetails && (
            <IonGrid>
              <IonRow>
                <IonCol size="12" size-md="6" size-lg="3">
                  <IonCard className="info-card">
                    <IonCardHeader>
                      <IonCardTitle>District</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonText>{formDetails.district_name}</IonText>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
                <IonCol size="12" size-md="6" size-lg="3">
                  <IonCard className="info-card">
                    <IonCardHeader>
                      <IonCardTitle>Declarant</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonText>{formDetails.declarant_name}</IonText>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
                <IonCol size="12" size-md="6" size-lg="3">
                  <IonCard className="info-card">
                    <IonCardHeader>
                      <IonCardTitle>Classification</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonText>{formDetails.classification}</IonText>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
                <IonCol size="12" size-md="6" size-lg="3">
                  <IonCard className="info-card">
                    <IonCardHeader>
                      <IonCardTitle>Actual Use</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonText>{formDetails.actual_use}</IonText>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>
          )}

          {/* Search Bar */}
          <div className="search-section">
            <IonSearchbar
              placeholder="Search equipment, serial, or model..."
              value={searchTerm}
              onIonInput={(e) => setSearchTerm(e.detail.value || '')}
              debounce={300}
            />
          </div>

          {/* Summary Cards */}
          <IonGrid>
            <IonRow>
              <IonCol size="12" size-md="4">
                <IonCard className="summary-card total-value-card">
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon icon={cash} />
                      Total Value
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonText className="summary-value">
                      {formatCurrency(machineryData.reduce((sum, machine) => sum + machine.assessed_value, 0))}
                    </IonText>
                    <IonText color="medium">Total Assessed Value</IonText>
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="12" size-md="4">
                <IonCard className="summary-card equipment-card">
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon icon={calculator} />
                      Equipment Count
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonText className="summary-value">{machineryData.length}</IonText>
                    <IonText color="medium">Total Machinery Items</IonText>
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="12" size-md="4">
                <IonCard className="summary-card life-card">
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon icon={time} />
                      Avg. Remaining Life
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonText className="summary-value">
                      {machineryData.length > 0 
                        ? (machineryData.reduce((sum, machine) => sum + machine.years_remaining, 0) / machineryData.length).toFixed(1)
                        : 0
                      } years
                    </IonText>
                    <IonText color="medium">Average Remaining Life</IonText>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* Machinery Table */}
          <div className="table-section">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Machinery Equipment Details</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {filteredMachinery.length === 0 ? (
                  <div className="empty-state">
                    <IonText color="medium">
                      <p>No machinery equipment found for this form.</p>
                    </IonText>
                  </div>
                ) : (
                  <DynamicTable
                    data={filteredMachinery.map(machine => ({
                      ...machine,
                      total_cost_formatted: formatCurrency(machine.total_cost),
                      adjusted_market_value_formatted: formatCurrency(machine.adjusted_market_value),
                      assessed_value_formatted: formatCurrency(machine.assessed_value),
                      condition_chip: (
                        <IonChip color={getConditionColor(machine.condition)}>
                          <IonLabel>{machine.condition || 'Unknown'}</IonLabel>
                        </IonChip>
                      )
                    }))}
                    title="Machinery Equipment"
                    keyField="machinedata_id"
                  />
                )}
              </IonCardContent>
            </IonCard>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MachineryTable;