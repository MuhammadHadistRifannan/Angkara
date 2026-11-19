import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToHashElement from "./components/ScrollToHashElement";
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
import AdminDashboard from "./pages/AdminDashboard";
import RouteDetail from "./pages/RouteDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToHashElement />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/operator-dashboard" element={<OperatorDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/tour-packages" element={<TourPackages />} />
          <Route path="/route/:id" element={<RouteDetail />} />
          <Route path="/tour-package/:id" element={<RouteDetail />} />
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
