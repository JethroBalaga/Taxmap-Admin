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
      IonToolbar 
  } from '@ionic/react'
  import {documentTextOutline, homeOutline, informationOutline, logOutOutline, mapOutline, peopleOutline, rocketOutline} from 'ionicons/icons';
import { Redirect, Route } from 'react-router';
import Home from './Home';
import People from './People';
import Forms from './Forms';
import BuildingTable from './Forms.tabs/BuildingTable';
import { map } from 'leaflet';
import Map from './Map';
  const Menu: React.FC = () => {
    const path = [
        {name:'Home', url: '/menu/home', icon: homeOutline},
        {name:'Map', url: '/menu/map', icon: mapOutline},
        {name:'People', url: '/menu/people', icon: peopleOutline},
        {name:'Forms', url: '/menu/forms', icon: documentTextOutline},
    ]

    return (
        <>
      <IonMenu contentId="main-content">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Menu Content</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
        {path.map((item,index) =>(
                            <IonMenuToggle key={index}>
                                <IonItem routerLink={item.url} routerDirection="forward">
                                    <IonIcon icon={item.icon} slot="start"></IonIcon>
                                    {item.name}
                                </IonItem>
                            </IonMenuToggle>
                        ))}
        <IonButton routerLink="/" routerDirection="back" expand="full">
                            <IonIcon icon={logOutOutline} slot="start"> </IonIcon>
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
                    <Route exact path="/menu">
                        <Redirect to="/menu/home"/>
                    </Route>
                </IonRouterOutlet>
        </IonContent>
      </IonPage>
    </>
    );
  };
  
  export default Menu;