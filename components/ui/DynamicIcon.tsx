import React from 'react';
import * as Icons from 'lucide-react';

interface DynamicIconProps extends React.SVGProps<SVGSVGElement> {
  name?: string;
  size?: number | string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  if (!name) return null;

  // Access the icon from the Icons namespace
  const IconComponent = (Icons as any)[name];

  if (!IconComponent) {
    return null; // Or return a fallback icon
  }

  return <IconComponent {...props} />;
};