import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import CursorEffect from "@/components/CursorEffect";
import { Mail, Linkedin, Github, Instagram, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const Contact = () => {
  const socialLinks = [
    { 
      icon: Github, 
      label: "GitHub", 
      href: "https://github.com/Rynzgamez", 
      color: "hover:text-foreground",
      description: "Check out my open-source projects and code"
    },
    { 
      icon: Instagram, 
      label: "Instagram", 
      href: "https://instagram.com/vihaan.harrison", 
      color: "hover:text-accent",
      description: "Follow my journey and behind-the-scenes updates"
    },
    { 
      icon: Mail, 
      label: "Email", 
      href: "mailto:vihaanharrison@gmail.com", 
      color: "hover:text-accent",
      description: "Direct line for opportunities and collaborations"
    },
  ];

  const contactReasons = [
    {
      icon: MessageCircle,
      title: "Collaboration",
      description: "Let's work together on innovative projects that create impact"
    },
    {
      icon: Send,
      title: "Opportunities",
      description: "Internships, speaking engagements, or mentorship opportunities"
    },
    {
      icon: Github,
      title: "Open Source",
      description: "Contribute to projects or discuss tech ideas and innovations"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CursorEffect />
      <Navigation />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center mb-20"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Let's <span className="text-accent">Connect</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Whether you're a recruiter, collaborator, or fellow innovator — I'd love to hear from you. 
              Let's build something amazing together.
            </p>
          </motion.div>

          {/* Contact Reasons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto mb-20"
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
              Why Reach Out?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {contactReasons.map((reason, index) => (
                <motion.div
                  key={reason.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-card p-6 rounded-xl shadow-elegant border border-border/50 hover:border-accent/50 transition-all text-center"
                >
                  <reason.icon className="w-12 h-12 text-accent mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-3 text-foreground">{reason.title}</h3>
                  <p className="text-muted-foreground">{reason.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Main CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow text-xl px-12 py-8 h-auto"
              onClick={() => window.location.href = "mailto:vihaanharrison@gmail.com"}
            >
              <Mail className="mr-3 text-accent-foreground" size={24} />
              Get In Touch
            </Button>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
              Find Me Online
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  className={`bg-card p-8 rounded-xl shadow-elegant border border-border/50 hover:border-accent/50 transition-all text-center group ${link.color}`}
                >
                  <link.icon className="w-16 h-16 mx-auto mb-4 text-foreground group-hover:text-accent transition-colors" />
                  <h3 className="text-xl font-bold mb-2 text-foreground">{link.label}</h3>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-20 pt-12 border-t border-border text-center"
          >
            <p className="text-muted-foreground text-lg">
              © 2025 Vihaan Harrison. Design to inspire, code to create, and act to impact.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
