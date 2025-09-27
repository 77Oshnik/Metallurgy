'use client';
import React from 'react';

type Props = {
  name: string;
  label?: string;
  value: string | number;
  type?: 'number' | 'text';
  onChange: (name: string, value: string | number) => void;
};

export default function Field({ name, label, value, type = 'number', onChange }: Props) {
  const displayLabel = label || name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  
  return (
    <div className="group">
      <label 
        htmlFor={name}
        className="block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-blue-600"
      >
        {displayLabel}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          value={value}
          type={type}
          placeholder={type === 'number' ? '0.000' : 'Enter value...'}
          onChange={(e) => onChange(name, type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
          className="
            w-full px-4 py-3 rounded-lg
            bg-white/80 backdrop-blur-sm
            border border-gray-300/50
            text-gray-800 placeholder-gray-400
            shadow-inner shadow-gray-100/50
            transition-all duration-300 ease-in-out
            focus:outline-none 
            focus:ring-2 focus:ring-blue-500/30 
            focus:border-blue-400
            focus:bg-white
            hover:border-gray-400/70
            hover:bg-white/90
            font-mono text-sm
          "
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-blue-50/[0.02] to-transparent pointer-events-none" />
        
        {/* Focus indicator */}
        <div className="absolute inset-0 rounded-lg ring-1 ring-transparent group-focus-within:ring-blue-500/20 transition-all duration-300 pointer-events-none" />
      </div>
    </div>
  );
}
