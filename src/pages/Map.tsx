import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonCard,
  IonSearchbar
} from '@ionic/react';
import { useState } from 'react';
import MapCon from '../components/MapCon';
import '../CSS/Map.css';

const Map: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleSearch = (event: CustomEvent) => {
    setSearchQuery(event.detail.value || '');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Admin Map</IonTitle>
        </IonToolbar>
        
        {/* Search Bar in Header - BELOW the title */}
        <IonToolbar>
          <IonSearchbar
            value={searchQuery}
            onIonInput={handleSearch}
            onIonClear={handleClearSearch}
            placeholder="Search properties..."
            className="map-searchbar"
            animated
          />
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen className="map-content">
        <IonCard className="map-card">
          <MapCon searchQuery={searchQuery} isAdmin={true} />
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Map;