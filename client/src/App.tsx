import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/components/i18n-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { TrialBanner } from "@/components/trial-banner";
import { AppFooter } from "@/components/app-footer";
import { ChatWidget } from "@/components/chat-widget";
import LandingPage from "@/pages/landing";
import DashboardPage from "@/pages/dashboard";
import FleetPage from "@/pages/fleet";
import FuelPage from "@/pages/fuel";
import CalculatorPage from "@/pages/calculator";
import ReportsPage from "@/pages/reports";
import SettingsPage from "@/pages/settings";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import SuccessPage from "@/pages/success";
import SubscriptionPage from "@/pages/subscription";
import TaxasPage from "@/pages/taxas";
import NotFound from "@/pages/not-found";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-2 p-2 border-b shadow-sm bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto flex flex-col">
            <div className="px-4 pt-4">
              <TrialBanner />
            </div>
            <div className="flex-1">
              {children}
            </div>
            <AppFooter />
          </main>
          <ChatWidget />
        </div>
      </div>
    </SidebarProvider>
  );
}

function AuthenticatedRouter() {
  return (
    <AuthenticatedLayout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/fleet" component={FleetPage} />
        <Route path="/fuel" component={FuelPage} />
        <Route path="/calculator" component={CalculatorPage} />
        <Route path="/reports" component={ReportsPage} />
        <Route path="/taxas" component={TaxasPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/success" component={SuccessPage} />
        <Route path="/subscription" component={SubscriptionPage} />
        <Route component={NotFound} />
      </Switch>
    </AuthenticatedLayout>
  );
}

function PublicTermsPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TermsPage />
      <div className="border-t py-4 mt-auto">
        <div className="max-w-4xl mx-auto px-6 text-center text-sm text-muted-foreground">
          <a href="/" className="text-primary hover:underline">&larr; Retour à l'accueil</a>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (location === "/terms" && !user) {
    return <PublicTermsPage />;
  }

  if (location === "/privacy" && !user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PrivacyPage />
        <div className="border-t py-4 mt-auto">
          <div className="max-w-4xl mx-auto px-6 text-center text-sm text-muted-foreground">
            <a href="/" className="text-primary hover:underline">&larr; Retour à l'accueil</a>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="space-y-4 w-64">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return <AuthenticatedRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <I18nProvider>
          <Toaster />
          <AppContent />
        </I18nProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
