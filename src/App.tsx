import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactHashRouter } from '@ionic/react-router';
import { useEffect } from 'react';

/* Your CSS imports */
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
import './theme/variables.css';

import Login from './pages/Login';
import Menu from './pages/Menu';
import AdminRegister from './pages/AdminRegistration';

setupIonicReact();

const App: React.FC = () => {
  // Clear invalid tokens on app start
  useEffect(() => {
    const clearInvalidTokens = () => {
      try {
        // Clear all Supabase auth storage
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('sb-*'); // Supabase storage pattern
        sessionStorage.removeItem('supabase.auth.token');
        
        // Also clear any other potential auth storage
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('supabase') || key.includes('auth') || key.includes('token'))) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        console.log('Cleared invalid auth tokens');
      } catch (error) {
        console.log('No auth tokens to clear or error clearing:', error);
      }
    };

    clearInvalidTokens();
  }, []);

  return (
    <IonApp>
      <IonReactHashRouter>
        <IonRouterOutlet>
          <Route exact path="/" component={Login} />
          <Route exact path="/adminregistration" component={AdminRegister}/>
          <Route path="/menu" component={Menu} />
        </IonRouterOutlet>
      </IonReactHashRouter>
    </IonApp>
  );
};

export default App;