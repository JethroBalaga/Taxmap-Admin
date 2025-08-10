import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon
} from '@ionic/react';
import { add } from 'ionicons/icons';
import Search from '../../components/Globalcomponents/Search';
import './../../CSS/Classification.css';

interface ClassificationItem {
  id: string;
  code: string;
  name: string;
}

const Classification: React.FC = () => {
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
                data={[]}
                searchKeys={['code', 'name']}
                placeholder="Search classifications..."
                onSearch={() => {}}
                onItemClick={() => {}}
              />
              <IonIcon 
                icon={add} 
                className="create-icon"
                onClick={() => console.log('Create clicked')} 
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Classification;