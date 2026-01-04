import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useInitializeAuth } from "@/hooks/useAdminAuth";
import ScrollToTop from "@/components/ScrollToTop";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index";
import Work from "./pages/Work";
import Foundations from "./pages/Foundations";
import Timeline from "./pages/Timeline";
import AboutPage from "./pages/AboutPage";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
// Legacy routes for backwards compatibility
import AllProjects from "./pages/AllProjects";
import Milestones from "./pages/Milestones";
import MyWork from "./pages/MyWork";
import CategoryProjects from "./pages/CategoryProjects";

const queryClient = new QueryClient();

const AppContent = () => {
  useInitializeAuth();
  
  return (
    <>
      <ScrollToTop />
      <PageTransition>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          {/* New professional routes */}
          <Route path="/work" element={<Work />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/foundations" element={<Foundations />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/contact" element={<Contact />} />
          {/* Legacy routes for backwards compatibility */}
          <Route path="/projects" element={<AllProjects />} />
          <Route path="/milestones" element={<Milestones />} />
          <Route path="/my-work" element={<MyWork />} />
          <Route path="/category/:categorySlug" element={<CategoryProjects />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
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
