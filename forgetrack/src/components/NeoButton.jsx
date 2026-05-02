import React from 'react';

export default function NeoButton({ children, color = 'bg-yellow-300', onClick, className = '', type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`border-4 border-black font-bold uppercase px-6 py-3 shadow-neo hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-150 ease-in-out ${color} ${className}`}
    >
      {children}
    </button>
  );
}
