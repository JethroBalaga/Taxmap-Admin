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

const NonAgriculturalLand: React.FC = () => {
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