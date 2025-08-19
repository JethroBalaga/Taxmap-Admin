import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  IonSearchbar
} from '@ionic/react';
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import './../../CSS/Setup.css';

const Subclass: React.FC = () => {
  const location = useLocation();
  const [classId, setClassId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Get class_id from URL when component mounts
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('class_id');
    if (id) {
      setClassId(id);
      console.log('Received class_id:', id); // For debugging
    }
  }, [location]);

  // Placeholder functions for buttons
  const iconButtons = [
    { 
      icon: add, 
      onClick: () => console.log('Add subclass for class', classId), 
      disabled: !classId, 
      title: "Add Subclass" 
    },
    { 
      icon: arrowUpCircle, 
      onClick: () => console.log('Edit subclass for class', classId), 
      disabled: true, 
      title: "Edit Subclass" 
    },
    { 
      icon: trash, 
      onClick: () => console.log('Delete subclass for class', classId), 
      disabled: true, 
      title: "Delete Subclass" 
    },
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            {classId ? `Subclasses (Class ID: ${classId})` : 'Subclasses'}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            <IonCol size="12" className="search-container">
              <IonSearchbar
                placeholder="Search subclasses..."
                onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                debounce={0}
              />

              <div className="icon-group">
                {iconButtons.map((btn, index) => (
                  <IonIcon
                    key={index}
                    icon={btn.icon}
                    className={`icon-yellow ${btn.disabled ? 'icon-disabled' : ''}`}
                    onClick={btn.disabled ? undefined : btn.onClick}
                    title={btn.title}
                  />
                ))}
              </div>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              {/* Table content will go here */}
              <p>Subclasses for class ID: {classId}</p>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Subclass;