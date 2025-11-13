import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Milestones", href: "/milestones" },
    { label: "Timeline", href: "/timeline" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-smooth ${
        scrolled
          ? "bg-background/80 backdrop-blur-lg shadow-elegant"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.a
            href="/"
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <img src={logo} alt="Vihaan Harrison" className="h-10 w-auto" />
          </motion.a>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.href)}
                className="text-foreground hover:text-accent transition-smooth"
              >
                {item.label}
              </button>
            ))}
          </div>

          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow"
            onClick={() => navigate("/contact")}
          >
            Let's Connect
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;
