'use client';

import React from 'react';
import ProjectSidebar from './FloatingSidebar';

interface ProjectLayoutProps {
  children: React.ReactNode;
}

export default function ProjectLayout({ children }: ProjectLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar - Left side on desktop, full width on mobile */}
          <div className="lg:col-span-1">
            <ProjectSidebar />
          </div>
          
          {/* Main Content - Right side on desktop, full width on mobile */}
          <div className="lg:col-span-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}