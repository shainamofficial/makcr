import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import Interview from "./pages/Interview";
import Profile from "./pages/Profile";
import Resumes from "./pages/Resumes";
import NotFound from "./pages/NotFound";
import TemplatePreviewsAdmin from "./pages/TemplatePreviewsAdmin";
import { toast } from "@/hooks/use-toast";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (_error, query) => {
      const msg = (query.meta as any)?.errorMessage;
      if (msg) toast({ title: msg, variant: "destructive" });
    },
  }),
  mutationCache: new MutationCache({
    onError: (_error, _variables, _context, mutation) => {
      const msg = (mutation.meta as any)?.errorMessage;
      if (msg) toast({ title: msg, variant: "destructive" });
    },
  }),
});

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Navbar />
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/interview" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/resumes" element={<ProtectedRoute><Resumes /></ProtectedRoute>} />
                <Route path="/admin/template-previews" element={<TemplatePreviewsAdmin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
