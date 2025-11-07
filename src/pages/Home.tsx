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
import { albumsOutline, bookOutline, trailSignOutline } from 'ionicons/icons';
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

// Electron-compatible tabs component for Home
const ElectronHomeTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('classification');
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/district')) setActiveTab('district');
    else if (path.includes('/kind')) setActiveTab('kind');
    else if (path.includes('/subclass')) setActiveTab('subclass');
    else if (path.includes('/taxrate')) setActiveTab('taxrate');
    else if (path.includes('/barangay')) setActiveTab('barangay');
    else if (path.includes('/assesmentlevel')) setActiveTab('assesmentlevel');
    else if (path.includes('/subclassrate')) setActiveTab('subclassrate');
    else if (path.includes('/structure')) setActiveTab('structure');
    else if (path.includes('/buildingcode')) setActiveTab('buildingcode');
    else if (path.includes('/actualused')) setActiveTab('actualused');
    else if (path.includes('/buildingcom')) setActiveTab('buildingcom');
    else if (path.includes('/buildingsubcom')) setActiveTab('buildingsubcom');
    else if (path.includes('/equipment')) setActiveTab('equipment');
    else if (path.includes('/landadjustment')) setActiveTab('landadjustment');
    else setActiveTab('classification');
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update URL without page reload
    window.history.pushState(null, '', `#/menu/home/${tab}`);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'classification': return <Classification />;
      case 'district': return <District />;
      case 'kind': return <Kind />;
      case 'subclass': return <Subclass />;
      case 'taxrate': return <Taxrate />;
      case 'barangay': return <Barangay />;
      case 'assesmentlevel': return <AssessmentLevel />;
      case 'subclassrate': return <SubclassRate />;
      case 'structure': return <Structure />;
      case 'buildingcode': return <BuildingCode />;
      case 'actualused': return <ActualUsed />;
      case 'buildingcom': return <BuildingCom />;
      case 'buildingsubcom': return <BuildingSubCom />;
      case 'equipment': return <Equipment />;
      case 'landadjustment': return <LandAdjustment />;
      default: return <Classification />;
    }
  };

  const mainTabs = [
    { name: 'Classification', tab: 'classification', icon: bookOutline },
    { name: 'District', tab: 'district', icon: trailSignOutline },
    { name: 'Kind', tab: 'kind', icon: albumsOutline },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Content area - takes full space */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {renderContent()}
      </div>

      {/* Custom bottom tab bar - ONLY Classification, District, Kind */}
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

const Home: React.FC = () => {
  const location = useLocation();
  const isElectron = useElectron();

  useEffect(() => {
    console.log('Home component mounted, current path:', location.pathname);
    console.log('Running in Electron:', isElectron);
  }, [location.pathname, isElectron]);

  const tabs = [
    { name: 'Classification', tab: 'classification', url: '/menu/home/classification', icon: bookOutline },
    { name: 'District', tab: 'district', url: '/menu/home/district', icon: trailSignOutline },
    { name: 'Kind', tab: 'kind', url: '/menu/home/kind', icon: albumsOutline },
  ]

  return (
    <IonPage>
      <IonContent fullscreen>
        {isElectron ? (
          // Electron-compatible tabs
          <ElectronHomeTabs />
        ) : (
          // Original Ionic Tabs (works in browser)
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/menu/home/classification" component={Classification} />
              <Route exact path="/menu/home/district" component={District} />
              <Route exact path="/menu/home/kind" component={Kind} />
              <Route exact path="/menu/home/subclass" component={Subclass} />
              <Route exact path="/menu/home/taxrate" component={Taxrate} />
              <Route exact path="/menu/home/barangay" component={Barangay} />
              <Route exact path="/menu/home/assesmentlevel" component={AssessmentLevel} />
              <Route exact path="/menu/home/subclassrate" component={SubclassRate} />
              <Route exact path="/menu/home/structure" component={Structure} />
              <Route exact path="/menu/home/buildingcode" component={BuildingCode} />
              <Route exact path="/menu/home/actualused" component={ActualUsed} />
              <Route exact path="/menu/home/buildingcom" component={BuildingCom} />
              <Route exact path="/menu/home/buildingsubcom" component={BuildingSubCom} />
              <Route exact path="/menu/home/equipment" component={Equipment} />
              <Route exact path="/menu/home/landadjustment" component={LandAdjustment} />

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
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;