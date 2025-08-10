import React from 'react';
import { IonGrid, IonRow, IonCol, IonItem } from '@ionic/react';

interface DynamicTableProps {
  data: any[];
  title?: string;
  keyField?: string;
}

const DynamicTable: React.FC<DynamicTableProps> = ({ 
  data, 
  title, 
  keyField = 'id' 
}) => {
  if (!data || data.length === 0) {
    return <IonItem>No data available</IonItem>;
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="dynamic-table">
      {title && <h2>{title}</h2>}
      
      <IonGrid>
        <IonRow className="header-row">
          {columns.map((col) => (
            <IonCol key={`header-${col}`}>
              <strong>{col.replace(/_/g, ' ')}</strong>
            </IonCol>
          ))}
        </IonRow>

        {data.map((item) => (
          <IonRow key={item[keyField]}>
            {columns.map((col) => (
              <IonCol key={`${item[keyField]}-${col}`}>
                {String(item[col])}
              </IonCol>
            ))}
          </IonRow>
        ))}
      </IonGrid>
    </div>
  );
};

export default DynamicTable;