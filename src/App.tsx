import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useInitializeAuth } from "@/hooks/useAdminAuth";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import AllProjects from "./pages/AllProjects";
import Timeline from "./pages/Timeline";
import Milestones from "./pages/Milestones";
import MyWork from "./pages/MyWork";
import CategoryProjects from "./pages/CategoryProjects";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  useInitializeAuth();
  
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/projects" element={<AllProjects />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/milestones" element={<Milestones />} />
        <Route path="/my-work" element={<MyWork />} />
        <Route path="/category/:categorySlug" element={<CategoryProjects />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
