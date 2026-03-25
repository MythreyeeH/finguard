import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import SimulatorPage from "@/pages/SimulatorPage";
import ObligationsPage from "@/pages/ObligationsPage";
import NegotiationPage from "@/pages/NegotiationPage";
import SettingsPage from "@/pages/SettingsPage";
import DataIngestionPage from "@/pages/DataIngestionPage";
import ActionsPage from "@/pages/ActionsPage";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/AuthPage";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Redirect } from "wouter";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    }
  }
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-t-2 border-emerald-500 animate-spin" />
      </div>
    );
  }
  if (!user) return <Redirect to="/auth" />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/"><ProtectedRoute><Dashboard /></ProtectedRoute></Route>
      <Route path="/simulator"><ProtectedRoute><SimulatorPage /></ProtectedRoute></Route>
      <Route path="/obligations"><ProtectedRoute><ObligationsPage /></ProtectedRoute></Route>
      <Route path="/negotiation"><ProtectedRoute><NegotiationPage /></ProtectedRoute></Route>
      <Route path="/ingestion"><ProtectedRoute><DataIngestionPage /></ProtectedRoute></Route>
      <Route path="/actions"><ProtectedRoute><ActionsPage /></ProtectedRoute></Route>
      <Route path="/settings"><ProtectedRoute><SettingsPage /></ProtectedRoute></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
