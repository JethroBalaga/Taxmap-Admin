import React from 'react';
import { IonButton } from '@ionic/react';

interface RegisterButtonProps {
  onClick?: () => void;
  routerLink?: string;
  expand?: 'full' | 'block';
  fill?: 'clear' | 'outline' | 'solid';
  shape?: 'round';
  color?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const RegisterButton: React.FC<RegisterButtonProps> = ({
  onClick,
  routerLink,
  expand = 'block',
  fill,
  shape,
  color = 'primary',
  style,
  children
}) => {
  return (
    <IonButton
      onClick={onClick}
      routerLink={routerLink}
      expand={expand}
      fill={fill}
      shape={shape}
      color={color}
      style={style}
    >
      {children}
    </IonButton>
  );
};

export default RegisterButton;