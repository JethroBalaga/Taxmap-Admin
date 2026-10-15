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