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
    <div style={{ marginBottom: 8 }}>
      <label style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>{label || name}</label>
      <input
        name={name}
        value={value as any}
        type={type}
        onChange={(e) => onChange(name, type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
        style={{ padding: 8, width: '100%', boxSizing: 'border-box' }}
      />
    </div>
  );
}
