import React, { useState, useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { supabase } from '../utils/supaBaseClient';
import bcrypt from 'bcryptjs';
import './Registration.css';

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
    color: 'yellow'
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
        color: 'yellow'
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
      <IonContent className="registration-container">
        <div className="registration-background"></div>
        
        <div className="registration-card">
          <div className="registration-content">
            <h1 className="registration-title">Create your account</h1>

            <RegisterInput
              label="Username"
              type="text"
              placeholder="Enter a unique username"
              value={formData.username}
              onChange={(value) => handleInputChange('username', value)}
              className="registration-input"
            />

            <RegisterInput
              label="First Name"
              type="text"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={(value) => handleInputChange('firstName', value)}
              className="registration-input"
            />

            <RegisterInput
              label="Last Name"
              type="text"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={(value) => handleInputChange('lastName', value)}
              className="registration-input"
            />

            <RegisterInput
              label="Email"
              type="email"
              placeholder="youremail@nbsc.edu.ph"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              className="registration-input"
            />

            <RegisterInput
              label="Password"
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              className="registration-input"
              showToggle={true}
            />

            <PasswordStrengthMeter 
              password={formData.password} 
              strength={passwordStrength} 
            />

            <RegisterInput
              label="Confirm Password"
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={(value) => handleInputChange('confirmPassword', value)}
              className="registration-input"
              showToggle={true}
            />

            <RegisterButton
              onClick={handleOpenVerificationModal}
              className="registration-button"
            >
              Register
            </RegisterButton>

            <RegisterButton
              routerLink="/"
              className="registration-secondary-button"
              fill="clear"
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
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;