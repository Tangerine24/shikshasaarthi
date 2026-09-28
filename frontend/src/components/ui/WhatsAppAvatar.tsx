import React from 'react';

interface WhatsAppAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-7 h-7',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
};

export const WhatsAppAvatar: React.FC<WhatsAppAvatarProps> = ({
  size = 'md',
  className = '',
}) => {
  const chosenSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center bg-[#DFE5E7] text-white shrink-0 select-none shadow-xs relative ${chosenSize} ${className}`}
      title="User Avatar"
    >
      <svg
        viewBox="0 0 24 24"
        fill="#FFFFFF"
        className="w-full h-full translate-y-1 scale-105"
      >
        {/* Head */}
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    </div>
  );
};

export default WhatsAppAvatar;
