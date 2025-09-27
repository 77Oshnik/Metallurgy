import React from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import ProjectNavbar from '@/components/layout/ProjectNavbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen ">
      {/* Project Navbar */}
        <ProjectNavbar/>

      {/* Main content area for children */}
      <main className="container mx-auto p-4">{children}</main>
    </div>
  );
};

export default Layout;