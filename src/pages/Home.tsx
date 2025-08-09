import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { albumsOutline, bookOutline, trailSignOutline } from 'ionicons/icons';
import { Route, Redirect } from 'react-router';
import Classification from './Home.tabs/Classification';
import District from './Home.tabs/District';
import Kind from './Home.tabs/Kind';

const Home: React.FC = () => {

  const tabs = [
    { name: 'Classification', tab: 'classification', url: '/menu/home/classification', icon: bookOutline },
    { name: 'District', tab: 'district', url: '/menu/home/district', icon: trailSignOutline },
    { name: 'Kind', tab: 'kind', url: '/menu/home/kind', icon: albumsOutline },
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
          <Route exact path="/menu/home/classification" component={Classification} />
          <Route exact path="/menu/home/district" component={District} />
          <Route exact path="/menu/home/kind" component={Kind} />

          <Route exact path="/menu/home">
            <Redirect to="/menu/home/classification" />
          </Route>

        </IonRouterOutlet>
      </IonTabs>
    </IonReactRouter>
  );
};

export default Home;