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
  IonSplitPane,
  useIonRouter
} from '@ionic/react';

import {
  documentTextOutline,
  homeOutline,
  logOutOutline,
  mapOutline,
  peopleOutline,
  terminalOutline,
  analyticsOutline
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
import Dashboard from './Dashboard';

const Menu: React.FC = () => {
  const navigation = useIonRouter();

  const path = [
    { name: 'Dashboard', url: '/menu/dashboard', icon: analyticsOutline },
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
    <IonSplitPane contentId="main-content">
      <IonMenu contentId="main-content">
        <IonHeader>
          <IonToolbar style={{ '--background': 'linear-gradient(135deg, #5f27cd, #7044ff)' }}>
            <IonTitle style={{ fontWeight: '800', fontSize: '1.25rem', color: '#ffffff', letterSpacing: '0.5px' }}>
              TaxMap Admin
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <IonContent style={{ '--background': '#ffffff' }}>
          <div style={{ padding: '24px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)', marginBottom: '16px', background: '#fafbfc' }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: '700', color: '#1e293b' }}>Control Center</h2>
            <p style={{ margin: '0', fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>System Management Dashboard</p>
          </div>

          <div style={{ padding: '0 10px' }}>
            {path.map((item, index) => (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem 
                  routerLink={item.url} 
                  routerDirection="none"
                  detail={false}
                  lines="none"
                  style={{
                    '--border-radius': '12px',
                    '--margin-bottom': '6px',
                    '--padding-start': '16px',
                    '--background-hover': 'rgba(112, 68, 255, 0.06)',
                    '--color-hover': '#7044ff',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    letterSpacing: '0.2px',
                    color: '#475569'
                  } as any}
                >
                  <IonIcon icon={item.icon} slot="start" style={{ marginRight: '14px', fontSize: '1.3rem' }}></IonIcon>
                  {item.name}
                </IonItem>
              </IonMenuToggle>
            ))}
          </div>

          <div style={{ position: 'absolute', bottom: '24px', left: '16px', right: '16px' }}>
            <IonButton
              expand="block"
              color="danger"
              onClick={handleLogout}
              shape="round"
              style={{
                '--box-shadow': '0 4px 12px rgba(239, 68, 68, 0.25)',
                fontWeight: '700',
                height: '42px',
                fontSize: '0.95rem'
              }}
            >
              <IonIcon icon={logOutOutline} slot="start" style={{ fontSize: '1.2rem' }} />
              Logout
            </IonButton>
          </div>
        </IonContent>
      </IonMenu>

      <IonRouterOutlet id="main-content">
        <Route exact path="/menu/dashboard" component={Dashboard} />
        <Route path="/menu/home" component={Home} />
        <Route exact path="/menu/map" component={Map} />
        <Route path="/menu/people" component={People} />
        <Route exact path="/menu/forms" component={Forms} />
        <Route exact path="/menu/buildingtable" component={BuildingTable} />
        <Route exact path="/menu/logs" component={Logs} />
        <Route path="/menu/machinerytable/:formId" component={MachineryTable} />
        <Route path="/menu/agriculturalland/:formId" component={AgriculturalLand} />
        <Route path="/menu/nonagriculturalland/:formId" component={NonAgriculturalLand} />
        
        <Route exact path="/menu">
          <Redirect to="/menu/dashboard" />
        </Route>
      </IonRouterOutlet>
    </IonSplitPane>
  );
};

export default Menu;