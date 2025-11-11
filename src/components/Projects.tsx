import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

const Projects = () => {
  const projects = [
    {
      title: "GreenergyX",
      category: "Environmental Tech",
      description:
        "Environmental contribution tracker helping users monitor and reduce their carbon footprint. Certified project making real impact.",
      tags: ["AI", "Sustainability", "Web App"],
      impact: "700+ kg Recycled",
    },
    {
      title: "Disease Detection App",
      category: "Healthcare AI",
      description:
        "Machine learning application using mobile camera for early disease detection, making healthcare more accessible.",
      tags: ["ML", "Computer Vision", "Mobile"],
      impact: "Real-time Detection",
    },
    {
      title: "Fake News Detector",
      category: "AI Ethics",
      description:
        "On-device AI system for information integrity, helping users identify misinformation and verify sources.",
      tags: ["NLP", "AI", "Ethics"],
      impact: "Information Integrity",
    },
    {
      title: "Weather Forecast System",
      category: "Data Science",
      description:
        "Python-based weather prediction model using Pandas for data analysis and accurate forecasting.",
      tags: ["Python", "Pandas", "Data Science"],
      impact: "Accurate Predictions",
    },
    {
      title: "Forest Fire Predictor",
      category: "Climate Tech",
      description:
        "Satellite data-based AI mapping system for early forest fire detection and prevention.",
      tags: ["AI", "Satellite Data", "Climate"],
      impact: "Early Warning System",
    },
    {
      title: "Music Recommender",
      category: "Entertainment AI",
      description:
        "Variable-based AI recommendation system providing personalized music suggestions.",
      tags: ["AI", "Recommendation", "Music"],
      impact: "Personalized Experience",
    },
  ];

  return (
    <section id="projects" className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Featured <span className="bg-gradient-primary bg-clip-text text-transparent">Projects</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Innovative solutions combining AI, sustainability, and social impact
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="bg-card rounded-xl overflow-hidden shadow-elegant hover:shadow-glow transition-smooth group"
            >
              <div className="h-2 gradient-primary" />
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm text-primary font-semibold">{project.category}</span>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-smooth">
                      <Github size={18} />
                    </Button>
                    <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-smooth">
                      <ExternalLink size={18} />
                    </Button>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-muted text-xs rounded-full text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="pt-4 border-t border-border">
                  <span className="text-sm font-semibold text-accent">{project.impact}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
