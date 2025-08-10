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
import { add, arrowUpCircle, trash } from 'ionicons/icons'; // Added trash icon
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
              <div className="icon-group">
                <IonIcon 
                  icon={add} 
                  className="icon-yellow"
                  onClick={() => console.log('Create clicked')} 
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
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Classification;