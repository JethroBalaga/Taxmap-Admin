import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import Search from '../../components/Globalcomponents/Search';

interface ClassificationItem {
  id: string;
  code: string;
  name: string;
}

const Classification: React.FC = () => {
  const handleSearch = (filtered: ClassificationItem[]) => {
    console.log('Filtered results:', filtered);
  };

  const handleItemClick = (item: ClassificationItem) => {
    console.log('Selected classification:', item);
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
            {/* Just moved the column to the left - nothing else changed */}
            <IonCol size="12" sizeMd="8" sizeLg="6" className="ion-float-left">
              <Search<ClassificationItem>
                data={[]}
                searchKeys={['code', 'name']}
                placeholder="Search classifications..."
                onSearch={handleSearch}
                onItemClick={handleItemClick}
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Classification;