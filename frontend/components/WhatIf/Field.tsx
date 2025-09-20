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
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-white mb-1">{label || name}</label>
      <input
        name={name}
        value={value as any}
        type={type}
        onChange={(e) => onChange(name, type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
