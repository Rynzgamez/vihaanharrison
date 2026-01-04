import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturedWork from "@/components/FeaturedWork";
import Contact from "@/components/Contact";
import CursorEffect from "@/components/CursorEffect";

const Index = () => {
  return (
    <div className="min-h-screen">
      <CursorEffect />
      <Navigation />
      <Hero />
      <FeaturedWork />
      <Contact />
    </div>
  );
};

export default Index;
