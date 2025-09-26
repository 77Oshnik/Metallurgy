'use client';

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Menu, X } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  onGetStarted?: () => void;
}

export const Navbar = ({ onGetStarted }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="absolute top-0 left-0 w-full z-50 bg-transparent backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold tracking-wide text-green-500 hover:text-green-400 transition-colors cursor-pointer">
              Metal<span className="text-white">Sphere</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <a href="#features" className="text-white/90 hover:text-green-400 transition-colors text-sm font-medium">
              Features
            </a>
            <a href="/carbon-trading" className="text-white/90 hover:text-green-400 transition-colors text-sm font-medium">
              Carbon Trading
            </a>
            <a href="#about" className="text-white/90 hover:text-green-400 transition-colors text-sm font-medium">
              About
            </a>
            <a href="#contact" className="text-white/90 hover:text-green-400 transition-colors text-sm font-medium">
              Contact
            </a>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              onClick={onGetStarted}
              className="shadow-soft bg-green-600 hover:bg-green-500 hover:shadow-glow text-white px-5 py-2 rounded-xl transition-all"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-green-400 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-2">
            <div className="px-4 py-4 space-y-4 bg-black/70 backdrop-blur-lg rounded-lg shadow-lg">
              <a
                href="#features"
                className="block text-white/90 hover:text-green-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="/carbon-trading"
                className="block text-white/90 hover:text-green-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Carbon Trading
              </a>
              <a
                href="#about"
                className="block text-white/90 hover:text-green-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </a>
              <a
                href="#contact"
                className="block text-white/90 hover:text-green-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>
              <div className="pt-2 flex flex-col gap-3">
                <ThemeToggle />
                <Button
                  variant="default"
                  onClick={() => {
                    onGetStarted?.();
                    setIsMenuOpen(false);
                  }}
                  className="w-full shadow-soft bg-green-600 hover:bg-green-500 hover:shadow-glow text-white rounded-xl"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
