import React from 'react';
import { useLogoLedStyle } from '../../hooks/useLogoLedStyle';

interface LogoLedBadgeProps {
  left: number;
  top: number;
  width: number;
  height: number;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export const LogoLedBadge: React.FC<LogoLedBadgeProps> = ({
  left,
  top,
  width,
  height,
  onClick,
  className = 'keycap-logo-badge logo-keycap',
}) => {
  const ledStyle = useLogoLedStyle();

  return (
    <div
      data-key-id="LOGO_LED"
      className={className}
      style={{
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
        ...ledStyle,
      }}
      onClick={onClick}
      title="Logo LED Diffuser"
    />
  );
};
