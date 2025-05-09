import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminServices from "@/pages/admin/services";
import AdminPortfolio from "@/pages/admin/portfolio";
import AdminAbout from "@/pages/admin/about";
import AdminTestimonials from "@/pages/admin/testimonials";
import AdminContacts from "@/pages/admin/contacts";
import AdminMap from "@/pages/admin/map";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { LanguageProvider } from "./hooks/use-language";
import { ThemeProvider } from "./hooks/use-theme";
import OnboardingWalkthrough from "@/components/OnboardingWalkthrough";

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/services" component={AdminServices} />
      <ProtectedRoute path="/admin/portfolio" component={AdminPortfolio} />
      <ProtectedRoute path="/admin/about" component={AdminAbout} />
      <ProtectedRoute path="/admin/testimonials" component={AdminTestimonials} />
      <ProtectedRoute path="/admin/contacts" component={AdminContacts} />
      <ProtectedRoute path="/admin/map" component={AdminMap} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const showOnboarding = location === "/";

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              {showOnboarding && <OnboardingWalkthrough />}
              <AppRoutes />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
