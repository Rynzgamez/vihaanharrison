import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import CursorEffect from "@/components/CursorEffect";
import { Code, Lightbulb, Users, Target, Sparkles, Heart } from "lucide-react";
import profilePhoto from "@/assets/profile-photo.jpg";

const About = () => {
  const values = [
    {
      icon: Code,
      title: "Innovation Through Technology",
      description: "Leveraging cutting-edge technologies like AI, blockchain, and cloud computing to create solutions that make a real difference in people's lives."
    },
    {
      icon: Lightbulb,
      title: "Creative Problem Solving",
      description: "Approaching challenges with fresh perspectives, combining technical expertise with creative thinking to develop unique solutions."
    },
    {
      icon: Users,
      title: "Community Impact",
      description: "Building projects that serve communities, from educational platforms to health tech solutions that improve accessibility and equity."
    },
    {
      icon: Target,
      title: "Purpose-Driven Development",
      description: "Every project is crafted with intention—focusing on sustainability, social impact, and long-term value creation."
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
            className="max-w-6xl mx-auto mb-24"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  Hi, I'm <span className="text-accent">Vihaan Harrison</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-6">
                  A 16-year-old developer, innovator, and changemaker driven by a passion for technology and social impact.
                </p>
                <p className="text-lg text-foreground/80 mb-4">
                  I'm currently a student at GEMS Modern Academy, where I balance academics with my passion for building meaningful projects. From AI-powered educational platforms to blockchain-based solutions, I'm constantly exploring how technology can solve real-world problems.
                </p>
                <p className="text-lg text-foreground/80">
                  My journey in tech started with curiosity and has evolved into a mission: to create solutions that inspire innovation, empower communities, and drive positive change.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={profilePhoto}
                    alt="Vihaan Harrison"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
              </motion.div>
            </div>
          </motion.div>

          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center mb-24"
          >
            <div className="relative">
              <Sparkles className="absolute -top-8 -left-8 w-12 h-12 text-accent/30" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                My Mission
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                To design solutions that inspire creativity, code systems that create opportunity, 
                and take action that generates meaningful impact—bridging technology and humanity 
                to build a better tomorrow.
              </p>
              <Heart className="absolute -bottom-8 -right-8 w-12 h-12 text-accent/30" />
            </div>
          </motion.div>

          {/* Core Values */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
              What Drives Me
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="bg-card p-8 rounded-2xl shadow-elegant border border-border/50 hover:border-accent/50 transition-all"
                >
                  <value.icon className="w-12 h-12 text-accent mb-4" />
                  <h3 className="text-2xl font-bold mb-3 text-foreground">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Journey Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold mb-8 text-foreground">
              Beyond the Code
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              When I'm not coding, you'll find me exploring the intersection of technology and society, 
              reading about emerging innovations, or collaborating with fellow creators on projects that 
              push boundaries. I believe in continuous learning and staying curious about the world around us.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              I'm passionate about mentorship and community building, always looking for opportunities to 
              share knowledge, learn from others, and contribute to causes that align with my values of 
              innovation, accessibility, and positive social impact.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default About;
