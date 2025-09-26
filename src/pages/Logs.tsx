import React, { useState, useRef } from 'react';
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
  IonSelectOption
} from '@ionic/react';
import '../CSS/Setup.css';

const Logs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState<string>('');
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
                style={{ display: 'inline-block', width: '500px', marginRight: '10px' }}
              />
              
              <IonSelect
                value={selectedTable}
                placeholder="Select Table"
                onIonChange={(e) => setSelectedTable(e.detail.value)}
                style={{ 
                  display: 'inline-block', 
                  width: '190px', 
                  '--background': '#000000',
                  '--color': '#ffffff'
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
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Logs;