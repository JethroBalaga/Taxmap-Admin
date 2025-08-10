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
  IonIcon,
  IonLoading
} from '@ionic/react';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import Search from '../../components/Globalcomponents/Search';
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
  const [filteredData, setFilteredData] = useState<ClassificationItem[]>([]);

  // Fetch classifications from Supabase
  const fetchClassifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('classtbl')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClassifications(data || []);
      setFilteredData(data || []); // Initialize filtered data
    } catch (error) {
      console.error('Error fetching classifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchClassifications();
  }, []);

  // Handle creation of new classification
  const handleCreateClassification = async (code: string, name: string) => {
    try {
      const { error } = await supabase
        .from('classtbl')
        .insert([{ 
          class_id: code, 
          classification: name 
        }]);

      if (error) throw error;
      await fetchClassifications(); // Refresh the list
    } catch (error) {
      console.error('Error creating classification:', error);
    } finally {
      setShowCreateModal(false);
    }
  };

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
              <Search<ClassificationItem>
                data={classifications}
                searchKeys={['class_id', 'classification']}
                placeholder="Search classifications..."
                onSearch={(filteredResults) => setFilteredData(filteredResults)}
                onItemClick={(item) => console.log('Item clicked:', item)}
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
                  onClick={() => console.log('Arrow up clicked')}
                />
                <IonIcon 
                  icon={trash} 
                  className="icon-yellow"
                  onClick={() => console.log('Trash clicked')}
                />
              </div>
            </IonCol>
          </IonRow>

          {/* Data Table */}
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

        {/* Loading Indicator */}
        <IonLoading isOpen={isLoading} message="Loading classifications..." />

        {/* Create Modal */}
        <ClassificationCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onClassificationCreated={fetchClassifications}
        />
      </IonContent>
    </IonPage>
  );
};

export default Classification;