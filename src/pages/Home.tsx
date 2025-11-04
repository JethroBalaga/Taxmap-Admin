import React from 'react';
import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonPage,
  IonContent
} from '@ionic/react';
import { Route, Redirect, useLocation } from 'react-router';
import { albumsOutline, bookOutline, trailSignOutline } from 'ionicons/icons';
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
    <IonPage>
      <IonContent fullscreen>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/menu/home/classification" render={() => <Classification />} />
            <Route exact path="/menu/home/district" render={() => <District />} />
            <Route exact path="/menu/home/kind" render={() => <Kind />} />
            <Route exact path="/menu/home/subclass" render={() => <Subclass />} />
            <Route exact path="/menu/home/taxrate" render={() => <Taxrate />} />
            <Route exact path="/menu/home/barangay" render={() => <Barangay />} />
            <Route exact path="/menu/home/assesmentlevel" render={() => <AssessmentLevel />} />
            <Route exact path="/menu/home/subclassrate" render={() => <SubclassRate />} />
            <Route exact path="/menu/home/structure" render={() => <Structure />} />
            <Route exact path="/menu/home/buildingcode" render={() => <BuildingCode />} />
            <Route exact path="/menu/home/actualused" render={() => <ActualUsed />} />
            <Route exact path="/menu/home/buildingcom" render={() => <BuildingCom />} />
            <Route exact path="/menu/home/buildingsubcom" render={() => <BuildingSubCom />} />
            <Route exact path="/menu/home/equipment" render={() => <Equipment />} />
            <Route exact path="/menu/home/landadjustment" render={() => <LandAdjustment />} />

            <Route exact path="/menu/home">
              <Redirect to="/menu/home/classification" />
            </Route>
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
      </IonContent>
    </IonPage>
  );
};

export default Home;