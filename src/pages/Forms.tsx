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
import { useHistory, useLocation } from 'react-router-dom';

// Add interface for location state
interface LocationState {
  selectedFormId?: string;
}

const Forms: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [forms, setForms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const searchRef = useRef<HTMLIonSearchbarElement>(null);
  const history = useHistory();
  const location = useLocation<LocationState>(); // Add type parameter

  // Fetch forms from the view
  useEffect(() => {
    loadForms();
  }, []);

  // Handle navigation state to auto-select row
  useEffect(() => {
    if (location.state?.selectedFormId && forms.length > 0) {
      // Find the form with the matching ID
      const formToSelect = forms.find(form => form.form_id === location.state.selectedFormId);
      if (formToSelect) {
        setSelectedRow(formToSelect);
        // Optional: Scroll to the selected row
        setTimeout(() => {
          const selectedElement = document.querySelector('.data-row.selected');
          if (selectedElement) {
            selectedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [forms, location.state]);

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

// Update the handleInfoClick function in Forms.tsx
const handleInfoClick = () => {
  if (selectedRow) {
    const kindDescription = selectedRow.kind_description?.toUpperCase();
    const classId = selectedRow.class_id?.toUpperCase();
    
    if (kindDescription === 'MACHINERY') {
      history.push(`/menu/machinerytable/${selectedRow.form_id}`);
    } else if (kindDescription === 'BUILDING') {
      history.push(`/menu/buildingtable`, { 
        formId: selectedRow.form_id
      });
    } else if (kindDescription === 'LAND' && classId === 'A') {
      history.push(`/menu/agriculturalland/${selectedRow.form_id}`);
    } else if (kindDescription === 'LAND' && classId !== 'A') {
      history.push(`/menu/nonagriculturalland/${selectedRow.form_id}`);
    } else {
      console.log(`Navigation not configured for kind: ${kindDescription} with class: ${classId}`);
    }
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
                selectedRow={selectedRow}
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Forms;