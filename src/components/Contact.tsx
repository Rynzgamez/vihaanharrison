import { motion } from "framer-motion";
import { Mail, Linkedin, Github, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

const Contact = () => {
  const socialLinks = [
    { icon: Github, label: "GitHub", href: "https://github.com/Rynzgamez", color: "hover:text-foreground" },
    { icon: Instagram, label: "Instagram", href: "https://instagram.com/vihaan.harrison", color: "hover:text-accent" },
    { icon: Mail, label: "Email", href: "mailto:vihaanharrison@gmail.com", color: "hover:text-accent" },
  ];

  return (
    <section id="contact" className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Let's <span className="text-accent">Connect</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Whether you're a recruiter, collaborator, or fellow innovator — I'd love to hear from
            you. Let's build something amazing together.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-12"
          >
          <Button
            size="lg"
            className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow text-lg px-8 py-6"
            onClick={() => window.location.href = "mailto:vihaanharrison@gmail.com"}
          >
            <Mail className="mr-2 text-accent-foreground" size={20} />
            Get In Touch
          </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex justify-center gap-6"
          >
            {socialLinks.map((link, index) => (
              <motion.a
                key={link.label}
                href={link.href}
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className={`w-14 h-14 rounded-full bg-card shadow-elegant flex items-center justify-center text-foreground transition-smooth ${link.color}`}
                aria-label={link.label}
              >
                <link.icon size={24} />
              </motion.a>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-16 pt-8 border-t border-border"
          >
            <p className="text-muted-foreground">
              © 2025 Vihaan Harrison. Design to inspire, code to create, and act to impact.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
