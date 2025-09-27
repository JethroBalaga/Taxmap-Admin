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
import { supabase } from '../utils/supaBaseClient'; // ✅ Supabase client import
import Home from './Home';
import People from './People';
import Forms from './Forms';
import BuildingTable from './Forms.tabs/BuildingTable';
import Map from './Map';
import Logs from './Logs';

const Menu: React.FC = () => {
  const navigation = useIonRouter();

  const path = [
    { name: 'Home', url: '/menu/home', icon: homeOutline },
    { name: 'Map', url: '/menu/map', icon: mapOutline },
    { name: 'People', url: '/menu/people', icon: peopleOutline },
    { name: 'Forms', url: '/menu/forms', icon: documentTextOutline },
    { name: 'Logs', url: '/menu/logs', icon: terminalOutline },
  ];

  /**
   * Handles logout by:
   * 1. Fetching the current user
   * 2. Logging the logout action to admin_activity_logs
   * 3. Signing the user out
   * 4. Redirecting back to the login page
   */
  const handleLogout = async () => {
    try {
      // 1. Get the currently logged-in user
      const { data, error: userError } = await supabase.auth.getUser();
      const user = data?.user;

      if (userError) {
        console.error('Error fetching current user:', userError.message);
      }

      // 2. If we have a user, log the logout action
      if (user) {
        await supabase.from('admin_activity_logs').insert([
          {
            admin_id: user.id,         // Supabase Auth UUID
            admin_email: user.email,   // Admin email
            activity_type: 'LOGOUT',   // Activity type
            timestamp: new Date(),     // Current timestamp
          },
        ]);
      }

      // 3. Sign out the user
      await supabase.auth.signOut();

      // 4. Redirect to login page
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

          {/* ✅ Logout button now logs logout activity */}
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
        <IonContent className="ion-padding">
          <IonRouterOutlet id="main">
            <Route exact path="/menu/home" component={Home} />
            <Route exact path="/menu/map" component={Map} />
            <Route exact path="/menu/people" component={People} />
            <Route exact path="/menu/forms" component={Forms} />
            <Route exact path="/menu/buildingtable" component={BuildingTable} />
            <Route exact path="/menu/logs" component={Logs} />
            <Route exact path="/menu">
              <Redirect to="/menu/home" />
            </Route>
          </IonRouterOutlet>
        </IonContent>
      </IonPage>
    </>
  );
};

export default Menu;
