import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'; // Added useMemo import
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonLoading,
  IonSearchbar // Added IonSearchbar
} from '@ionic/react';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Classification.css';
import ClassificationCreateModal from '../../components/ClassificationModals/ClassificationCreateModal';
import DynamicTable from '../../components/Globalcomponents/DynamicTable';
import { supabase } from '../../utils/supaBaseClient';

interface ClassificationItem {
  class_id: string;
  classification: string;
  created_at?: string;
}

const Classification: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [classifications, setClassifications] = useState<ClassificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef<HTMLIonSearchbarElement>(null);

  // Focus search input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      searchRef.current?.setFocus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch data
  const fetchClassifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('classtbl')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClassifications(data || []);
    } catch (error) {
      console.error('Error fetching classifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClassifications();
  }, [fetchClassifications]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return classifications;
    }
    
    return classifications.filter(item =>
      item.class_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.classification.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [classifications, searchTerm]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Classification Setup</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              {/* Replaced Search component with direct IonSearchbar */}
              <IonSearchbar
                ref={searchRef}
                placeholder="Search classifications..."
                onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                debounce={0} // Instant filtering
              />
              
              <div className="icon-group">
                <IonIcon 
                  icon={add} 
                  className="icon-yellow"
                  onClick={() => setShowCreateModal(true)} 
                />
                <IonIcon 
                  icon={arrowUpCircle} 
                  className="icon-yellow"
                  onClick={() => console.log('Export clicked')}
                />
                <IonIcon 
                  icon={trash} 
                  className="icon-yellow"
                  onClick={() => console.log('Delete clicked')}
                />
              </div>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <DynamicTable 
                data={filteredData}
                title="Classifications"
                keyField="class_id"
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading isOpen={isLoading} message="Loading classifications..." />

        <ClassificationCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Classification;