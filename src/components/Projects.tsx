import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Code, Leaf, Users, Trophy, Palette } from "lucide-react";

const categories = [
  {
    title: "Academic & Scholarly Achievements",
    icon: BookOpen,
    summary: "I've always strived for academic excellence, consistently ranking among the top of my grade and earning multiple national and international accolades in Olympiads, scholastic tests, and leadership roles.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Technology, Coding & Innovation",
    icon: Code,
    summary: "Technology has always been my passion. From AI systems to environmental apps, I've built solutions that merge creativity, purpose, and innovation — earning recognition at numerous coding and robotics competitions.",
    color: "from-cyan-500 to-teal-500"
  },
  {
    title: "Leadership, Volunteering & Environmental Action",
    icon: Leaf,
    summary: "Leadership, empathy, and sustainability define who I am. From volunteering for causes to organizing charity drives and serving as a national climate advocate, I've worked to create real-world impact.",
    color: "from-green-500 to-emerald-500"
  },
  {
    title: "Model United Nations (MUN) & Public Speaking",
    icon: Users,
    summary: "Public speaking and diplomacy have helped me grow into a confident and analytical communicator, earning multiple 'Best Delegate' titles across national-level MUNs.",
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Arts, Athletics & Personal Passions",
    icon: Palette,
    summary: "I balance academics with creativity and sports — expressing myself through dance, photography, and badminton while pursuing new interests with dedication and passion.",
    color: "from-orange-500 to-red-500"
  },
  {
    title: "Recognition & Awards",
    icon: Trophy,
    summary: "A collection of honors, certifications, and achievements that reflect my commitment to excellence across multiple domains.",
    color: "from-yellow-500 to-orange-500"
  }
];

const Projects = () => {
  return (
    <section id="projects" className="py-24 bg-background relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            My <span className="text-accent">Projects</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore my work across six key areas.{" "}
            <Link to="/projects" className="text-accent hover:underline">
              View all projects →
            </Link>
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {categories.map((category, index) => {
            const Icon = category.icon;
            const categorySlug = category.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return (
              <Link key={category.title} to={`/category/${categorySlug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="bg-card rounded-xl overflow-hidden shadow-elegant hover:shadow-glow transition-smooth group cursor-pointer"
                >
                  <div className={`h-2 bg-gradient-to-r ${category.color}`} />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-accent/10 rounded-lg">
                        <Icon className="w-6 h-6 text-accent" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-smooth text-foreground">
                      {category.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {category.summary}
                    </p>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Projects;
