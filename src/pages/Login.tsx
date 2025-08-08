import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
  IonInput,
  IonInputPasswordToggle,
  IonAlert,
  IonToast,
  IonCard,
  IonCardContent,
  IonAvatar,
} from '@ionic/react';
import { useState } from 'react';
import { supabase } from '../utils/supaBaseClient';
import Logo from '../Images/Flag_of_Manolo_Fortich,_Bukidnon.png';
import backgroundImg from '../Images/Background.jpg';

const AlertBox: React.FC<{ message: string; isOpen: boolean; onClose: () => void }> = ({ message, isOpen, onClose }) => {
  return (
    <IonAlert
      isOpen={isOpen}
      onDidDismiss={onClose}
      header="Notification"
      message={message}
      buttons={['OK']}
    />
  );
};

const Login: React.FC = () => {
  const navigation = useIonRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const h1Style = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'yellow',
  };

  const doLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setAlertMessage(error.message);
      setShowAlert(true);
      return;
    }

    setShowToast(true);
    setTimeout(() => {
      navigation.push('/it35-lab/app', 'forward', 'replace');
    }, 300);
  };

  return (
    <IonPage>
      <IonContent className='ion-padding' fullscreen>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${backgroundImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(2px) brightness(0.7)',
          zIndex: -1,
        }} />
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          padding: '1rem',
        }}>
          <IonCard style={{
            width: '100%',
            maxWidth: '500px',
            backdropFilter: 'blur(8px)',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          }}>
            <IonCardContent>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
              }}>
                <IonAvatar style={{
                  width: '100px',
                  height: '100px',
                  marginBottom: '1rem',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}>
                  <img src={Logo} alt="Logo" />
                </IonAvatar>

                <h1 style={h1Style}>TaxMap Admin</h1>
                
                <IonInput
                  label="Email"
                  labelPlacement="floating"
                  fill="outline"
                  type="email"
                  placeholder="Enter Email"
                  value={email}
                  onIonChange={e => setEmail(e.detail.value!)}
                  style={{
                    width: '100%',
                    '--background': 'rgba(255, 255, 255, 0.1)',
                    '--color': 'white',
                    '--border-color': 'rgba(255, 255, 255, 0.3)',
                  }}
                />
                
                <IonInput
                  label="Password"
                  labelPlacement="floating"
                  fill="outline"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onIonChange={e => setPassword(e.detail.value!)}
                  style={{
                    width: '100%',
                    '--background': 'rgba(255, 255, 255, 0.1)',
                    '--color': 'white',
                    '--border-color': 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <IonInputPasswordToggle slot="end" color="light" />
                </IonInput>

                <IonButton 
                  onClick={doLogin} 
                  expand="block" 
                  shape="round" 
                  color="warning"
                  style={{ marginTop: '1rem' }}
                >
                  Login
                </IonButton>

                <IonButton 
                  routerLink="" 
                  expand="block" 
                  fill="clear" 
                  shape="round" 
                  color="light"
                >
                  Add A Taxmap Admin or User
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        <AlertBox message={alertMessage} isOpen={showAlert} onClose={() => setShowAlert(false)} />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Login successful! Redirecting..."
          duration={1500}
          position="top"
          color="primary"
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;