import React from 'react';

const BrutalButton = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold uppercase border-2 border-black transition-all neobrutal-shadow-sm neobrutal-shadow-hover neobrutal-shadow-active disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#ffde03] hover:bg-[#e6c802]',
    secondary: 'bg-white hover:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    success: 'bg-green-400 hover:bg-green-500',
  };

  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-xl tracking-tighter',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default BrutalButton;
