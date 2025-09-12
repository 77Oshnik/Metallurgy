import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemStatement } from "@/components/landing/ProblemStatement";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { CircularEconomySection } from "@/components/landing/CircularEconomySection";
import { Footer } from "@/components/landing/Footer";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onGetStarted={handleGetStarted} />
      <HeroSection onGetStarted={handleGetStarted} />
      <ProblemStatement />
      <FeaturesSection />
      <CircularEconomySection />
      <Footer />
    </div>
  );
};

export default Landing;