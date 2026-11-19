import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LiquidNav } from "@/components/landing/LiquidNav";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Booking from "./pages/Booking";
import Dashboard from "./pages/Dashboard";
import OperatorDashboard from "./pages/OperatorDashboard";
import TourPackages from "./pages/TourPackages";
import PermitInfo from "./pages/PermitInfo";
import BoatsListing from "./pages/BoatsListing";
import BoatDetail from "./pages/BoatDetail";

const queryClient = new QueryClient();

// NAVBAR SERAGAM (2026-11-19): satu navbar (LiquidNav, pill kaca yang
// sama dengan landing) untuk SEMUA halaman. Sebelumnya landing memakai
// LiquidNav via portal Hero, sementara 7 halaman lain memakai Navbar.tsx
// (bar atas gelap) dan /auth + /404 tidak punya navbar sama sekali.
// Di landing ("/") nav tetap dari portal Hero; di halaman lain SiteNav
// yang menampilkannya (tema terang, isInHero=false).
const SiteNav: React.FC = () => {
  const location = useLocation();
  if (location.pathname === "/") return null;
  return <LiquidNav show isReducedMotion={false} isInHero={false} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SiteNav />
        {/* Juru Mudi AI + popup login global: tombol "Juru Mudi" di navbar
            harus bekerja di semua halaman, bukan hanya di landing. Sebelumnya
            AssistantWidget hanya dipasang di Index dan Dashboard. */}
        <AssistantWidget />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/operator-dashboard" element={<OperatorDashboard />} />
          <Route path="/tour-packages" element={<TourPackages />} />
          <Route path="/permit-info" element={<PermitInfo />} />
          <Route path="/boats" element={<BoatsListing />} />
          <Route path="/boat/:id" element={<BoatDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
