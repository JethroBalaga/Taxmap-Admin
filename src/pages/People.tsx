import React from 'react';
import {
    IonIcon,
    IonLabel,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonTabs,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router'; // Add this import
import { Route, Redirect } from 'react-router';
import { documentOutline } from 'ionicons/icons';
import Declarant from './People.tabs/Declarant';

const People: React.FC = () => {
    const tabs = [
        { name: 'Declarant', tab: 'declarant', url: '/menu/people/declarant', icon: documentOutline },
    ]
    
    return (
        <IonReactRouter> {/* Add this wrapper to match Home.tsx */}
            <IonTabs>
                <IonRouterOutlet>
                    <Route exact path="/menu/people/declarant" component={Declarant} />
                    
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
        </IonReactRouter>
    );
};

export default People;