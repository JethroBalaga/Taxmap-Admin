import React from 'react';
import { IonGrid, IonRow, IonCol, IonItem, IonLabel } from '@ionic/react';

interface DynamicTableProps {
  data: any[]; // Array of objects from your API
  title?: string; // Optional table title
  keyField?: string; // Field to use as React key (default: 'id')
}

const DynamicTable: React.FC<DynamicTableProps> = ({ 
  data, 
  title, 
  keyField = 'id' 
}) => {
  if (!data || data.length === 0) {
    return <IonItem>No data available</IonItem>;
  }

  // Get all unique keys from the first object to determine columns
  const columns = Object.keys(data[0]);

  return (
    <div className="dynamic-table">
      {title && <h2>{title}</h2>}
      
      <IonGrid>
        {/* Header Row */}
        <IonRow className="header-row">
          {columns.map((col) => (
            <IonCol key={`header-${col}`}>
              <strong>{formatHeader(col)}</strong>
            </IonCol>
          ))}
        </IonRow>

        {/* Data Rows */}
        {data.map((item) => (
          <IonRow key={item[keyField] || item.id || Math.random()}>
            {columns.map((col) => (
              <IonCol key={`${item[keyField]}-${col}`}>
                {typeof item[col] === 'object' 
                  ? JSON.stringify(item[col]) 
                  : String(item[col])}
              </IonCol>
            ))}
          </IonRow>
        ))}
      </IonGrid>
    </div>
  );
};

// Helper to format header text (optional)
const formatHeader = (str: string) => {
  return str
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (match) => match.toUpperCase());
};

export default DynamicTable;