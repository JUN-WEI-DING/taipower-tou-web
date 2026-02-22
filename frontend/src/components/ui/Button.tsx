import React from 'react';
import { Button as NextUIButton } from '@nextui-org/react';
import type { ButtonProps as NextUIButtonProps } from '@nextui-org/react';

interface ButtonProps extends Omit<NextUIButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'solid' | 'flat' | 'bordered' | 'light';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'solid',
  className = '',
  children,
  ...props
}) => {
  const variantMap: Record<string, NextUIButtonProps['variant']> = {
    primary: 'solid',
    secondary: 'flat',
    outline: 'bordered',
    ghost: 'light',
    solid: 'solid',
    flat: 'flat',
    bordered: 'bordered',
    light: 'light',
  };

  return (
    <NextUIButton
      variant={variantMap[variant] || 'solid'}
      radius="lg"
      className={className}
      {...props}
    >
      {children}
    </NextUIButton>
  );
};

export default Button;
