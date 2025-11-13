import { motion } from "framer-motion";
import { Award, Trophy, Star, Target } from "lucide-react";

const Achievements = () => {
  const achievements = [
    {
      icon: Trophy,
      title: "International Awards",
      count: "10+",
      description: "Olympiad medals in Maths, Science, English, and General Knowledge",
    },
    {
      icon: Award,
      title: "Coding Competitions",
      count: "5+",
      description: "Wins in Code Quest, Technophiles, and Innovatique competitions",
    },
    {
      icon: Star,
      title: "Academic Excellence",
      count: "95%",
      description: "Consistent high performance with 95% aggregate score",
    },
    {
      icon: Target,
      title: "Environmental Impact",
      count: "700+ kg",
      description: "Waste recycled through GreenergyX and environmental initiatives",
    },
  ];

  const highlights = [
    "International Star Kids Award 2025",
    "Best Delegate & Researcher at Multiple MUNs",
    "Climate Action Certification for GreenergyX",
    "1st Place in Game Coding at GEMS Modern Academy",
    "RunBlue UAE Captain - 75+ km organized",
    "STEM Project Excellence in Ionic Propulsion",
  ];

  return (
    <section id="achievements" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            <span className="text-accent">Recognition</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Celebrating milestones in academics, leadership, and social impact
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 max-w-7xl mx-auto">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-card rounded-xl p-6 text-center shadow-elegant hover:shadow-glow transition-smooth"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <achievement.icon className="text-foreground" size={28} />
              </div>
              <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                {achievement.count}
              </div>
              <h3 className="text-lg font-bold mb-2">{achievement.title}</h3>
              <p className="text-sm text-muted-foreground">{achievement.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-card rounded-2xl p-8 md:p-12 shadow-elegant"
        >
          <h3 className="text-2xl font-bold mb-6 text-center">Key Highlights</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {highlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
                className="flex items-start gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-foreground/80">{highlight}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Achievements;
