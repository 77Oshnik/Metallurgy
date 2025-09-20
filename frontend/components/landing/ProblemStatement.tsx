import { AlertTriangle, TrendingUp, Recycle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const ProblemStatement = () => {
  const challenges = [
    {
      icon: AlertTriangle,
      title: "Environmental Impact",
      description: "Metal production accounts for 7% of global CO₂ emissions, with aluminum and steel leading contributors to environmental degradation.",
      stat: "7%",
      statLabel: "of global emissions"
    },
    {
      icon: TrendingUp,
      title: "Rising Demand",
      description: "Global metal demand is projected to increase by 250% by 2050, putting unprecedented pressure on natural resources.",
      stat: "250%",
      statLabel: "demand increase by 2050"
    },
    {
      icon: Recycle,
      title: "Linear Economy",
      description: "Traditional take-make-dispose models waste valuable materials. Only 30% of metals are currently recycled globally.",
      stat: "30%",
      statLabel: "recycling rate"
    }
  ];

  return (
    <section id="about" className="py-20 bg-black/95 matrix-bg relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white uppercase tracking-wider">
            <span className="text-glitch" data-text="System Analysis">System Analysis</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-hero mx-auto mb-6 scan-line"></div>
          <p className="text-xl text-green-100/80 max-w-3xl mx-auto font-mono">
            [CRITICAL_ERRORS_DETECTED] The metals industry faces unprecedented environmental challenges that require 
            innovative, data-driven solutions for sustainable transformation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {challenges.map((challenge, index) => {
            const Icon = challenge.icon;
            return (
              <Card key={index} className="group hover:shadow-glow transition-all duration-500 hover:-translate-y-2 bg-black/80 border-green-500/30 backdrop-blur-sm relative overflow-hidden">
                {/* Scanning line effect */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse"></div>
                
                <CardContent className="p-8 text-center relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-6 group-hover:bg-green-500/20 transition-all duration-300 border border-green-500/30 group-hover:border-green-400/50">
                    <Icon className="h-8 w-8 text-green-400 group-hover:text-green-300 transition-colors" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-wide font-mono">{challenge.title}</h3>
                  
                  <p className="text-green-100/70 mb-6 leading-relaxed font-mono text-sm">
                    {challenge.description}
                  </p>
                  
                  <div className="pt-4 border-t border-green-500/20">
                    <div className="text-3xl font-bold text-green-400 mb-1 font-mono group-hover:text-green-300 transition-colors">{challenge.stat}</div>
                    <div className="text-xs text-green-100/60 uppercase tracking-wider font-mono">{challenge.statLabel}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 px-8 py-6 rounded-xl bg-black/60 shadow-glow border border-green-500/30 backdrop-blur-sm relative overflow-hidden">
            {/* Glowing border animation */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/20 via-green-400/30 to-green-500/20 opacity-50 animate-pulse"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="text-2xl">⚡</div>
              <div className="text-left">
                <div className="font-bold text-green-400 uppercase tracking-wide font-mono">[SOLUTION_INITIALIZED]</div>
                <div className="text-green-100/80 font-mono text-sm">AI-powered LCA tools that make sustainability actionable</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};