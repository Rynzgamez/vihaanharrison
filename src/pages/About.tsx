import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import CursorEffect from "@/components/CursorEffect";
import { Camera, Palette, Users, Leaf } from "lucide-react";
import profilePhoto from "@/assets/profile-photo.jpg";
import logo from "@/assets/logo.png";

const About = () => {
  const values = [
    {
      icon: Palette,
      title: "Design & Photography",
      description: "Crafting visual stories through UI design and photography, merging aesthetics with purpose to create meaningful experiences."
    },
    {
      icon: Camera,
      title: "Creative Expression",
      description: "Capturing moments and designing interfaces that inspire, blending technical skills with artistic vision."
    },
    {
      icon: Users,
      title: "Social Connections",
      description: "Building meaningful relationships through networking, debate, and community engagement—because people matter."
    },
    {
      icon: Leaf,
      title: "Environmental Sustainability",
      description: "Passionate about protecting our planet through sustainable practices, environmental advocacy, and conscious living."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <CursorEffect />
      <Navigation />
      
      {/* Animated background blobs */}
      <motion.div 
        className="absolute top-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute bottom-40 left-20 w-80 h-80 bg-accent/15 rounded-full blur-[100px] pointer-events-none"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/3 w-64 h-64 bg-accent/8 rounded-full blur-[90px] pointer-events-none"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
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
                {/* Logo */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="mb-8 flex justify-start"
                >
                  <img src={logo} alt="Vihaan Harrison Logo" className="h-24 w-auto" />
                </motion.div>

                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  Hi, I'm <span className="text-accent">Vihaan Harrison</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-6">
                  A 14-year-old designer, developer, and changemaker driven by a passion for creativity and social impact.
                </p>
                <p className="text-lg text-foreground/80 mb-4">
                  I'm currently a student at Delhi Private School Sharjah, where I balance academics with my passion for design, photography, and meaningful projects. From UI design to environmental advocacy, I'm constantly exploring how creativity and technology can solve real-world problems.
                </p>
                <p className="text-lg text-foreground/80">
                  My journey started with curiosity and has evolved into a mission: to create visual experiences that inspire innovation, empower communities, and drive positive change.
                </p>
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
                {/* Enhanced blur effects around image */}
                <motion.div 
                  className="absolute -bottom-8 -right-8 w-40 h-40 bg-accent/30 rounded-full blur-[80px]"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div 
                  className="absolute -top-8 -left-8 w-32 h-32 bg-accent/20 rounded-full blur-[60px]"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                />
                {/* Decorative icons */}
                <motion.div
                  className="absolute -top-4 -right-4 bg-accent/20 backdrop-blur-sm p-3 rounded-full border border-accent/30"
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Camera className="w-5 h-5 text-accent" />
                </motion.div>
                <motion.div
                  className="absolute bottom-4 -left-4 bg-accent/20 backdrop-blur-sm p-3 rounded-full border border-accent/30"
                  animate={{
                    y: [0, 10, 0],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                >
                  <Palette className="w-5 h-5 text-accent" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-24 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              My <span className="text-accent">Mission</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              To blend design, technology, and purpose—creating visual experiences and solutions that not only look beautiful but also inspire action, foster connections, and contribute to a more sustainable and equitable world.
            </p>
          </motion.div>

          {/* Core Values */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              What <span className="text-accent">Drives Me</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-card rounded-xl p-8 shadow-elegant hover:shadow-glow transition-smooth"
                >
                  <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <value.icon className="text-accent" size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Beyond the Code */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-card rounded-2xl p-8 md:p-12 shadow-elegant"
          >
            <h2 className="text-3xl font-bold mb-6 text-center">
              Beyond the <span className="text-accent">Screen</span>
            </h2>
            <div className="space-y-6 text-foreground/80">
              <p className="leading-relaxed">
                When I'm not designing interfaces or capturing moments through my lens, you'll find me engaged in debate—sharpening my critical thinking and communication skills while exploring diverse perspectives.
              </p>
              <p className="leading-relaxed">
                I'm academically proficient across subjects, constantly challenging myself to learn and grow. My love for the environment drives me to advocate for sustainability, whether through projects, initiatives, or everyday choices.
              </p>
              <p className="leading-relaxed">
                Most importantly, I cherish connections with people. Networking isn't just about building contacts—it's about building relationships, understanding stories, and creating communities where everyone can thrive together.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default About;
