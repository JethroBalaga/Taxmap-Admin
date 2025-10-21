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
  IonAlert
} from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import { supabase } from '../../utils/supaBaseClient';
import { useHistory, useParams } from 'react-router-dom';
import '../../CSS/Setup.css';

interface FormData {
  form_id: string;
  declarant_name: string;
  district_name: string;
  classification: string;
  kind_description: string;
  status: string;
  // Add other fields from your form_view as needed
  [key: string]: any;
}

const AgriculturalLand: React.FC = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const history = useHistory();
  const { formId } = useParams<{ formId: string }>();

  useEffect(() => {
    if (formId) {
      loadFormData();
    }
  }, [formId]);

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

      if (data) {
        // Check if the form is LAND with Classification A
        if (data.kind_description?.toUpperCase() === 'LAND' && 
            data.classification?.toUpperCase() === 'A') {
          setFormData(data);
        } else {
          setAlertMessage('This form is not an Agricultural Land (LAND with Classification A)');
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

  const handleBack = () => {
    history.push('/forms', { selectedFormId: formId });
  };

  const formatFieldName = (fieldName: string): string => {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Filter out form_id from the data to display
  const getDisplayData = () => {
    if (!formData) return [];
    
    return Object.entries(formData)
      .filter(([key]) => key !== 'form_id')
      .map(([key, value]) => ({
        field: formatFieldName(key),
        value: value || 'N/A'
      }));
  };

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Loading...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonLoading isOpen={true} message="Loading Agricultural Land Data..." />
        </IonContent>
      </IonPage>
    );
  }

  if (!formData) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButton fill="clear" onClick={handleBack} slot="start">
              <IonIcon icon={arrowBackOutline} />
              Back
            </IonButton>
            <IonTitle>Agricultural Land - Not Found</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <IonCard>
                  <IonCardContent>
                    <p>Form data not found or you don't have access to view this form.</p>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    );
  }

  const displayData = getDisplayData();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButton fill="clear" onClick={handleBack} slot="start">
            <IonIcon icon={arrowBackOutline} />
            Back
          </IonButton>
          <IonTitle>Agricultural Land - Form {formId}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonLoading isOpen={isLoading} message="Loading Agricultural Land Data..." />
        
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => {
            setShowAlert(false);
            if (alertMessage.includes('not an Agricultural Land')) {
              history.goBack();
            }
          }}
          header={'Alert'}
          message={alertMessage}
          buttons={['OK']}
        />

        <IonGrid>
          <IonRow>
            <IonCol size="12" size-md="8" offset-md="2">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    Agricultural Land Details
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {displayData.map((item, index) => (
                    <div key={index} className="data-field">
                      <strong>{item.field}:</strong> 
                      <span className="field-value">{item.value}</span>
                    </div>
                  ))}
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default AgriculturalLand;