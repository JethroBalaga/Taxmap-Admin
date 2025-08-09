import React from 'react';
import { IonInput, IonInputPasswordToggle } from '@ionic/react';

interface RegisterInputProps {
  label: string;
  type?: React.ComponentProps<typeof IonInput>['type']; // matches Ionic's type definition
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  showToggle?: boolean;
}

const RegisterInput: React.FC<RegisterInputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  showToggle = false
}) => {
  const inputStyle = {
    marginTop: '15px',
    color: 'white',
    backgroundColor: '#1e1e1e',
    borderRadius: '8px',
    padding: '12px',
    '--background': '#1e1e1e',
    '--color': '#fff',
    '--placeholder-color': '#aaa',
    '--highlight-color-focused': '#3a8ef6',
  } as React.CSSProperties;

  return (
    <IonInput
      label={label}
      labelPlacement="stacked"
      fill="outline"
      type={showToggle ? 'password' : type} // auto-password if toggle is enabled
      placeholder={placeholder}
      value={value}
      onIonChange={(e) => onChange(e.detail.value ?? '')}
      style={inputStyle}
    >
      {showToggle && <IonInputPasswordToggle slot="end" />}
    </IonInput>
  );
};

export default RegisterInput;
