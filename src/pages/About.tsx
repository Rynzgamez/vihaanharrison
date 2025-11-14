import { motion } from "framer-motion";
import Navigation from "@/components/Navigation";
import CursorEffect from "@/components/CursorEffect";
import { Camera, Palette, Users, Leaf } from "lucide-react";
import profilePhoto from "@/assets/profile-photo.jpg";

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
