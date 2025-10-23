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
import { Route, Redirect, useLocation } from 'react-router';
import { useEffect } from 'react';
import Classification from './Home.tabs/Classification';
import District from './Home.tabs/District';
import Kind from './Home.tabs/Kind';
import Subclass from './Home.tabs/Subclass';
import Taxrate from './Home.tabs/Taxrate';
import Barangay from './Home.tabs/Barangay';
import AssessmentLevel from './Home.tabs/AssesmentLevel';
import SubclassRate from './Home.tabs/SubclassRate';
import Structure from './Home.tabs/Structure';
import BuildingCode from './Home.tabs/BuildingCode';
import ActualUsed from './Home.tabs/ActualUsed';
import BuildingCom from './Home.tabs/BuildingCom';
import BuildingSubCom from './Home.tabs/BuildingSubCom';
import Equipment from './Home.tabs/Equipment';
import LandAdjustment from './Home.tabs/LandAdjustment';

const Home: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.log('Current pathname:', location.pathname);
  }, [location.pathname]);

  const tabs = [
    { name: 'Classification', tab: 'classification', url: '/menu/home/classification', icon: bookOutline },
    { name: 'District', tab: 'district', url: '/menu/home/district', icon: trailSignOutline },
    { name: 'Kind', tab: 'kind', url: '/menu/home/kind', icon: albumsOutline },
  ]

  return (
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          {/* Specific routes first */}
          <Route exact path="/menu/home/classification" component={Classification} />
          <Route exact path="/menu/home/district" component={District} />
          <Route exact path="/menu/home/kind" component={Kind} />
          <Route exact path="/menu/home/subclass" component={Subclass} />
          <Route exact path="/menu/home/taxrate" component={Taxrate} />
          <Route exact path="/menu/home/barangay" component={Barangay} />
          <Route exact path="/menu/home/assesmentlevel" component={AssessmentLevel} />
          <Route exact path="/menu/home/subclassrate" component={SubclassRate} />
          <Route exact path="/menu/home/structure" component={Structure} />
          <Route exact path="/menu/home/buildingcode" component={BuildingCode} />
          <Route exact path="/menu/home/actualused" component={ActualUsed} />
          <Route exact path="/menu/home/buildingcom" component={BuildingCom} />
          <Route exact path="/menu/home/buildingsubcom" component={BuildingSubCom} />
          <Route exact path="/menu/home/equipment" component={Equipment} />
          <Route exact path="/menu/home/landadjustment" component={LandAdjustment} />

          {/* Base path redirect */}
          <Route exact path="/menu/home">
            <Redirect to="/menu/home/classification" />
          </Route>

          {/* Remove the catch-all route since it's causing infinite redirects */}
          {/* Or use a more specific catch-all that doesn't interfere with existing routes */}
        </IonRouterOutlet>

        <IonTabBar slot="bottom">
          {tabs.map((item, index) => (
            <IonTabButton 
              key={index} 
              tab={item.tab} 
              href={item.url}
            >
              <IonIcon icon={item.icon} />
              <IonLabel>{item.name}</IonLabel>
            </IonTabButton>
          ))}
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  );
};

export default Home;