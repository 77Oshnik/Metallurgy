import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Brain, BarChart3, GitCompare, FileText, Zap } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: Database,
      title: "Smart Data Input",
      description: "Intuitive multi-step forms guide you through each LCA stage with intelligent suggestions and validation.",
      color: "bg-green-500/10 text-green-400 border-green-500/30"
    },
    {
      icon: Brain,
      title: "AI Suggestions",
      description: "Machine learning algorithms provide optimization recommendations based on industry best practices.",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/30"
    },
    {
      icon: BarChart3,
      title: "Rich Visualization",
      description: "Interactive charts and diagrams make complex environmental data easy to understand and actionable.",
      color: "bg-green-500/10 text-green-400 border-green-500/30"
    },
    {
      icon: GitCompare,
      title: "Pathway Comparison",
      description: "Compare linear vs circular economy approaches with detailed impact analysis and ROI calculations.",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/30"
    },
    {
      icon: FileText,
      title: "Comprehensive Reports",
      description: "Generate detailed sustainability reports with recommendations and compliance documentation.",
      color: "bg-green-500/10 text-green-400 border-green-500/30"
    },
    {
      icon: Zap,
      title: "Real-time Analysis",
      description: "Instant calculations and updates as you modify parameters, enabling rapid scenario modeling.",
      color: "bg-blue-500/10 text-blue-400 border-blue-500/30"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-black/95 to-gray-900/95 relative overflow-hidden">
      {/* Tech grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 65, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 65, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white uppercase tracking-wider">
            <span className="text-glitch" data-text="System Modules">System Modules</span>
          </h2>
          <div className="w-32 h-1 bg-gradient-hero mx-auto mb-6 scan-line"></div>
          <p className="text-xl text-green-100/80 max-w-3xl mx-auto font-mono">
            [MODULES_LOADED] Everything you need to conduct comprehensive lifecycle assessments 
            and drive meaningful environmental improvements in your metal production.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 bg-black/60 border-green-500/20 backdrop-blur-sm relative overflow-hidden">
                {/* Animated border */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500/0 via-green-500/20 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardHeader className="pb-4 relative z-10">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.color} mb-4 group-hover:scale-110 transition-all duration-300 border`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white uppercase tracking-wide font-mono">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-green-100/70 leading-relaxed font-mono text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Process Flow */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-center mb-12 text-white uppercase tracking-wider font-mono">
            <span className="text-glitch" data-text="Execution Protocol">Execution Protocol</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Input Data", desc: "Enter your production parameters", color: "from-green-500 to-green-600" },
              { step: "02", title: "AI Analysis", desc: "Our algorithms process your data", color: "from-blue-500 to-blue-600" },
              { step: "03", title: "View Results", desc: "Explore interactive visualizations", color: "from-purple-500 to-purple-600" },
              { step: "04", title: "Take Action", desc: "Implement sustainability improvements", color: "from-green-500 to-green-600" }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${item.color} text-white font-bold text-lg mb-4 shadow-glow group-hover:scale-110 transition-transform duration-300 border border-white/20`}>
                  {item.step}
                </div>
                <h4 className="font-bold mb-2 text-white uppercase tracking-wide font-mono text-sm">{item.title}</h4>
                <p className="text-xs text-green-100/60 font-mono">{item.desc}</p>
                
                {/* Connection line */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-green-500/50 to-transparent transform translate-x-8"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};