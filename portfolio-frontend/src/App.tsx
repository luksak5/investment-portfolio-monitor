
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import AdvisorDashboard from "./pages/AdvisorDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import AdminTransactions from "./pages/AdminTransactions";
import AdminReports from "./pages/AdminReports";
import AdminAdvisors from "./pages/AdminAdvisors";
import AdminSettings from "./pages/AdminSettings";
import AdminClients from "./pages/AdminClients";
import AdminSymbolMappings from "./pages/AdminSymbolMappings";
import AdvisorReports from "./pages/AdvisorReports";
import ClientReports from "./pages/ClientReports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/clients" element={<AdminClients />} />
          <Route path="/admin/advisors" element={<AdminAdvisors />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/symbol-mappings" element={<AdminSymbolMappings />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/advisor" element={<AdvisorDashboard />} />
          <Route path="/advisor/reports" element={<AdvisorReports />} />
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/client/reports" element={<ClientReports />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
