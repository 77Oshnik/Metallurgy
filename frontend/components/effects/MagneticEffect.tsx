'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface MagneticEffectProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

export const MagneticEffect = ({ 
  children, 
  strength = 0.3, 
  className = '' 
}: MagneticEffectProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;
      
      element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    };

    const handleMouseLeave = () => {
      element.style.transform = 'translate(0px, 0px)';
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return (
    <div 
      ref={elementRef} 
      className={`magnetic transition-transform duration-300 ease-out ${className}`}
    >
      {children}
    </div>
  );
};