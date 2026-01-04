import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import CursorEffect from "@/components/CursorEffect";
import { Brain, Layers, Target, Lightbulb } from "lucide-react";
import profilePhoto from "@/assets/profile-photo.jpg";
import logo from "@/assets/logo.png";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AboutPage = () => {
  const capabilities = [
    {
      icon: Brain,
      title: "AI & Machine Learning",
      description: "Building intelligent systems that solve real problems—from natural language processing to computer vision applications."
    },
    {
      icon: Layers,
      title: "Systems Thinking",
      description: "Approaching complex challenges through structured analysis, identifying leverage points and designing scalable solutions."
    },
    {
      icon: Target,
      title: "Product & Design",
      description: "Translating user needs into functional experiences through research-driven design and iterative development."
    },
    {
      icon: Lightbulb,
      title: "Technical Leadership",
      description: "Driving projects from concept to completion, coordinating cross-functional work and maintaining quality standards."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <CursorEffect />
      <Navigation />
      
      {/* Subtle background accents */}
      <motion.div 
        className="absolute top-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-[40px] pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <main className="pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto mb-24"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="mb-8 flex justify-start"
                >
                  <img src={logo} alt="Vihaan Harrison Logo" className="h-24 w-auto" />
                </motion.div>

                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="text-accent">Vihaan Harrison</span>
                </h1>
                
                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                  Design Manager–minded technologist building at the intersection of 
                  AI systems, product thinking, and human-centered design.
                </p>
                
                <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
                  I approach technology as a medium for solving meaningful problems. 
                  My work spans AI development, product design, and technical leadership—always 
                  with a focus on systems that scale, interfaces that resonate, and outcomes that matter.
                </p>

                <div className="inline-block px-6 py-3 bg-accent/10 rounded-lg border border-accent/20 mb-8">
                  <p className="text-foreground font-semibold">
                    "Design to inspire, code to create, act to impact."
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link to="/work">View Work</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                    <Link to="/contact">Get in Touch</Link>
                  </Button>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-accent/20">
                  <img
                    src={profilePhoto}
                    alt="Vihaan Harrison"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>
                <motion.div 
                  className="absolute -bottom-8 -right-8 w-40 h-40 bg-accent/15 rounded-full blur-[30px]"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Capabilities */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Core <span className="text-accent">Capabilities</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {capabilities.map((capability, index) => (
                <motion.div
                  key={capability.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-card rounded-xl p-8 shadow-elegant hover:shadow-glow transition-smooth"
                >
                  <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <capability.icon className="text-accent" size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{capability.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {capability.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Approach */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-card rounded-2xl p-8 md:p-12 shadow-elegant mb-24"
          >
            <h2 className="text-3xl font-bold mb-6 text-center">
              How I <span className="text-accent">Work</span>
            </h2>
            <div className="space-y-6 text-foreground/80">
              <p className="leading-relaxed">
                I believe in building with intention. Every project starts with understanding 
                the problem deeply—researching context, identifying constraints, and defining 
                what success looks like before writing a single line of code.
              </p>
              <p className="leading-relaxed">
                My technical background spans AI/ML systems, full-stack development, and 
                interface design. But technology is always a means to an end. I'm most 
                interested in the intersection: where technical capability meets user need 
                meets business value.
              </p>
              <p className="leading-relaxed">
                I think in systems—understanding how components interact, where leverage 
                points exist, and how to design for adaptability. This perspective shapes 
                everything from architecture decisions to team workflows.
              </p>
            </div>
          </motion.div>

          {/* Link to Foundations */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <p className="text-muted-foreground mb-4">
              Interested in the academic, leadership, and experiential foundations 
              that shaped this approach?
            </p>
            <Button asChild variant="outline" className="border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground">
              <Link to="/foundations">View Foundations →</Link>
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;
