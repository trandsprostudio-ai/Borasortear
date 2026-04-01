import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Wallet from "./pages/Wallet";
import MyParticipations from "./pages/MyParticipations";
import ConsultDraw from "./pages/ConsultDraw";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import Affiliates from "./pages/Affiliates";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import TermosDeUso from "./pages/TermosDeUso";
import Privacidade from "./pages/Privacidade";
import CentralDeAjuda from "./pages/CentralDeAjuda";
import AdminRoomsStatus from "./pages/AdminRoomsStatus";
import TestSandbox from "./pages/TestSandbox";
import FloatingNav from "./components/layout/FloatingNav";
import ScrollToTop from "./components/layout/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/my-participations" element={<MyParticipations />} />
          <Route path="/consult-draw" element={<ConsultDraw />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/support" element={<Support />} />
          <Route path="/affiliates" element={<Affiliates />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin-rooms-status" element={<AdminRoomsStatus />} />
          <Route path="/termos-de-uso" element={<TermosDeUso />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/central-de-ajuda" element={<CentralDeAjuda />} />
          <Route path="/test-sandbox" element={<TestSandbox />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <FloatingNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;