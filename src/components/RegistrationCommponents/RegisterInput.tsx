import React from 'react';
import { IonInput, IonInputPasswordToggle } from '@ionic/react';

type InputType = 
  | 'text'
  | 'password'
  | 'email'
  | 'number'
  | 'search'
  | 'tel'
  | 'url'
  | 'date'
  | 'datetime-local'
  | 'month'
  | 'time'
  | 'week';

interface RegisterInputProps {
  label: string;
  type: InputType;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  showToggle?: boolean;
  className?: string;
}

const RegisterInput: React.FC<RegisterInputProps> = ({
  label,
  type,
  placeholder,
  value,
  onChange,
  showToggle = false,
  className = ''
}) => {
  return (
    <IonInput
      className={className}
      label={label}
      labelPlacement="stacked"
      fill="outline"
      type={type}
      placeholder={placeholder}
      value={value}
      onIonChange={(e) => onChange(e.detail.value!)}
    >
      {showToggle && <IonInputPasswordToggle slot="end" />}
    </IonInput>
  );
};

export default RegisterInput;