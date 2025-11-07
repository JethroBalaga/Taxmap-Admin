import React, { useEffect, useState } from 'react';
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
import { documentOutline, personCircleOutline, phonePortraitOutline, add } from 'ionicons/icons';
import Declarant from './People.tabs/Declarant';
import User from './People.tabs/User';
import Register from './Register';
import DeviceManagement from './People.tabs/DeviceManagement';

// Better Electron detection
const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Multiple ways to detect Electron
    const electronDetected = (
      // @ts-ignore
      window.process?.versions?.electron ||
      // @ts-ignore
      window.navigator.userAgent.includes('Electron') ||
      // @ts-ignore
      (window.require && window.process && window.process.type) ||
      window.location.protocol === 'file:'
    );
    
    setIsElectron(!!electronDetected);
  }, []);

  return isElectron;
};

// Electron-compatible tabs component for People
const ElectronPeopleTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('declarant');
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/user')) setActiveTab('user');
    else if (path.includes('/devices')) setActiveTab('devices');
    else if (path.includes('/register')) setActiveTab('register');
    else setActiveTab('declarant');
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update URL without page reload
    window.history.pushState(null, '', `#/menu/people/${tab}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'declarant': return <Declarant />;
      case 'user': return <User />;
      case 'devices': return <DeviceManagement />;
      case 'register': return <Register />;
      default: return <Declarant />;
    }
  };

  const mainTabs = [
    { name: 'Declarant', tab: 'declarant', icon: documentOutline },
    { name: 'User', tab: 'user', icon: personCircleOutline },
    { name: 'Devices', tab: 'devices', icon: phonePortraitOutline },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* REMOVED the Register button from here - it was causing the issue */}

      {/* Content area */}
      <div style={{ flex: 1, paddingBottom: '60px', overflow: 'auto' }}>
        {renderContent()}
      </div>

      {/* Custom bottom tab bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#f8f9fa',
        borderTop: '1px solid #ddd',
        display: 'flex',
        height: '60px',
        zIndex: 1000
      }}>
        {mainTabs.map((item) => (
          <button
            key={item.tab}
            onClick={() => handleTabChange(item.tab)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: activeTab === item.tab ? '#3880ff' : 'transparent',
              color: activeTab === item.tab ? 'white' : '#495057',
              border: 'none',
              fontSize: '12px',
              padding: '8px 4px',
              cursor: 'pointer'
            }}
          >
            <IonIcon icon={item.icon} style={{ fontSize: '20px', marginBottom: '4px' }} />
            <IonLabel style={{ fontSize: '10px' }}>{item.name}</IonLabel>
          </button>
        ))}
      </div>
    </div>
  );
};

const People: React.FC = () => {
  const location = useLocation();
  const isElectron = useElectron();

  useEffect(() => {
    console.log('People component mounted, current path:', location.pathname);
    console.log('Running in Electron:', isElectron);
  }, [location.pathname, isElectron]);

  const tabs = [
    { name: 'Declarant', tab: 'declarant', url: '/menu/people/declarant', icon: documentOutline },
    { name: 'User', tab: 'user', url: '/menu/people/user', icon: personCircleOutline },
    { name: 'Devices', tab: 'devices', url: '/menu/people/devices', icon: phonePortraitOutline },
  ]
  
  return (
    <IonPage>
      <IonContent fullscreen>
        {isElectron ? (
          // Electron-compatible tabs
          <ElectronPeopleTabs />
        ) : (
          // Original Ionic Tabs (works in browser)
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/menu/people/declarant" component={Declarant} />
              <Route exact path="/menu/people/user" component={User} />
              <Route exact path="/menu/people/register" component={Register} />
              <Route exact path="/menu/people/devices" component={DeviceManagement} /> 
              
              <Route exact path="/menu/people">
                <Redirect to="/menu/people/declarant" />
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
        )}
      </IonContent>
    </IonPage>
  );
};

export default People;