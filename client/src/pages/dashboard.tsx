import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Truck,
  Fuel,
  FileText,
  TrendingUp,
  Plus,
  Calculator,
  CheckCircle,
  Download,
  Receipt,
  BarChart3,
  Camera,
  FileSpreadsheet,
  TreePine,
  HardHat,
  Info,
  Clock,
  Leaf,
  Building2,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileDown,
  Compass,
  ChevronRight,
  ListChecks,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Banner2026 } from "@/components/banner-2026";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Machine, FuelEntry, Report, Invoice, AgriculturalSurface, ConstructionSite } from "@shared/schema";
import { calculateReimbursement } from "@shared/schema";
import { useSector } from "@/lib/sector-context";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardStats {
  totalMachines: number;
  totalFuelEntries: number;
  totalVolume: number;
  eligibleVolume: number;
  estimatedReimbursement: number;
  pendingReports: number;
}

interface FuelTrend {
  month: string;
  volume: number;
  reimbursement: number;
}

export default function DashboardPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { toast } = useToast();
  const { sector } = useSector();
  const [location, setLocation] = useLocation();

  // Taux uniforme pour tous les secteurs
  const isAgri = sector === "agriculture";
  const displayedRate = 0.3405;

  // Journal de Préparation states
  const [journalConfirmed, setJournalConfirmed] = useState(false);
  const [journalYear, setJournalYear] = useState(new Date().getFullYear());
  const [journalLoading, setJournalLoading] = useState(false);
  const sectorTitle = isAgri ? "Secteur Agricole" : "Secteur BTP/Industrie";
  const SectorIcon = isAgri ? TreePine : HardHat;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (sessionId) {
      fetch(`/api/checkout/success?session_id=${sessionId}`, { credentials: "include" })
        .then(res => {
          if (!res.ok) throw new Error("Verification failed");
          return res.json();
        })
        .then(data => {
          if (data.success && data.status === "paid") {
            toast({
              title: t.subscription.congratulations,
              description: t.subscription.subscriptionActiveMessage,
              duration: 10000,
            });
            queryClient.invalidateQueries({ queryKey: ["/api/subscription"] });
          }
        })
        .catch((err) => {
          console.error("Payment verification error:", err);
          toast({
            title: t.common.error,
            description: "Erreur de vérification du paiement",
            variant: "destructive",
          });
        })
        .finally(() => {
          window.history.replaceState({}, "", "/dashboard");
        });
    }
  }, []);

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentEntries, isLoading: entriesLoading } = useQuery<(FuelEntry & { machine: Machine })[]>({
    queryKey: ["/api/fuel-entries", { limit: 5 }],
  });

  const { data: subscription } = useQuery<{
    status: string;
    trialDaysRemaining: number;
  }>({
    queryKey: ["/api/subscription"],
  });

  const { data: invoices } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
    enabled: subscription?.status === "active",
  });

  const { data: trends, isLoading: trendsLoading } = useQuery<FuelTrend[]>({
    queryKey: ["/api/dashboard/trends"],
  });

  // Surfaces agricoles (secteur Agriculture uniquement)
  const { data: agriculturalSurfaces } = useQuery<AgriculturalSurface[]>({
    queryKey: ["/api/agricultural-surfaces"],
    enabled: isAgri,
  });

  // Chantiers BTP (secteur BTP uniquement)
  const isBtp = !isAgri;
  const { data: constructionSites } = useQuery<ConstructionSite[]>({
    queryKey: ["/api/construction-sites"],
    enabled: isBtp,
  });

  // Calculs surfaces agricoles (UX uniquement, aucun calcul financier)
  const totalHectares = agriculturalSurfaces?.reduce((sum, s) => sum + s.totalHectares, 0) || 0;
  const cultureTypesCount = new Set(agriculturalSurfaces?.map(s => s.cultureType).filter(Boolean)).size;

  // Calculs BTP (traçabilité uniquement, aucun calcul financier)
  const activeConstructionSites = constructionSites?.filter(s => s.status === 'active').length || 0;

  // Score de conformité BTP (traçabilité uniquement - AUCUN CHF)
  interface BtpComplianceScore {
    score: number;
    level: 'conforme' | 'a_corriger' | 'non_conforme';
    breakdown: {
      machineAssignment: { score: number; max: number; details: string };
      fuelTraceability: { score: number; max: number; details: string };
      periodCoherence: { score: number; max: number; details: string };
      dataCompleteness: { score: number; max: number; details: string };
    };
    alerts: { type: 'info' | 'warning' | 'error'; message: string; action?: string }[];
    summary: {
      totalMachines: number;
      assignedMachines: number;
      totalFuelEntries: number;
      trackedFuelEntries: number;
      activeSites: number;
    };
  }

  const { data: complianceScore, isLoading: complianceLoading } = useQuery<BtpComplianceScore>({
    queryKey: ["/api/btp/compliance-score"],
    enabled: isBtp,
  });

  // Score de cohérence Agriculture (données déclaratives uniquement - AUCUN calcul financier)
  // Conforme Art. 18 LMin : outil de vérification interne uniquement
  interface AgricultureCoherenceScore {
    score: number;
    level: 'bon' | 'a_completer' | 'incomplet';
    breakdown: {
      surfaces: { score: number; max: number; details: string };
      cultures: { score: number; max: number; details: string };
      machines: { score: number; max: number; details: string };
      completeness: { score: number; max: number; details: string };
    };
    alerts: { type: 'info' | 'warning'; message: string; action?: string }[];
    summary: {
      totalSurfaces: number;
      totalHectares: number;
      cultureTypes: number;
      totalMachines: number;
    };
  }

  const { data: agriCoherenceScore, isLoading: agriCoherenceLoading } = useQuery<AgricultureCoherenceScore>({
    queryKey: ["/api/agriculture/coherence-score"],
    enabled: isAgri,
  });

  // Progression du Parcours de Préparation (pédagogique - aucun calcul)
  interface PreparationProgress {
    sector: 'agriculture' | 'btp';
    overallProgress: number;
    stepsCompleted: number;
    stepsTotal: number;
    isJournalReady: boolean;
    steps: {
      agriculture?: {
        surface: { completed: boolean; count: number; message: string; link: string };
        cultures: { completed: boolean; count: number; total: number; message: string; link: string };
        fiscalYear: { completed: boolean; year: number | null; message: string; link: string };
        machines: { completed: boolean; count: number; message: string; link: string; optional: boolean };
      };
      btp?: {
        sites: { completed: boolean; count: number; message: string; link: string };
        machines: { completed: boolean; count: number; message: string; link: string };
        assignments: { completed: boolean; count: number; message: string; link: string };
        fuelEntries: { completed: boolean; count: number; message: string; link: string };
      };
    };
    completionMessage: string;
  }

  const { data: preparationProgress, isLoading: progressLoading } = useQuery<PreparationProgress>({
    queryKey: ["/api/preparation/progress"],
  });

  const downloadInvoice = (invoiceId: string) => {
    window.open(`/api/invoices/${invoiceId}/pdf`, "_blank");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("de-CH").format(num);
  };

  // === Cartes BTP (traçabilité uniquement - AUCUN CHF) ===
  const summaryCardsBTP = [
    {
      title: "Chantiers actifs",
      value: activeConstructionSites,
      icon: Building2,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Machines BTP",
      value: stats?.totalMachines ?? "-",
      icon: Truck,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Volume total (L)",
      value: stats ? `${formatNumber(stats.totalVolume)} L` : "-",
      icon: Fuel,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Entrées carburant",
      value: stats?.totalFuelEntries ?? "-",
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  // === Cartes Agriculture (conformité uniquement, AUCUN calcul CHF/litres) ===
  const summaryCardsAgriculture = [
    {
      title: "Machines agricoles",
      value: stats?.totalMachines ?? "-",
      icon: TreePine,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Score de conformité",
      // Score indicatif basé sur complétude des données
      value: stats?.totalMachines && stats.totalMachines > 0 ? "En cours" : "À compléter",
      icon: CheckCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Surfaces déclarées",
      value: `${totalHectares.toFixed(1)} ha`,
      icon: BarChart3,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Types de cultures",
      value: cultureTypesCount,
      icon: TreePine,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ];

  // Sélection des cartes selon le secteur
  const summaryCards = isAgri ? summaryCardsAgriculture : summaryCardsBTP;

  // Téléchargement du Journal de Préparation
  const handleDownloadJournal = async () => {
    if (!journalConfirmed) {
      toast({
        title: "Confirmation requise",
        description: t.dashboard.preparationJournalConfirm,
        variant: "destructive",
      });
      return;
    }

    setJournalLoading(true);
    try {
      const response = await fetch(`/api/preparation-journal/${journalYear}/pdf`, {
        credentials: "include",
      });

      if (!response.ok) {
        // Gestion par code erreur explicite
        const errorData = await response.json().catch(() => ({}));
        const errorCode = errorData.code || "UNKNOWN_ERROR";

        // Debug log (temporaire)
        console.error("[Journal PDF]", errorCode, errorData.message);

        // Messages utilisateur par code erreur
        const errorMessages: Record<string, { title: string; description: string }> = {
          NO_DATA_FOR_YEAR: {
            title: "Aucune donnée",
            description: "Aucune donnée pour cette année. Complétez vos informations.",
          },
          USER_NOT_VALIDATED: {
            title: "Confirmation requise",
            description: "Veuillez cocher la confirmation avant téléchargement.",
          },
          JOURNAL_NOT_READY: {
            title: "Dossier incomplet",
            description: "Terminez le parcours de préparation pour générer le journal.",
          },
          PDF_GENERATION_FAILED: {
            title: "Erreur technique",
            description: "Erreur technique temporaire. Réessayez ou contactez le support.",
          },
          INVALID_YEAR: {
            title: "Année invalide",
            description: "L'année fiscale sélectionnée n'est pas valide.",
          },
        };

        const errorInfo = errorMessages[errorCode] || {
          title: "Erreur",
          description: errorData.message || "Impossible de télécharger le journal.",
        };

        toast({
          title: errorInfo.title,
          description: errorInfo.description,
          variant: "destructive",
        });
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `journal-preparation-${journalYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Journal téléchargé",
        description: `Journal de Préparation ${journalYear} téléchargé avec succès.`,
      });
    } catch (error) {
      console.error("[Journal PDF] Network error:", error);
      toast({
        title: "Erreur réseau",
        description: "Impossible de contacter le serveur. Vérifiez votre connexion.",
        variant: "destructive",
      });
    } finally {
      setJournalLoading(false);
    }
  };

  const quickActions = [
    {
      title: t.dashboard.addMachine,
      href: "/fleet?action=add",
      icon: Truck,
    },
    // Scanner ticket - uniquement secteur BTP (OCR désactivé pour Agriculture)
    ...(sector !== 'agriculture' ? [{
      title: t.dashboard.scanTicket || "Scanner un ticket",
      href: "/fuel?action=scan",
      icon: Camera,
    }] : []),
    {
      title: t.dashboard.exportTaxasCsv || "Exporter CSV Taxas",
      href: "/reports?action=export",
      icon: FileSpreadsheet,
    },
  ];

  return (
    <>
      <Banner2026 />
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <SectorIcon className={`h-6 w-6 ${isAgri ? "text-green-600" : "text-blue-600"}`} />
              <h2 className={`text-xl font-bold tracking-tight ${isAgri ? "text-green-600" : "text-blue-600"}`}>
                {sectorTitle}
              </h2>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold mt-1" data-testid="text-dashboard-title">
              {t.dashboard.welcome}, {user?.firstName || "User"}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">{t.dashboard.summary}</p>
          </div>
        </div>

        {subscription?.status === "active" && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800" data-testid="alert-subscription-active">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200 flex items-center justify-between flex-wrap gap-2">
              <span>
                <span className="font-semibold">{t.subscription.congratulations}</span>{" "}
                {t.subscription.subscriptionActiveMessage}
              </span>
              {invoices && invoices.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white dark:bg-green-900 border-green-300 dark:border-green-700"
                  onClick={() => downloadInvoice(invoices[0].id)}
                  data-testid="button-download-invoice"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t.common.downloadInvoice || "Télécharger ma facture"}
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Badge secteur Agriculture */}
        {isAgri && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-medium border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
            <TreePine className="h-4 w-4" />
            <span>Agriculture – régime forfaitaire (Art. 18 LMin)</span>
          </div>
        )}

        {/* Disclaimer secteur agricole - Outil de vérification */}
        {isAgri && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800 border-l-4 border-l-green-500">
            <Leaf className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-800 dark:text-green-300">Outil de vérification</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-400">
              Ce tableau de bord affiche des <strong>indicateurs de cohérence</strong> uniquement.
              Le remboursement agricole est calculé par l'OFDF sur la base des <strong>forfaits liés aux surfaces</strong> (Art. 18 LMin),
              pas sur la consommation de carburant. Ce dashboard ne calcule et n'affiche aucun montant.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card, index) => (
            <Card key={index} className={isAgri ? "border-l-4 border-l-green-500" : ""}>
              <CardContent className="p-6">
                {statsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{card.title}</p>
                      <p className="text-2xl font-bold font-mono" data-testid={`text-stat-${index}`}>
                        {card.value}
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                      <card.icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Graphique tendances - uniquement secteur Agriculture (le BTP n'a pas de remboursement) */}
        {isAgri && trends && trends.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">
                  {t.dashboard.consumptionTrends || "Évolution des consommations"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {trendsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="h-64" data-testid="chart-fuel-trends">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trends.map((t) => ({
                        ...t,
                        monthLabel: new Date(t.month + "-01").toLocaleDateString("fr-CH", {
                          month: "short",
                          year: "2-digit",
                        }),
                      }))}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="monthLabel"
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                        tickFormatter={(v) => `${v} L`}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                        tickFormatter={(v) => `${v} CHF`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number, name: string) => [
                          name === "volume"
                            ? `${formatNumber(value)} L`
                            : formatCurrency(value),
                          name === "volume" ? "Volume" : "Remboursement",
                        ]}
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="volume"
                        stroke="hsl(var(--chart-2))"
                        fill="hsl(var(--chart-2))"
                        fillOpacity={0.3}
                        name="volume"
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey="reimbursement"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.2}
                        name="reimbursement"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-chart-2" />
                  <span className="text-muted-foreground">Volume (L)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-muted-foreground">Remboursement (CHF)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contenu principal selon secteur */}
        {isAgri ? (
          /* === Secteur Agriculture : Score de cohérence (données déclaratives) === */
          <div className="space-y-6">
            {/* Bandeau disclaimer Art. 18 LMin - Visible sans interaction */}
            <Card className="border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-green-100 dark:bg-green-900/50 shrink-0">
                    <Info className="h-6 w-6 text-green-700 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-300 text-sm">
                      {t.dashboard.disclaimerAgriTitle}
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1 leading-relaxed">
                      {t.dashboard.disclaimerAgriText}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Score de cohérence Agriculture */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">Score de cohérence</CardTitle>
                  </div>
                  {agriCoherenceScore && (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${agriCoherenceScore.level === 'bon'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : agriCoherenceScore.level === 'a_completer'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                      {agriCoherenceScore.level === 'bon' ? '🟢 Bon'
                        : agriCoherenceScore.level === 'a_completer' ? '🟠 À compléter'
                          : '🔴 Incomplet'}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  {agriCoherenceLoading ? (
                    <Skeleton className="h-32 w-full" />
                  ) : agriCoherenceScore ? (
                    <div className="space-y-4">
                      {/* Score principal */}
                      <div className="flex items-center gap-4">
                        <div className={`text-4xl font-bold ${agriCoherenceScore.level === 'bon' ? 'text-green-600'
                          : agriCoherenceScore.level === 'a_completer' ? 'text-amber-600'
                            : 'text-red-600'
                          }`}>
                          {agriCoherenceScore.score}/100
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Surfaces</span>
                            <span>{agriCoherenceScore.breakdown.surfaces.score}/{agriCoherenceScore.breakdown.surfaces.max}</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${(agriCoherenceScore.breakdown.surfaces.score / agriCoherenceScore.breakdown.surfaces.max) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Types de cultures</span>
                            <span>{agriCoherenceScore.breakdown.cultures.score}/{agriCoherenceScore.breakdown.cultures.max}</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full"
                              style={{ width: `${(agriCoherenceScore.breakdown.cultures.score / agriCoherenceScore.breakdown.cultures.max) * 100}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Machines</span>
                            <span>{agriCoherenceScore.breakdown.machines.score}/{agriCoherenceScore.breakdown.machines.max}</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${(agriCoherenceScore.breakdown.machines.score / agriCoherenceScore.breakdown.machines.max) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Alertes */}
                      {agriCoherenceScore.alerts.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Actions recommandées
                          </p>
                          <div className="space-y-1">
                            {agriCoherenceScore.alerts.slice(0, 3).map((alert, idx) => (
                              <div key={idx} className={`text-xs p-2 rounded flex items-start gap-2 ${alert.type === 'warning'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                                : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                }`}>
                                {alert.type === 'warning' ? <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  : <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />}
                                <div>
                                  <span>{alert.message}</span>
                                  {alert.action && (
                                    <span className="block mt-0.5 font-medium">→ {alert.action}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Résumé */}
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="p-2 bg-muted/50 rounded">
                          <div className="font-bold text-lg">{agriCoherenceScore.summary.totalSurfaces}</div>
                          <div className="text-muted-foreground">Surfaces</div>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <div className="font-bold text-lg">{agriCoherenceScore.summary.totalHectares.toFixed(1)}</div>
                          <div className="text-muted-foreground">Hectares</div>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <div className="font-bold text-lg">{agriCoherenceScore.summary.cultureTypes}</div>
                          <div className="text-muted-foreground">Cultures</div>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <div className="font-bold text-lg">{agriCoherenceScore.summary.totalMachines}</div>
                          <div className="text-muted-foreground">Machines</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-3 opacity-50 text-green-600" />
                      <p>Aucune donnée agricole</p>
                      <Button variant="ghost" asChild className="mt-2">
                        <Link href="/agricultural-surfaces">Ajouter des surfaces</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions et aide Agriculture */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t.dashboard.quickActions}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start gap-3"
                      asChild
                      data-testid={`button-quick-action-${index}`}
                    >
                      <Link href={action.href}>
                        <action.icon className="h-4 w-4" />
                        {action.title}
                      </Link>
                    </Button>
                  ))}
                </CardContent>

                {/* Disclaimer Art. 18 LMin */}
                <CardContent className="pt-0">
                  <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                          <Info className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-green-800 dark:text-green-300">Art. 18 LMin</p>
                          <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                            Ce score est un outil de vérification interne.<br />
                            Il ne constitue pas un calcul de droit au remboursement.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* === Secteur BTP : Traçabilité uniquement - AUCUN CHF === */
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Score de conformité BTP */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Score de conformité BTP</CardTitle>
                </div>
                {complianceScore && (
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${complianceScore.level === 'conforme'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : complianceScore.level === 'a_corriger'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                    {complianceScore.level === 'conforme' ? '🟢 Conforme'
                      : complianceScore.level === 'a_corriger' ? '🟠 À corriger'
                        : '🔴 Non conforme'}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {complianceLoading ? (
                  <Skeleton className="h-32 w-full" />
                ) : complianceScore ? (
                  <div className="space-y-4">
                    {/* Score principal */}
                    <div className="flex items-center gap-4">
                      <div className={`text-4xl font-bold ${complianceScore.level === 'conforme' ? 'text-green-600'
                        : complianceScore.level === 'a_corriger' ? 'text-amber-600'
                          : 'text-red-600'
                        }`}>
                        {complianceScore.score}/100
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Affectations</span>
                          <span>{complianceScore.breakdown.machineAssignment.score}/{complianceScore.breakdown.machineAssignment.max}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(complianceScore.breakdown.machineAssignment.score / complianceScore.breakdown.machineAssignment.max) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Traçabilité carburant</span>
                          <span>{complianceScore.breakdown.fuelTraceability.score}/{complianceScore.breakdown.fuelTraceability.max}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(complianceScore.breakdown.fuelTraceability.score / complianceScore.breakdown.fuelTraceability.max) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Cohérence périodes</span>
                          <span>{complianceScore.breakdown.periodCoherence.score}/{complianceScore.breakdown.periodCoherence.max}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${(complianceScore.breakdown.periodCoherence.score / complianceScore.breakdown.periodCoherence.max) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Alertes */}
                    {complianceScore.alerts.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          Actions recommandées
                        </p>
                        <div className="space-y-1">
                          {complianceScore.alerts.slice(0, 3).map((alert, idx) => (
                            <div key={idx} className={`text-xs p-2 rounded flex items-start gap-2 ${alert.type === 'error'
                              ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                              : alert.type === 'warning'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                                : 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                              }`}>
                              {alert.type === 'error' ? <XCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                : alert.type === 'warning' ? <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  : <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />}
                              <div>
                                <span>{alert.message}</span>
                                {alert.action && (
                                  <span className="block mt-0.5 font-medium">→ {alert.action}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Résumé */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-bold text-lg">{complianceScore.summary.activeSites}</div>
                        <div className="text-muted-foreground">Chantiers actifs</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-bold text-lg">{complianceScore.summary.assignedMachines}/{complianceScore.summary.totalMachines}</div>
                        <div className="text-muted-foreground">Machines affectées</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-bold text-lg">{complianceScore.summary.trackedFuelEntries}/{complianceScore.summary.totalFuelEntries}</div>
                        <div className="text-muted-foreground">Entrées tracées</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Aucune donnée BTP</p>
                    <Button variant="ghost" asChild className="mt-2">
                      <Link href="/construction-sites">Créer un chantier</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t.dashboard.quickActions}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start gap-3"
                    asChild
                    data-testid={`button-quick-action-${index}`}
                  >
                    <Link href={action.href}>
                      <action.icon className="h-4 w-4" />
                      {action.title}
                    </Link>
                  </Button>
                ))}
              </CardContent>

              <CardContent className="pt-0">
                <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-blue-800 dark:text-blue-300">Disclaimer OFDF</p>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                          MineralTax structure la traçabilité requise par l'OFDF.<br />
                          La décision finale appartient à l'OFDF.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        )}


        {/* === Parcours de Préparation (Carte compacte + Drawer) === */}
        <Sheet>
          <SheetTrigger asChild>
            <Card className="mt-6 border-teal-200 dark:border-teal-800 cursor-pointer hover:shadow-lg transition-shadow group">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${preparationProgress?.isJournalReady
                    ? 'bg-green-100 dark:bg-green-950/50'
                    : 'bg-teal-100 dark:bg-teal-950/50'
                    }`}>
                    <ListChecks className={`h-6 w-6 ${preparationProgress?.isJournalReady
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-teal-600 dark:text-teal-400'
                      }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{t.dashboard.guidedTourTitle}</h3>
                    <p className="text-sm text-muted-foreground">
                      {preparationProgress?.isJournalReady
                        ? "✅ Dossier prêt"
                        : `${preparationProgress?.stepsCompleted || 0}/${preparationProgress?.stepsTotal || 4} étapes complétées`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Mini barre de progression */}
                  {preparationProgress && (
                    <div className="hidden sm:block w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${preparationProgress.isJournalReady
                          ? 'bg-green-500'
                          : preparationProgress.overallProgress >= 50
                            ? 'bg-teal-500'
                            : 'bg-amber-500'
                          }`}
                        style={{ width: `${preparationProgress.overallProgress}%` }}
                      />
                    </div>
                  )}
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </SheetTrigger>

          <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader className="pb-4 border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-teal-100 dark:bg-teal-950/50">
                  <Compass className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <SheetTitle>{t.dashboard.guidedTourTitle}</SheetTitle>
                  <SheetDescription>{t.dashboard.guidedTourDesc}</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="py-6 space-y-6">
              {/* Barre de progression */}
              {preparationProgress && (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{t.dashboard.guidedTourProgress}</span>
                    <span className={preparationProgress.isJournalReady ? 'text-green-600' : 'text-muted-foreground'}>
                      {preparationProgress.stepsCompleted}/{preparationProgress.stepsTotal}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${preparationProgress.isJournalReady
                        ? 'bg-green-500'
                        : preparationProgress.overallProgress >= 50
                          ? 'bg-teal-500'
                          : 'bg-amber-500'
                        }`}
                      style={{ width: `${preparationProgress.overallProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Étape suivante recommandée */}
              {preparationProgress && !preparationProgress.isJournalReady && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    📌 Étape suivante recommandée
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                    {preparationProgress.steps?.agriculture
                      ? Object.values(preparationProgress.steps.agriculture).find(s => !s.completed && !('optional' in s && s.optional))?.message
                      || Object.values(preparationProgress.steps.agriculture).find(s => !s.completed)?.message
                      : preparationProgress.steps?.btp
                        ? Object.values(preparationProgress.steps.btp).find(s => !s.completed)?.message
                        : "Complétez les étapes ci-dessous"}
                  </p>
                </div>
              )}

              {/* Checklist détaillée */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  {isAgri ? "🌾 Liste Agriculture" : "🏗️ Liste BTP"}
                </h4>

                {progressLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                ) : preparationProgress?.steps?.agriculture ? (
                  // === Checklist Agriculture ===
                  <div className="space-y-2">
                    {Object.entries(preparationProgress.steps.agriculture).map(([key, step]) => (
                      <Link key={key} href={step.link}>
                        <div className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${step.completed
                          ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                          : 'optional' in step && step.optional
                            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                            : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 ring-2 ring-red-200 dark:ring-red-800'
                          }`}>
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${step.completed
                            ? 'bg-green-500 text-white'
                            : 'optional' in step && step.optional
                              ? 'bg-amber-500 text-white'
                              : 'bg-red-500 text-white'
                            }`}>
                            {step.completed ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : 'optional' in step && step.optional ? (
                              <AlertTriangle className="h-5 w-5" />
                            ) : (
                              <XCircle className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${step.completed ? 'text-green-800 dark:text-green-300' : 'text-gray-800 dark:text-gray-300'
                              }`}>
                              {step.message}
                            </p>
                            {'optional' in step && step.optional && !step.completed && (
                              <span className="text-xs text-amber-600 dark:text-amber-400">{t.dashboard.guidedTourStepOptional}</span>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : preparationProgress?.steps?.btp ? (
                  // === Checklist BTP ===
                  <div className="space-y-2">
                    {Object.entries(preparationProgress.steps.btp).map(([key, step]) => (
                      <Link key={key} href={step.link}>
                        <div className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${step.completed
                          ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                          : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 ring-2 ring-red-200 dark:ring-red-800'
                          }`}>
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                            }`}>
                            {step.completed ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <XCircle className="h-5 w-5" />
                            )}
                          </div>
                          <p className={`text-sm font-medium flex-1 ${step.completed ? 'text-green-800 dark:text-green-300' : 'text-gray-800 dark:text-gray-300'
                            }`}>
                            {step.message}
                          </p>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  // === Checklist de Fallback (toujours visible) ===
                  <div className="space-y-2">
                    {isAgri ? (
                      // Fallback Agriculture
                      <>
                        <Link href="/agricultural-surfaces">
                          <div className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 ring-2 ring-red-200 dark:ring-red-800">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-red-500 text-white">
                              <XCircle className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-medium flex-1 text-gray-800 dark:text-gray-300">
                              Ajoutez au moins une surface agricole
                            </p>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Link>
                        <Link href="/agricultural-surfaces">
                          <div className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 ring-2 ring-red-200 dark:ring-red-800">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-red-500 text-white">
                              <XCircle className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-medium flex-1 text-gray-800 dark:text-gray-300">
                              Renseignez le type de culture pour chaque surface
                            </p>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Link>
                        <Link href="/agricultural-surfaces">
                          <div className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 ring-2 ring-red-200 dark:ring-red-800">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-red-500 text-white">
                              <XCircle className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-medium flex-1 text-gray-800 dark:text-gray-300">
                              Sélectionnez une année fiscale
                            </p>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Link>
                        <Link href="/fleet">
                          <div className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-amber-500 text-white">
                              <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-300">
                                Ajoutez vos machines agricoles
                              </p>
                              <span className="text-xs text-amber-600 dark:text-amber-400">{t.dashboard.guidedTourStepOptional}</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Link>
                      </>
                    ) : (
                      // Fallback BTP
                      <>
                        <Link href="/construction-sites">
                          <div className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 ring-2 ring-red-200 dark:ring-red-800">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-red-500 text-white">
                              <XCircle className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-medium flex-1 text-gray-800 dark:text-gray-300">
                              Créez au moins un chantier
                            </p>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Link>
                        <Link href="/fleet">
                          <div className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 ring-2 ring-red-200 dark:ring-red-800">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-red-500 text-white">
                              <XCircle className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-medium flex-1 text-gray-800 dark:text-gray-300">
                              Ajoutez au moins une machine BTP
                            </p>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Link>
                        <Link href="/construction-sites">
                          <div className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 ring-2 ring-red-200 dark:ring-red-800">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-red-500 text-white">
                              <XCircle className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-medium flex-1 text-gray-800 dark:text-gray-300">
                              Affectez une machine à un chantier
                            </p>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Link>
                        <Link href="/fuel">
                          <div className="flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 ring-2 ring-red-200 dark:ring-red-800">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-red-500 text-white">
                              <XCircle className="h-5 w-5" />
                            </div>
                            <p className="text-sm font-medium flex-1 text-gray-800 dark:text-gray-300">
                              Saisissez au moins une entrée carburant
                            </p>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Message de complétion */}
              {preparationProgress && (
                <div className={`p-4 rounded-lg text-center ${preparationProgress.isJournalReady
                  ? 'bg-green-100 dark:bg-green-950/50 border border-green-200 dark:border-green-800'
                  : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}>
                  <p className={`text-sm font-medium ${preparationProgress.isJournalReady ? 'text-green-800 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                    {preparationProgress.isJournalReady
                      ? "🎉 " + t.dashboard.guidedTourReady
                      : t.dashboard.guidedTourIncomplete}
                  </p>
                </div>
              )}

              {/* Disclaimer pédagogique */}
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  ℹ️ Ce parcours est purement pédagogique. Il ne calcule aucun montant et ne valide aucune conformité légale.
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* === Journal de Préparation === */}
        <Card className="mt-6 border-purple-200 dark:border-purple-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileDown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-lg">{t.dashboard.preparationJournalTitle}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">{t.dashboard.preparationJournalDesc}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sélection année fiscale */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">{t.dashboard.preparationJournalYear}</label>
              <select
                value={journalYear}
                onChange={(e) => setJournalYear(parseInt(e.target.value))}
                className="px-3 py-2 border rounded-md bg-background text-sm"
              >
                {[2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Case à cocher obligatoire */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
              <Checkbox
                id="journal-confirm"
                checked={journalConfirmed}
                onCheckedChange={(checked) => setJournalConfirmed(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="journal-confirm" className="text-sm text-purple-800 dark:text-purple-300 cursor-pointer leading-relaxed">
                {t.dashboard.preparationJournalConfirm}
              </label>
            </div>

            {/* Bouton téléchargement avec tooltip */}
            <div className="relative group">
              <Button
                onClick={handleDownloadJournal}
                disabled={!journalConfirmed || journalLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {journalLoading ? (
                  <>Génération en cours...</>
                ) : (
                  <>
                    <FileDown className="h-4 w-4 mr-2" />
                    {t.dashboard.preparationJournalDownload}
                  </>
                )}
              </Button>
              {/* Tooltip explicatif quand bouton désactivé */}
              {!journalConfirmed && !journalLoading && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  Le journal est disponible une fois la confirmation cochée.
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center">
              Ce document ne constitue pas une déclaration fiscale. La responsabilité incombe à l'entreprise.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
