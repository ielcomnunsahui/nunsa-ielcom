import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Results from "./pages/Results";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import AspirantLogin from "./pages/AspirantLogin";
import Vote from "./pages/SecureVote";
import VotersLogin from "./pages/VotersLogin";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import SetupAdmin from "./pages/SetupAdmin";
import SupportPage from "./pages/SupportPage";
import Rules from "./pages/Rules";
import AspirantDashboard from "./pages/AspirantDashboard";
import AspirantApplication from "./pages/AspirantApplication";
import PublicCandidatesView from "./pages/PublicCandidatesView";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* ---------------------------------------------------- */}
          {/* 1. PUBLIC ROUTES (Accessible to everyone) */}
          {/* ---------------------------------------------------- */}
          <Route path="/" element={<Index />} />
          <Route path="/results" element={<Results />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/aspirant-login" element={<AspirantLogin />} />
          <Route path="/voters-login" element={<VotersLogin />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/candidates" element={<PublicCandidatesView />} />
          <Route path="/setup-admin" element={<SetupAdmin />} />
          
          {/* ---------------------------------------------------- */}
          {/* 2. PROTECTED ROUTES (Requires Login) */}
          {/* ---------------------------------------------------- */}
          {/* Default protection for pages requiring any successful login */}
          <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Index />} /> {/* Or a generic dashboard */}
          </Route>
          
          {/* ---------------------------------------------------- */}
          {/* 3. ROLE-SPECIFIC ROUTES (Requires Login + Role Check) */}
          {/* ---------------------------------------------------- */}

          {/* VOTER-SPECIFIC ACCESS (e.g., Voting) */}
          {/* Only voters and admins can access the secure voting page */}
          <Route element={<ProtectedRoute allowedRoles={['voter', 'aspirant', 'admin']} />}>
          
          <Route path="/register" element={<Register />} />
              <Route path="/vote" element={<Vote />} />
          </Route>

          {/* ASPIRANT-SPECIFIC ACCESS (Aspirant Dashboard & Application) */}
          {/* Only aspirants and admins can access the aspirant tools */}
          <Route element={<ProtectedRoute allowedRoles={['aspirant', 'voter', 'admin']} />}>
              <Route path="/aspirant" element={<AspirantDashboard />} />
              <Route path="/aspirant/apply" element={<AspirantApplication />} />
          </Route>
          
          {/* ADMIN-SPECIFIC ACCESS */}
          {/* Only admins can access the admin dashboard */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<Admin />} />
          </Route>
          
          {/* CATCH-ALL ROUTE (MUST remain last) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;