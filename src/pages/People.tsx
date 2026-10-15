import React from 'react';
import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle
} from '@ionic/react';
import { Route, Redirect } from 'react-router';
import { documentOutline, personCircleOutline, phonePortraitOutline } from 'ionicons/icons';
import Declarant from './People.tabs/Declarant';
import User from './People.tabs/User';
import Register from './Register';
import DeviceManagement from './People.tabs/DeviceManagement';

const People: React.FC = () => {
  const tabs = [
    { name: 'Declarant', tab: 'declarant', url: '/menu/people/declarant', icon: documentOutline },
    { name: 'User', tab: 'user', url: '/menu/people/user', icon: personCircleOutline },
    { name: 'Devices', tab: 'devices', url: '/menu/people/devices', icon: phonePortraitOutline },
  ]
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': 'linear-gradient(135deg, #5f27cd, #7044ff)', '--color': '#ffffff' }}>
          <IonButtons slot="start">
            <IonMenuButton style={{ '--color': '#ffffff' }} />
          </IonButtons>
          <IonTitle style={{ fontWeight: '700', letterSpacing: '0.5px' }}>People Management</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/menu/people/declarant" render={() => <Declarant />} />
            <Route exact path="/menu/people/user" render={() => <User />} />
            <Route exact path="/menu/people/register" render={() => <Register />} />
            <Route exact path="/menu/people/devices" render={() => <DeviceManagement />} /> 
            
            <Route exact path="/menu/people">
              <Redirect to="/menu/people/declarant" />
            </Route>
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            {tabs.map((item, index) => (
              <IonTabButton key={index} tab={item.tab} href={item.url}>
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

export default People;