import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, IonCard, IonCardContent } from '@ionic/react';
import { supabase } from '../utils/supaBaseClient';
import bcrypt from 'bcryptjs';
import RegisterInput from '../components/RegistrationCommponents/RegisterInput';
import StrengthMeter from '../components/RegistrationCommponents/StrengthMeter';
import RegisterButton from '../components/RegistrationCommponents/RegisterButton';
import VerificationModal from '../components/RegistrationCommponents/VerificationModal';
import SuccessModal from '../components/RegistrationCommponents/SuccessModal';
import AlertBox from '../components/AlertBox';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    value: 0,
    label: '',
    color: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (formData.password) {
      const strength = calculatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({
        value: 0,
        label: '',
        color: ''
      });
    }
  }, [formData.password]);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    if (strength <= 2) return { value: 0.25, label: 'Very Weak', color: 'danger' };
    if (strength <= 4) return { value: 0.5, label: 'Weak', color: 'warning' };
    if (strength <= 6) return { value: 0.75, label: 'Strong', color: 'success' };
    return { value: 1, label: 'Very Strong', color: 'primary' };
  };

  const handleOpenVerificationModal = () => {
    if (formData.password !== formData.confirmPassword) {
      setAlertMessage('Passwords do not match.');
      setShowAlert(true);
      return;
    }

    if (formData.password.length < 8) {
      setAlertMessage('Password must be at least 8 characters.');
      setShowAlert(true);
      return;
    }

    setShowVerificationModal(true);
  };

  const doRegister = async () => {
    setShowVerificationModal(false);

    try {
      const { data, error } = await supabase.auth.signUp({ 
        email: formData.email, 
        password: formData.password 
      });

      if (error) {
        throw new Error('Account creation failed: ' + error.message);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(formData.password, salt);

      const { error: insertError } = await supabase.from('users').insert([
        {
          username: formData.username,
          user_email: formData.email,
          user_firstname: formData.firstName,
          user_lastname: formData.lastName,
          user_password: hashedPassword,
        },
      ]);

      if (insertError) {
        throw new Error('Failed to save user data: ' + insertError.message);
      }

      setShowSuccessModal(true);
    } catch (err) {
      if (err instanceof Error) {
        setAlertMessage(err.message);
      } else {
        setAlertMessage('An unknown error occurred.');
      }
      setShowAlert(true);
    }
  };

  return (
    <IonPage>
      <IonContent
        fullscreen
        className="ion-padding"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#121212',
          height: '100vh',
        }}
      >
        <IonCard
          style={{
            background: '#1e1e1e',
            width: '100%',
            maxWidth: '500px',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.6)',
            margin: 'auto',
          }}
        >
          <IonCardContent>
            <h1 style={{ color: 'white', marginBottom: '20px', textAlign: 'center' }}>Register Employee</h1>

            <RegisterInput
              label="Username"
              type="text"
              placeholder="Enter a unique username"
              value={formData.username}
              onChange={(value) => handleInputChange('username', value)}
            />

            <RegisterInput
              label="First Name"
              type="text"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={(value) => handleInputChange('firstName', value)}
            />

            <RegisterInput
              label="Last Name"
              type="text"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={(value) => handleInputChange('lastName', value)}
            />

            <RegisterInput
              label="Email"
              type="email"
              placeholder="youremail@nbsc.edu.ph"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
            />

            <RegisterInput
              label="Password"
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              showToggle={true}
            />

            <StrengthMeter
              password={formData.password} 
              strength={passwordStrength} 
            />

            <RegisterInput
              label="Confirm Password"
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={(value) => handleInputChange('confirmPassword', value)}
              showToggle={true}
            />

            <RegisterButton
              onClick={handleOpenVerificationModal}
              expand="block"
              shape="round"
              color="primary"
              style={{ marginTop: '20px' }}
            >
              Register
            </RegisterButton>

            <RegisterButton
              routerLink="/"
              expand="block"
              fill="clear"
              shape="round"
              color="primary"
            >
              Already have an account? Sign in
            </RegisterButton>

            <VerificationModal
              isOpen={showVerificationModal}
              onClose={() => setShowVerificationModal(false)}
              onConfirm={doRegister}
              formData={formData}
            />

            <SuccessModal
              isOpen={showSuccessModal}
              onClose={() => setShowSuccessModal(false)}
            />

            <AlertBox
              message={alertMessage} 
              isOpen={showAlert} 
              onClose={() => setShowAlert(false)} 
            />
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Register;