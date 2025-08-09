import React from "react";
import { IonInput, IonItem, IonLabel } from "@ionic/react";

interface InputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  type?: HTMLInputElement["type"]; // use native HTML input type for stronger typing
  placeholder?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}) => {
  return (
    <IonItem>
      {label && <IonLabel position="stacked">{label}</IonLabel>}
      <IonInput
        value={value}
        type={type as any} // cast to any to satisfy IonInput typing
        placeholder={placeholder}
        onIonChange={(e) => onChange(e.detail.value ?? "")}
      />
    </IonItem>
  );
};

export default Input;
