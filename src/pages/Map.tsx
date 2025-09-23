import { 
  IonContent, 
  IonPage, 
  IonCard
} from '@ionic/react';
import MapCon from '../components/MapCon';
import '../CSS/Map.css';

const Map: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen className="map-content">
        <IonCard className="map-card">
          <MapCon/>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Map;