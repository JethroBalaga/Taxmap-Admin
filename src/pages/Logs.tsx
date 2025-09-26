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
  IonSelect,
  IonSelectOption,
  IonLoading
} from '@ionic/react';
import { supabase } from '../utils/supaBaseClient'; // Adjust path as needed
import DynamicTable from '../components/Globalcomponents/DynamicTable';
import '../CSS/Setup.css';

const Logs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState<string>('Classification');
  const [logsData, setLogsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLIonSearchbarElement>(null);

  const tableOptions = [
    'Classification',
    'Subclasses',
    'Subclass Rates',
    'Actual Used',
    'District',
    'District Rates',
    'Barangays',
    'Kind',
    'Assesment Levels',
    'Structural Type',
    'Building Code',
    'Building Component',
    'Building Subcomponent'
  ];

  // Fetch logs based on selected table
  const fetchLogs = async () => {
    if (!selectedTable) return;

    setIsLoading(true);
    try {
      let tableName = '';
      
      // Map table selection to actual database table names
      switch (selectedTable) {
        case 'Classification':
          tableName = 'classtbl_logs';
          break;
        // Add other cases as needed for other tables
        default:
          tableName = 'classtbl_logs'; // Default to classification logs
      }

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      setLogsData(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedTable]);

  // Filter data based on search term
  const filteredData = logsData.filter(item =>
    !searchTerm.trim() ||
    JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Logs</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                ref={searchRef}
                placeholder="Search logs..."
                onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                debounce={0}
                style={{ 
                  display: 'inline-block', 
                  width: '30%', 
                  marginRight: '15px',
                  verticalAlign: 'top'
                }}
              />
              
              <IonSelect
                value={selectedTable}
                placeholder="Select Table"
                onIonChange={(e) => setSelectedTable(e.detail.value)}
                style={{ 
                  display: 'inline-block', 
                  width: '10%', 
                  '--background': '#000000',
                  '--color': '#ffffff',
                  '--placeholder-color': '#cccccc',
                  verticalAlign: 'top'
                }}
              >
                {tableOptions.map((table) => (
                  <IonSelectOption key={table} value={table}>
                    {table}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <DynamicTable
                data={filteredData}
                title={`${selectedTable} Logs`}
                keyField="log_id"
              />
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading isOpen={isLoading} message="Loading logs..." />
      </IonContent>
    </IonPage>
  );
};

export default Logs;