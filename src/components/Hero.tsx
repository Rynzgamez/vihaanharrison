import { motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBackground from "@/assets/hero-bg-fluid.png";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const Hero = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Three.js Scene Setup
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      alpha: true,
      antialias: true 
    });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 5;

    // Create floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.005,
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Create rotating torus
    const torusGeometry = new THREE.TorusGeometry(1.5, 0.1, 16, 100);
    const torusMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    scene.add(torus);

    let mouseXVal = 0;
    let mouseYVal = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseXVal = (e.clientX / window.innerWidth) * 2 - 1;
      mouseYVal = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    const animate = () => {
      requestAnimationFrame(animate);

      // Smooth camera movement based on mouse
      camera.position.x += (mouseXVal * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (mouseYVal * 0.5 - camera.position.y) * 0.05;

      // Rotate particles
      particlesMesh.rotation.y += 0.0005;
      particlesMesh.rotation.x += 0.0003;

      // Rotate torus
      torus.rotation.x += 0.003;
      torus.rotation.y += 0.005;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      torusGeometry.dispose();
      torusMaterial.dispose();
    };
  }, []);

  const gradientX = useTransform(mouseX, [0, window.innerWidth], [0, 100]);
  const gradientY = useTransform(mouseY, [0, window.innerHeight], [0, 100]);

  // Mask opacity based on distance from cursor
  const maskOpacity = useTransform(
    [mouseX, mouseY],
    ([x, y]) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const distance = Math.sqrt(Math.pow((x as number) - centerX, 2) + Math.pow((y as number) - centerY, 2));
      const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
      return 0.05 + (1 - distance / maxDistance) * 0.4;
    }
  );

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Three.js Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ opacity: 0.4 }}
      />

      {/* Dynamic gradient blur with cursor-based masking */}
      <motion.div 
        className="absolute w-[1000px] h-[1000px] rounded-full blur-[200px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)',
          x: useTransform(gradientX, (v) => `${v - 50}%`),
          y: useTransform(gradientY, (v) => `${v - 50}%`),
          opacity: maskOpacity,
        }}
        animate={{
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Black overlay with cursor-based reveal */}
      <motion.div 
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: `radial-gradient(circle 600px at ${mouseX.get()}px ${mouseY.get()}px, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.95) 100%)`,
        }}
      />
      
      {/* Background Image with Dynamic Opacity */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{
          opacity: maskOpacity,
        }}
      >
        <img
          src={heroBackground}
          alt="Hero background"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 text-accent"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8 }}
          >
            Vihaan Harrison
          </motion.h1>

          <motion.h2
            className="text-2xl md:text-3xl text-foreground mb-4"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8 }}
          >
            I Design, Code, and Create Change
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-12"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8 }}
          >
            Student • AI & Machine Learning Developer • Photographer • Environmental
            Advocate
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8 }}
          >
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow text-lg"
              onClick={() =>
                document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              View My Work
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              onClick={() =>
                document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ArrowDown className="text-accent" size={32} />
      </motion.div>
    </section>
  );
};

export default Hero;
