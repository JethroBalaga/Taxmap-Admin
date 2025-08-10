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
import { add, arrowUpCircle, trash } from 'ionicons/icons';
import { useState } from 'react';
import Search from '../../components/Globalcomponents/Search';
import './../../CSS/Classification.css';
import ClassificationCreateModal from '../../components/ClassificationModals/ClassificationCreateModal';

interface ClassificationItem {
  id: string;
  code: string;
  name: string;
}

const Classification: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateClassification = (code: string, classification: string) => {
    console.log('Creating:', { code, classification });
    // Add your API call or state update here
    setShowCreateModal(false);
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
                  onClick={() => setShowCreateModal(true)} 
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

        {/* Create Modal */}
        <ClassificationCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateClassification}
        />
      </IonContent>
    </IonPage>
  );
};

export default Classification;