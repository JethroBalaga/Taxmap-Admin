import React from 'react';
import { IonProgressBar, IonText } from '@ionic/react';

interface PasswordStrengthMeterProps {
  password: string;
  strength: {
    value: number;
    label: string;
    color: string;
  };
}

const StrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password, strength }) => {
  if (!password) return null;

  return (
    <div style={{ width: '100%', marginTop: '8px' }}>
      <IonProgressBar 
        value={strength.value} 
        color={strength.color}
        style={{ height: '4px' }}
      />
      <IonText color={strength.color} style={{ fontSize: '12px' }}>
        {strength.label}
      </IonText>
      
      <div style={{ 
        width: '100%', 
        color: '#a1a1aa',
        fontSize: '12px',
        margin: '8px 0'
      }}>
        <p>Password should contain:</p>
        <ul style={{ paddingLeft: '20px', margin: '8px 0 0 0' }}>
          <li style={{ color: password.length >= 8 ? '#3880ff' : '#a1a1aa' }}>
            At least 8 characters
          </li>
          <li style={{ color: /[A-Z]/.test(password) ? '#3880ff' : '#a1a1aa' }}>
            One uppercase letter
          </li>
          <li style={{ color: /[0-9]/.test(password) ? '#3880ff' : '#a1a1aa' }}>
            One number
          </li>
          <li style={{ color: /[^A-Za-z0-9]/.test(password) ? '#3880ff' : '#a1a1aa' }}>
            One special character
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StrengthMeter;