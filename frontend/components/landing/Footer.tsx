import { Mail, Phone, MapPin, Github, Linkedin, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-black/95 border-t border-green-500/30 relative overflow-hidden">
      {/* Matrix background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundSize: "30px 30px",
          }}
        ></div>
      </div>

      {/* Animated scanning line */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold  text-transparent mb-4 uppercase tracking-wider font-mono">
              <span className="text-glitch" data-text="Metallurgy LCA Tool">
                Metallurgy LCA Tool
              </span>
            </h3>
            <p className="text-green-100/70 mb-6 max-w-md font-mono text-sm leading-relaxed">
              [SYSTEM_ACTIVE] Empowering the metals industry with AI-powered
              lifecycle assessment tools for sustainable production and circular
              economy transformation.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-green-100/80 hover:text-green-400 transition-colors group">
                <div className="p-2 rounded-full bg-green-500/10 border border-green-500/30 group-hover:bg-green-500/20 transition-colors">
                  <Mail className="h-4 w-4 text-green-400" />
                </div>
                <span className="font-mono text-sm">
                  contact@metallurgy-lca.com
                </span>
              </div>
              <div className="flex items-center gap-3 text-green-100/80 hover:text-green-400 transition-colors group">
                <div className="p-2 rounded-full bg-green-500/10 border border-green-500/30 group-hover:bg-green-500/20 transition-colors">
                  <Phone className="h-4 w-4 text-green-400" />
                </div>
                <span className="font-mono text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-green-100/80 hover:text-green-400 transition-colors group">
                <div className="p-2 rounded-full bg-green-500/10 border border-green-500/30 group-hover:bg-green-500/20 transition-colors">
                  <MapPin className="h-4 w-4 text-green-400" />
                </div>
                <span className="font-mono text-sm">San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-wider font-mono text-sm">
              [QUICK_ACCESS]
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-green-100/70 hover:text-green-400 transition-colors font-mono text-sm flex items-center gap-2 group"
                >
                  <div className="w-1 h-1 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-green-100/70 hover:text-green-400 transition-colors font-mono text-sm flex items-center gap-2 group"
                >
                  <div className="w-1 h-1 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-green-100/70 hover:text-green-400 transition-colors font-mono text-sm flex items-center gap-2 group"
                >
                  <div className="w-1 h-1 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-green-100/70 hover:text-green-400 transition-colors font-mono text-sm flex items-center gap-2 group"
                >
                  <div className="w-1 h-1 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-green-100/70 hover:text-green-400 transition-colors font-mono text-sm flex items-center gap-2 group"
                >
                  <div className="w-1 h-1 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-wider font-mono text-sm">
              [RESOURCES]
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-green-100/70 hover:text-green-400 transition-colors font-mono text-sm flex items-center gap-2 group"
                >
                  <div className="w-1 h-1 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  API Reference
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-green-100/70 hover:text-green-400 transition-colors font-mono text-sm flex items-center gap-2 group"
                >
                  <div className="w-1 h-1 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Tutorials
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-green-100/70 hover:text-green-400 transition-colors font-mono text-sm flex items-center gap-2 group"
                >
                  <div className="w-1 h-1 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Case Studies
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-green-100/70 hover:text-green-400 transition-colors font-mono text-sm flex items-center gap-2 group"
                >
                  <div className="w-1 h-1 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  White Papers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-green-100/70 hover:text-green-400 transition-colors font-mono text-sm flex items-center gap-2 group"
                >
                  <div className="w-1 h-1 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-green-500/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center relative">
          {/* Glowing line animation */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/50 to-transparent"></div>

          <div className="text-green-100/60 text-sm mb-4 md:mb-0 font-mono">
            © 2024 [METALLURGY_LCA_TOOL] All rights reserved.
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <a
              href="#"
              className="text-green-100/70 hover:text-green-400 transition-all duration-300 hover:scale-110 group"
            >
              <div className="p-2 rounded-full bg-green-500/10 border border-green-500/30 group-hover:bg-green-500/20 group-hover:border-green-400/50 transition-all">
                <Github className="h-5 w-5" />
              </div>
            </a>
            <a
              href="#"
              className="text-green-100/70 hover:text-green-400 transition-all duration-300 hover:scale-110 group"
            >
              <div className="p-2 rounded-full bg-green-500/10 border border-green-500/30 group-hover:bg-green-500/20 group-hover:border-green-400/50 transition-all">
                <Linkedin className="h-5 w-5" />
              </div>
            </a>
            <a
              href="#"
              className="text-green-100/70 hover:text-green-400 transition-all duration-300 hover:scale-110 group"
            >
              <div className="p-2 rounded-full bg-green-500/10 border border-green-500/30 group-hover:bg-green-500/20 group-hover:border-green-400/50 transition-all">
                <Twitter className="h-5 w-5" />
              </div>
            </a>
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-xs">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            [SYSTEM_STATUS: ONLINE]
          </div>
        </div>
      </div>
    </footer>
  );
};
