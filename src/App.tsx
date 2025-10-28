import React, { useState, useEffect, ComponentType } from 'react';
import { Route, Redirect, RouteComponentProps } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, IonContent } from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';

/* Core CSS */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';

/* Theme */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const [Login, setLogin] = useState<ComponentType<any> | null>(null);
  const [Menu, setMenu] = useState<ComponentType<any> | null>(null);
  const [AdminRegister, setAdminRegister] = useState<ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComponents = async () => {
      try {
        const loginModule = await import('./pages/Login');
        setLogin(() => loginModule.default);
        
        const menuModule = await import('./pages/Menu');
        setMenu(() => menuModule.default);
        
        const adminModule = await import('./pages/AdminRegistration');
        setAdminRegister(() => adminModule.default);
        
      } catch (error) {
        console.error('Error loading components:', error);
      } finally {
        setLoading(false);
      }
    };

    loadComponents();
  }, []);

  if (loading) {
    return (
      <IonApp>
        <IonContent className="ion-padding">
          <h1>TaxMap Admin</h1>
          <p>Loading components...</p>
        </IonContent>
      </IonApp>
    );
  }

  // Create wrapper components to handle the dynamic imports
  const LoginWrapper: React.FC<RouteComponentProps> = (props) => 
    Login ? <Login {...props} /> : <div>Loading Login...</div>;
  
  const MenuWrapper: React.FC<RouteComponentProps> = (props) => 
    Menu ? <Menu {...props} /> : <div>Loading Menu...</div>;
  
  const AdminRegisterWrapper: React.FC<RouteComponentProps> = (props) => 
    AdminRegister ? <AdminRegister {...props} /> : <div>Loading Admin Register...</div>;

  return (
    <IonApp>
      <IonReactHashRouter>
        <IonRouterOutlet>
          <Route exact path="/login" component={LoginWrapper} />
          <Route exact path="/adminregistration" component={AdminRegisterWrapper} />
          <Route path="/menu" component={MenuWrapper} />
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
        </IonRouterOutlet>
      </IonReactHashRouter>
    </IonApp>
  );
};

export default App;