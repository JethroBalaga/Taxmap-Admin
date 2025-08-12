import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonLabel,
  IonItem,
  IonButton
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../utils/supaBaseClient';

interface BarangayItem {
  barangay_id: number;
  barangay_name: string;
  district_id: number;
}

const Taxrate: React.FC = () => {
  const location = useLocation();
  const [districtId, setDistrictId] = useState<string | null>(null);
  const [barangays, setBarangays] = useState<BarangayItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get district_id from URL query params
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('district_id');
    setDistrictId(id);

    if (id) {
      fetchBarangays(parseInt(id));
    }
  }, [location]);

  const fetchBarangays = async (districtId: number) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('barangaytbl')
        .select('*')
        .eq('district_id', districtId);

      if (error) throw error;
      setBarangays(data || []);
    } catch (error) {
      console.error('Error fetching barangays:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tax Rates</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <div style={{ padding: '16px' }}>
          <h3>District: {districtId} Barangays:</h3>
          {barangays.length > 0 ? (
            <ul>
              {barangays.map(barangay => (
                <li key={barangay.barangay_id}>
                  {barangay.barangay_name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No barangays found for this district</p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Taxrate;