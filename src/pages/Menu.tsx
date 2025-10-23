import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonMenu,
  IonMenuButton,
  IonMenuToggle,
  IonPage,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
  useIonRouter
} from '@ionic/react';

import {
  documentTextOutline,
  homeOutline,
  logOutOutline,
  mapOutline,
  peopleOutline,
  terminalOutline
} from 'ionicons/icons';

import { Redirect, Route } from 'react-router';
import { supabase } from '../utils/supaBaseClient';
import Home from './Home';
import People from './People';
import Forms from './Forms';
import BuildingTable from './Forms.tabs/BuildingTable';
import Map from './Map';
import Logs from './Logs';
import Equipment from './Home.tabs/Equipment';
import MachineryTable from './Forms.tabs/MachineryTable';
import AgriculturalLand from './Forms.tabs/AgriculturalLand';
import NonAgriculturalLand from './Forms.tabs/NonAgriculturalLand';

const Menu: React.FC = () => {
  const navigation = useIonRouter();

  const path = [
    { name: 'Home', url: '/menu/home', icon: homeOutline },
    { name: 'Map', url: '/menu/map', icon: mapOutline },
    { name: 'People', url: '/menu/people', icon: peopleOutline },
    { name: 'Forms', url: '/menu/forms', icon: documentTextOutline },
    { name: 'Logs', url: '/menu/logs', icon: terminalOutline },
  ];

  const handleLogout = async () => {
    try {
      const { data, error: userError } = await supabase.auth.getUser();
      const user = data?.user;

      if (userError) {
        console.error('Error fetching current user:', userError.message);
      }

      if (user) {
        await supabase.from('admin_activity_logs').insert([
          {
            admin_id: user.id,
            admin_email: user.email,
            activity_type: 'LOGOUT',
            timestamp: new Date(),
          },
        ]);
      }

      await supabase.auth.signOut();
      navigation.push('/', 'root', 'replace');

    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <IonMenu contentId="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Menu Content</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {path.map((item, index) => (
            <IonMenuToggle key={index}>
              <IonItem routerLink={item.url} routerDirection="forward">
                <IonIcon icon={item.icon} slot="start"></IonIcon>
                {item.name}
              </IonItem>
            </IonMenuToggle>
          ))}

          <IonButton
            expand="full"
            color="danger"
            onClick={handleLogout}
          >
            <IonIcon icon={logOutOutline} slot="start" />
            Logout
          </IonButton>
        </IonContent>
      </IonMenu>

      <IonPage id="main-content">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton></IonMenuButton>
            </IonButtons>
            <IonTitle>Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        {/* Move IonRouterOutlet to be direct child of IonPage, not inside IonContent */}
        <IonRouterOutlet>
          <Route path="/menu/home" component={Home} />
          <Route exact path="/menu/map" component={Map} />
          <Route exact path="/menu/people" component={People} />
          <Route exact path="/menu/forms" component={Forms} />
          <Route exact path="/menu/buildingtable" component={BuildingTable} />
          <Route exact path="/menu/logs" component={Logs} />
          <Route path="/menu/machinerytable/:formId" component={MachineryTable} />
          <Route path="/menu/agriculturalland/:formId" component={AgriculturalLand} />
          <Route path="/menu/nonagriculturalland/:formId" component={NonAgriculturalLand} />
          
          <Route exact path="/menu">
            <Redirect to="/menu/home" />
          </Route>
        </IonRouterOutlet>
      </IonPage>
    </>
  );
};

export default Menu;