'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  AlertTriangle, 
  Zap, 
  Recycle, 
  Sparkles,
  ArrowLeft,
  Menu,
  X,
  FlaskConical
} from 'lucide-react';

export default function ProjectNavbar() {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params.id as string;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Results',
      href: `/projects/${projectId}/results`,
      icon: BarChart3
    },
    {
      name: 'Harmful Effects',
      href: `/projects/${projectId}/harmful-effects-analyzer`,
      icon: AlertTriangle
    },
    {
      name: 'Energy Transition',
      href: `/projects/${projectId}/renewable`,
      icon: Zap
    },
    {
      name: 'Byproduct Valorization',
      href: `/projects/${projectId}/by-product`,
      icon: Sparkles
    },
    {
      name: 'Circular Comparison',
      href: `/projects/${projectId}/circular-comparison`,
      icon: Recycle
    },
    {
      name: 'What-If Analysis',
      href: `/projects/${projectId}/what-if`,
      icon: FlaskConical
    }
  ];

  const isActivePath = (href: string) => pathname === href;

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Back to Projects Button */}
          <div className="flex items-center">
            <Link href="/projects">
              <Button 
                variant="outline"   
                size="sm"
                className="mr-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.href);
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center space-x-2 ${
                      isActive 
                        ? "bg-green-600 text-white shadow-sm hover:bg-green-500" 
                        : "hover:bg-accent/100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.href);
                
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start text-sm ${
                        isActive 
                          ? "bg-green-600 text-white shadow-sm" 
                          : "hover:bg-accent/50"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}