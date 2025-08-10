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
    // Handle filtered results (e.g., update state)
  };

  const handleItemClick = (item: ClassificationItem) => {
    console.log('Selected classification:', item);
    // Handle item selection
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Classification Setup</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid className="ion-padding">
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6">
              <Search<ClassificationItem>
                data={[]} // Empty array - parent should provide actual data
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