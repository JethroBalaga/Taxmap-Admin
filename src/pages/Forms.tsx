import React, { useState, useRef, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  IonIcon,
  IonLoading,
  IonButton
} from '@ionic/react';
import { informationCircleOutline } from 'ionicons/icons';
import DynamicTable from '../components/Globalcomponents/DynamicTable';
import { supabase } from '../utils/supaBaseClient';
import '../CSS/Setup.css';
import { useHistory } from 'react-router-dom';

const Forms: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [forms, setForms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const history = useHistory();

  // Fetch forms from the view
  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('form_view')
        .select('*')
        .order('form_id', { ascending: false });

      if (error) {
        console.error('Error fetching forms:', error);
        return;
      }

      setForms(data || []);
    } catch (error) {
      console.error('Failed to load forms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    if (term.trim() === '') {
      loadForms();
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('form_view')
        .select('*')
        .or(`declarant_name.ilike.%${term}%,district_name.ilike.%${term}%,classification.ilike.%${term}%,status.ilike.%${term}%`)
        .order('form_id', { ascending: false });

      if (error) {
        console.error('Search error:', error);
        return;
      }

      setForms(data || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (rowData: any) => {
    console.log('Row Clicked:', rowData);
    setSelectedRow(rowData);
  };

 const handleInfoClick = () => {
  // Only navigate if the selected row is a BUILDING kind description
  if (selectedRow && selectedRow.kind_description?.toUpperCase() === 'BUILDING') {
    history.push(`/menu/buildingtable`, { 
      formId: selectedRow.form_id,
      classId: selectedRow.class_id,
      area: selectedRow.area
    });
  } else {
    console.log('Cannot navigate. Selected row is not a BUILDING.');
    // You could add an alert or a toast here to inform the user.
  }
};
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Forms</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonLoading isOpen={isLoading} message="Loading forms..." />
        
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search by name, district, class, or status..."
                onIonInput={(e) => {
                  const term = e.detail.value || '';
                  setSearchTerm(term);
                  handleSearch(term);
                }}
                debounce={300}
              />

              <div className="icon-group">
                <IonButton
                  fill="clear"
                  onClick={handleInfoClick}
                >
                  <IonIcon
                    icon={informationCircleOutline}
                    className="icon-yellow"
                  />
                </IonButton>
              </div>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <DynamicTable
                data={forms}
                title="Forms Overview"
                keyField="form_id"
                onRowClick={handleRowClick}
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Forms;