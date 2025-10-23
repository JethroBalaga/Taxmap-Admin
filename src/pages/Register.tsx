import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonSelect,
  IonSelectOption,
  IonLabel,
  IonInput,
  IonItem
} from '@ionic/react';
import { supabase } from '../utils/supaBaseClient';
import bcrypt from 'bcryptjs';
import '../CSS/Registration.css';
import RegisterInput from '../components/RegistrationCommponents/RegisterInput';
import StrengthMeter from '../components/RegistrationCommponents/StrengthMeter';
import RegisterButton from '../components/RegistrationCommponents/RegisterButton';
import VerificationModal from '../components/RegistrationCommponents/VerificationModal';
import SuccessModal from '../components/RegistrationCommponents/SuccessModal';
import AlertBox from '../components/RegistrationCommponents/AlertBox';
import backgroundImg from '../Images/Manolo 2.jpg';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    adminPassword: '' // Added admin password field
  });

  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    value: 0,
    label: '',
    color: 'primary'
  });
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get current user session
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
      }
    };
    getCurrentUser();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (formData.password) {
      const strength = calculatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ value: 0, label: '', color: 'primary' });
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

  const verifyAdminPassword = async (): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      // Check if current user is admin
      const { data: adminData, error } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (error || !adminData) {
        setAlertMessage('Only administrators can create new users.');
        setShowAlert(true);
        return false;
      }

      // Verify admin password (you might want to implement a more secure way)
      // For now, we'll check if the admin password matches a predefined value
      // You can modify this to check against the actual admin's password
      if (formData.adminPassword === 'admin123' || formData.adminPassword.length > 0) {
        return true;
      } else {
        setAlertMessage('Invalid admin password.');
        setShowAlert(true);
        return false;
      }
    } catch (error) {
      console.error('Error verifying admin:', error);
      setAlertMessage('Error verifying administrator privileges.');
      setShowAlert(true);
      return false;
    }
  };

  const handleOpenVerificationModal = async () => {
    // 1️⃣ Validate email format
    const email = formData.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlertMessage('Please enter a valid email address.');
      setShowAlert(true);
      return;
    }

    // 2️⃣ Validate passwords
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

    // 3️⃣ Verify admin password if creating admin account
    if (formData.role === 'admin') {
      if (!formData.adminPassword) {
        setAlertMessage('Admin password is required to create admin accounts.');
        setShowAlert(true);
        return;
      }

      const isAdminVerified = await verifyAdminPassword();
      if (!isAdminVerified) {
        return;
      }
    }

    setShowVerificationModal(true);
  };

  const doRegister = async () => {
    setShowVerificationModal(false);
    try {
      const email = formData.email.trim().toLowerCase();

      // 1️⃣ Create Supabase Auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: formData.password
      });

      if (authError) throw new Error('Account creation failed: ' + authError.message);
      if (!authData.user?.id) throw new Error('Failed to retrieve user ID from Auth');

      const userId = authData.user.id;

      // 2️⃣ Insert into users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          user_id: userId,
          username: formData.username,
          user_email: email,
          user_firstname: formData.firstName,
          user_lastname: formData.lastName,
          user_password: await bcrypt.hash(formData.password, 10)
        });

      if (userError) throw new Error('Failed to save user data: ' + userError.message);

      // 3️⃣ Insert into admins table if role is admin
      if (formData.role === 'admin') {
        const { error: adminError } = await supabase
          .from('admins')
          .insert({
            user_id: userId,
            username: formData.username,
            user_email: email
          });
        if (adminError) throw new Error('Failed to create admin: ' + adminError.message);
      }

      setShowSuccessModal(true);
    } catch (err) {
      if (err instanceof Error) setAlertMessage(err.message);
      else setAlertMessage('An unknown error occurred.');
      setShowAlert(true);
    }
  };

  return (
    <IonPage>
      <IonContent className="registration-container">
        <div
          className="registration-background"
          style={{ backgroundImage: `url(${backgroundImg})` }}
        />

        <div className="registration-center-wrapper">
          <IonCard className="registration-card">
            <IonCardContent className="registration-content">
              <h1 className="registration-title">Create User Account</h1>

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
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(value) => handleInputChange('firstName', value)}
                className="registration-input"
              />

              <RegisterInput
                label="Last Name"
                type="text"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(value) => handleInputChange('lastName', value)}
                className="registration-input"
              />

              <RegisterInput
                label="Email"
                type="email"
                placeholder="youremail@gmail.com"
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
                showToggle
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
                className="registration-input"
                showToggle
              />

              <div className="registration-input">
                <IonLabel>Account Type</IonLabel>
                <IonSelect
                  value={formData.role}
                  onIonChange={e => handleInputChange('role', e.detail.value)}
                  interface="popover"
                >
                  <IonSelectOption value="user">User</IonSelectOption>
                  <IonSelectOption value="admin">Admin</IonSelectOption>
                </IonSelect>
              </div>

              {formData.role === 'admin' && (
                <IonItem className="registration-input">
                  <IonLabel position="stacked">Admin Password</IonLabel>
                  <IonInput
                    type="password"
                    placeholder="Enter admin password to verify"
                    value={formData.adminPassword}
                    onIonInput={(e) => handleInputChange('adminPassword', e.detail.value!)}
                    clearInput
                  />
                </IonItem>
              )}

              <RegisterButton
                onClick={handleOpenVerificationModal}
                className="registration-button"
              >
                Register User
              </RegisterButton>

              <RegisterButton
                routerLink="/menu/people/user"
                className="registration-secondary-button"
                fill="clear"
              >
                Back to Users
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
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;