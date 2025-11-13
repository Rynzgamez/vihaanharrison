import { motion } from "framer-motion";
import { Brain, Code, Camera, Leaf } from "lucide-react";

const About = () => {
  const interests = [
    {
      icon: Brain,
      title: "AI & Machine Learning",
      description: "Passionate about building intelligent systems that solve real problems",
    },
    {
      icon: Code,
      title: "Web Development",
      description: "Creating beautiful, functional experiences with modern technologies",
    },
    {
      icon: Camera,
      title: "Photography",
      description: "Capturing moments and stories through creative visual expression",
    },
    {
      icon: Leaf,
      title: "Environmental Action",
      description: "Building solutions for sustainability and climate awareness",
    },
  ];

  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            About <span className="text-accent">Me</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A student innovator based in Sharjah, UAE, driven by curiosity and a passion for
            creating meaningful impact through technology and creativity.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-card rounded-2xl p-8 md:p-12 shadow-elegant mb-12"
          >
            <p className="text-lg leading-relaxed text-foreground/80 mb-6">
              Currently a student at DPS Sharjah, I'm deeply passionate about AI, Python, and web
              development. My interests span across mathematics, physics, geography, and design —
              emphasizing both logical and creative strengths.
            </p>
            <p className="text-lg leading-relaxed text-foreground/80 mb-6">
              I'm motivated by my family, inspiring athletes, and changemakers who've shown me that
              dedication and innovation can truly make a difference. My approach combines technical
              excellence with empathy and creativity.
            </p>
            <div className="inline-block px-6 py-3 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-foreground font-semibold">
                "Design to inspire, code to create, and act to impact."
              </p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {interests.map((interest, index) => (
              <motion.div
                key={interest.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="bg-card rounded-xl p-6 shadow-elegant hover:shadow-glow transition-smooth"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <interest.icon className="text-accent" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">{interest.title}</h3>
                <p className="text-muted-foreground">{interest.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
