import { Icon as IconifyIcon } from '@iconify/react';

export function Icon({ name, size = 18, color, style, className }) {
  return (
    <IconifyIcon
      icon={name}
      width={size}
      height={size}
      color={color}
      style={style}
      className={className}
    />
  );
}
