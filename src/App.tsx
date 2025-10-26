import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Results from "./pages/Results";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Vote from "./pages/Vote";
import VotersLogin from "./pages/VotersLogin";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import SetupAdmin from "./pages/SetupAdmin";
import Rules from "./pages/Rules";
import AspirantDashboard from "./pages/AspirantDashboard";
import AspirantApplication from "./pages/AspirantApplication";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/results" element={<Results />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/voters-login" element={<VotersLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/setup-admin" element={<SetupAdmin />} />
          <Route path="/Rules" element={<Rules />} />
          {/* ASPIRANT ROUTES */}
          <Route path="/aspirant" element={<AspirantDashboard />} />
          <Route path="/aspirant/apply" element={<AspirantApplication />} />
          {/* CATCH-ALL ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;