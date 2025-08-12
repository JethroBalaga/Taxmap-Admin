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
  import {homeOutline, informationOutline, logOutOutline, rocketOutline} from 'ionicons/icons';
import { Redirect, Route } from 'react-router';
import Home from './Home';
import Taxrate from './Home.tabs/Taxrate';
  const Menu: React.FC = () => {
    const path = [
        {name:'Home', url: '/menu/home', icon: homeOutline},
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