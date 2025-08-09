import { 
  IonButton,
    IonButtons,
      IonContent, 
      IonHeader, 
      IonIcon, 
      IonLabel, 
      IonMenuButton, 
      IonPage, 
      IonRouterOutlet, 
      IonTabBar, 
      IonTabButton, 
      IonTabs, 
      IonTitle, 
      IonToolbar 
  } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { albumsOutline, bookOutline,trailSignOutline} from 'ionicons/icons';
import { Route, Redirect } from 'react-router';
  
  const Home: React.FC = () => {

    const tabs = [
      {name:'Classification', tab:'classification',url: '/menu/home/classification', icon: bookOutline},
      {name:'District', tab:'district', url: '/district/home/district', icon: trailSignOutline},
      {name:'Kind',tab:'kind', url: '/menu/home/kind', icon: albumsOutline},
    ]
    
    return (
      <IonReactRouter>
        <IonTabs>
          <IonTabBar slot="bottom">

            {tabs.map((item, index) => (
              <IonTabButton key={index} tab={item.tab} href={item.url}>
                <IonIcon icon={item.icon} />
                <IonLabel>{item.name}</IonLabel>
              </IonTabButton>
            ))}
            
          </IonTabBar>
        <IonRouterOutlet>

          <Route exact path="/menu/home">
          </Route>

        </IonRouterOutlet>
        </IonTabs>
      </IonReactRouter>
    );
  };
  
  export default Home;