import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Recycle, Factory, Truck, Home, Trash2 } from "lucide-react";
import circularEconomyImage from "@/assets/circular-economy.jpg";

export const CircularEconomySection = () => {
  const stages = [
    { icon: Factory, label: "Extraction", color: "text-red-400 bg-red-500/10 border-red-500/30" },
    { icon: Factory, label: "Processing", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
    { icon: Truck, label: "Transport", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
    { icon: Home, label: "Use Phase", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
    { icon: Recycle, label: "Recycling", color: "text-green-400 bg-green-500/10 border-green-500/30" }
  ];

  const benefits = [
    { value: "62%", label: "Emission Reduction", desc: "Lower CO₂ compared to linear models" },
    { value: "45%", label: "Energy Savings", desc: "Through optimized recycling processes" },
    { value: "80%", label: "Material Recovery", desc: "Maximize resource utilization" },
    { value: "35%", label: "Cost Reduction", desc: "Long-term operational savings" }
  ];

  return (
    <section className="py-20 bg-black/95 relative overflow-hidden">
      {/* Animated circuit pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(0, 255, 65, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(0, 255, 65, 0.2) 0%, transparent 50%),
            linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 100% 100%, 60px 60px, 60px 60px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white uppercase tracking-wider">
            <span className="text-glitch" data-text="Circular Protocol">Circular Protocol</span>
          </h2>
          <div className="w-40 h-1 bg-gradient-hero mx-auto mb-6 scan-line"></div>
          <p className="text-xl text-green-100/80 max-w-3xl mx-auto font-mono">
            [SYSTEM_OPTIMIZATION] Transform linear take-make-dispose models into regenerative systems 
            that benefit both business and environment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Visual */}
          <div className="order-2 lg:order-1">
            <Card className="overflow-hidden shadow-glow bg-black/60 border-green-500/30 backdrop-blur-sm relative">
              {/* Glowing border animation */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500/20 via-green-400/30 to-green-500/20 opacity-50 animate-pulse"></div>
              
              <CardContent className="p-0 relative z-10">
                {/* Replace image with tech visualization */}
                <div className="w-full h-64 bg-gradient-to-br from-green-900/50 to-black/80 flex items-center justify-center relative overflow-hidden">
                  <div className="text-6xl text-green-400/30 font-mono">⚡</div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/10 to-transparent animate-pulse"></div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-wide font-mono">Closed-Loop Metal Production</h3>
                  
                  {/* Process Flow */}
                  <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                    {stages.map((stage, index) => {
                      const Icon = stage.icon;
                      return (
                        <div key={index} className="flex items-center">
                          <div className={`p-2 rounded-full ${stage.color} border transition-all duration-300 hover:scale-110`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-mono font-medium ml-2 mr-3 text-green-100/80 uppercase tracking-wider">{stage.label}</span>
                          {index < stages.length - 1 && (
                            <ArrowRight className="h-3 w-3 text-green-400 animate-pulse" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-sm font-mono font-medium border border-green-500/30">
                      <Recycle className="h-4 w-4 animate-spin" style={{ animationDuration: '3s' }} />
                      [CONTINUOUS_MATERIAL_FLOW]
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Benefits */}
          <div className="order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center p-6 bg-black/60 border-green-500/20 backdrop-blur-sm hover:shadow-glow transition-all duration-500 hover:-translate-y-1 relative overflow-hidden group">
                  {/* Scanning effect */}
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse"></div>
                  
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-green-400 mb-2 font-mono group-hover:text-green-300 transition-colors">{benefit.value}</div>
                    <div className="font-bold text-white mb-1 uppercase tracking-wide font-mono text-sm">{benefit.label}</div>
                    <div className="text-xs text-green-100/60 font-mono">{benefit.desc}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8">
              <Card className="p-6 bg-gradient-to-br from-green-900/50 to-black/80 border border-green-500/30 shadow-glow relative overflow-hidden">
                {/* Matrix rain effect */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `
                      linear-gradient(rgba(0, 255, 65, 0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0, 255, 65, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}></div>
                </div>
                
                <CardContent className="p-0 relative z-10">
                  <h4 className="text-xl font-bold mb-3 text-green-400 uppercase tracking-wide font-mono">[CIRCULAR_ADVANTAGE]</h4>
                  <p className="text-green-100/80 mb-4 font-mono text-sm">
                    By implementing circular economy principles, metal producers can:
                  </p>
                  <ul className="space-y-2 text-green-100/80 font-mono text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                      Reduce dependency on virgin materials
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      Minimize waste and environmental impact
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      Create new revenue streams
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                      Meet sustainability regulations
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};