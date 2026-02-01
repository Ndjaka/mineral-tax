import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useSector } from "@/lib/sector-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, FileText, Download, Calendar, Loader2, HelpCircle, FileSpreadsheet, ExternalLink, Key, Building, AppWindow, ShieldCheck, AlertTriangle, CheckCircle2, XCircle, LogIn, Upload, Lightbulb } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Report } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";

type AuditFinding = {
  type: "error" | "warning";
  code: string;
  message: string;
  details?: any;
};

type AuditResult = {
  periodStart: string;
  periodEnd: string;
  summary: {
    machinesChecked: number;
    entriesAnalyzed: number;
    errors: number;
    warnings: number;
  };
  findings: AuditFinding[];
  isValid: boolean;
};

const reportFormSchema = z.object({
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
});

type ReportFormData = z.infer<typeof reportFormSchema>;

export default function ReportsPage() {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const { sector } = useSector();
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [pendingExportId, setPendingExportId] = useState<string | null>(null);

  // IMPORTANT: Tous les hooks DOIVENT être déclarés AVANT tout return conditionnel
  // Cela respecte les règles des hooks React

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      periodStart: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0],
      periodEnd: new Date().toISOString().split("T")[0],
    },
  });

  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
    enabled: sector !== "agriculture", // Désactivé pour Agriculture
  });

  const generateMutation = useMutation({
    mutationFn: (data: ReportFormData) =>
      apiRequest("POST", "/api/reports", {
        periodStart: new Date(data.periodStart).toISOString(),
        periodEnd: new Date(data.periodEnd).toISOString(),
        language,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({ title: t.reports.successGenerate });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      if (error?.message?.includes("403") || error?.code === "subscription_required") {
        toast({ title: t.subscription.subscriptionRequired, variant: "destructive" });
        setLocation("/subscription");
      } else {
        toast({ title: t.common.error, variant: "destructive" });
      }
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await fetch(`/api/reports/${reportId}/pdf`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to download");

      // Récupérer le nom du fichier depuis l'en-tête Content-Disposition
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `report-${reportId}.pdf`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    onError: () => {
      toast({ title: t.common.error, variant: "destructive" });
    },
  });

  const exportCsvMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await fetch(`/api/reports/${reportId}/csv`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export_mineraltax_${new Date().getFullYear()}_directives_OFDF.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    onError: () => {
      toast({ title: t.common.error, variant: "destructive" });
    },
  });

  const auditMutation = useMutation({
    mutationFn: async (data: ReportFormData): Promise<AuditResult> => {
      const response = await apiRequest("POST", "/api/reports/audit", {
        periodStart: new Date(data.periodStart).toISOString(),
        periodEnd: new Date(data.periodEnd).toISOString(),
      });
      return response.json();
    },
    onSuccess: (result: AuditResult) => {
      setAuditResult(result);
      if (result.isValid) {
        toast({ title: t.reports.auditSuccess || "Audit réussi - Aucune erreur détectée" });
      } else {
        toast({
          title: t.reports.auditErrors || "Erreurs détectées dans vos données",
          variant: "destructive"
        });
      }
    },
    onError: () => {
      toast({ title: t.common.error, variant: "destructive" });
    },
  });

  // Redirection automatique pour le secteur Agriculture
  // Cette page n'est pas accessible pour Agriculture (Art. 18 LMin - remboursement forfaitaire)
  useEffect(() => {
    if (sector === "agriculture") {
      setLocation("/dashboard");
    }
  }, [sector, setLocation]);

  // Si Agriculture, ne rien afficher pendant la redirection
  // Ce return DOIT être APRÈS tous les hooks
  if (sector === "agriculture") {
    return null;
  }

  const handleAudit = () => {
    const values = form.getValues();
    auditMutation.mutate(values);
  };

  const onSubmit = (data: ReportFormData) => {
    generateMutation.mutate(data);
  };

  // SUPPRIMÉ: formatCurrency, formatNumber, getStatusBadge
  // Ces fonctions affichaient des CHF - non conformes au positionnement MineralTax

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold" data-testid="text-reports-title">
            Rapport de conformité BTP – Préparation Taxas
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Document interne de préparation et de traçabilité – sans valeur de calcul fiscal
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setIsHelpDialogOpen(true)} data-testid="button-admin-help">
            <HelpCircle className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t.reports.adminHelp}</span>
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} data-testid="button-generate-report">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Générer un rapport</span>
          </Button>
        </div>
      </div>

      {/* Déclaration légale obligatoire */}
      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-sm">
          <strong>MineralTax ne calcule rien à votre place.</strong> Ce rapport garantit que vos données
          sont complètes, structurées et traçables pour votre fiduciaire ou Taxas.
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reports && reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="hover-elevate border-amber-200/50" data-testid={`card-report-${report.id}`}>
              <CardContent className="p-6">
                {/* Bandeau ancien format */}
                <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <p className="text-xs">
                      <strong>Ancien format – désactivé.</strong> Ce rapport a été généré avant la refonte conformité.
                      Il n'est plus utilisé pour la préparation Taxas.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {new Date(report.periodStart).toLocaleDateString()} -{" "}
                          {new Date(report.periodEnd).toLocaleDateString()}
                        </h3>
                        <Badge variant="secondary" className="text-amber-700 bg-amber-100">
                          Ancien format
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Créé le {new Date(report.createdAt!).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Suppression des montants CHF et volumes - conformité positionnement */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div className="text-left sm:text-right">
                      <p className="text-xs sm:text-sm text-muted-foreground">Période couverte</p>
                      <p className="font-mono font-medium text-sm">
                        {Math.ceil((new Date(report.periodEnd).getTime() - new Date(report.periodStart).getTime()) / (1000 * 60 * 60 * 24))} jours
                      </p>
                    </div>

                    <div className="flex gap-2 ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadMutation.mutate(report.id)}
                        disabled={downloadMutation.isPending}
                        data-testid={`button-download-${report.id}`}
                        title="Télécharger (ancien format)"
                      >
                        {downloadMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">PDF</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-medium mb-2">{t.common.noData}</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t.reports.generate}
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.reports.generate}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Guide d'importation Agate - Collapsible */}
      {reports && reports.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="agate-guide" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline" data-testid="accordion-agate-guide">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="font-medium">{t.reports.agateGuideTitle}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 py-2">
                {/* Étape 1 */}
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <LogIn className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">1</span>
                      <h4 className="font-medium">{t.reports.agateStep1Title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.reports.agateStep1Desc}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => window.open("https://www.agate.ch", "_blank")}
                      data-testid="button-open-agate"
                    >
                      {t.reports.agateStep1Button}
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  </div>
                </div>

                {/* Étape 2 */}
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <AppWindow className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">2</span>
                      <h4 className="font-medium">{t.reports.agateStep2Title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.reports.agateStep2Desc}
                    </p>
                  </div>
                </div>

                {/* Étape 3 */}
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">3</span>
                      <h4 className="font-medium">{t.reports.agateStep3Title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t.reports.agateStep3Desc}
                    </p>
                  </div>
                </div>

                {/* Conseil technique */}
                <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg mt-4">
                  <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                      {t.reports.agateTipTitle}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      {t.reports.agateTipDesc}
                    </p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setAuditResult(null); }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.reports.generate}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="periodStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.reports.periodStart} *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        onChange={(e) => { field.onChange(e); setAuditResult(null); }}
                        data-testid="input-period-start"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="periodEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.reports.periodEnd} *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        onChange={(e) => { field.onChange(e); setAuditResult(null); }}
                        data-testid="input-period-end"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SUPPRIMÉ: Carte affichant le taux CHF/L
                  MineralTax ne doit pas afficher de taux ni de calculs financiers */}
              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Langue du rapport</span>
                    <span className="font-medium">{language.toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Ce rapport est un document de traçabilité interne.
                  </p>
                </CardContent>
              </Card>

              <Button
                type="button"
                variant="outline"
                onClick={handleAudit}
                disabled={auditMutation.isPending}
                className="w-full"
                data-testid="button-run-audit"
              >
                {auditMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4 mr-2" />
                )}
                {t.reports.runAudit || "Vérifier la conformité"}
              </Button>

              {auditResult && (
                <Card className={auditResult.isValid ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" : "border-destructive/50 bg-destructive/10"}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      {auditResult.isValid ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <span className="font-medium">
                        {auditResult.isValid
                          ? (t.reports.auditPassed || "Données conformes")
                          : (t.reports.auditFailed || "Corrections requises")}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {t.reports.auditSummary || "Résumé"}: {auditResult.summary.entriesAnalyzed} {t.fuel.title || "entrées"}, {auditResult.summary.machinesChecked} {t.fleet.title || "machines"}
                    </div>

                    {auditResult.findings.length > 0 && (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {auditResult.findings.map((finding, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start gap-2 text-sm p-2 rounded ${finding.type === "error"
                              ? "bg-destructive/20 text-destructive"
                              : "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                              }`}
                          >
                            {finding.type === "error" ? (
                              <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                            )}
                            <span>{finding.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); setAuditResult(null); }}>
                  {t.common.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={generateMutation.isPending || !auditResult || !auditResult.isValid}
                  data-testid="button-confirm-generate"
                >
                  {generateMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {t.common.generate}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.reports.adminHelpTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="p-3 rounded-lg bg-primary/10 h-fit">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">{t.reports.adminHelpLoginCH}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t.reports.adminHelpLoginCHDesc}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-3 rounded-lg bg-primary/10 h-fit">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">{t.reports.adminHelpPartner}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t.reports.adminHelpPartnerDesc}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-3 rounded-lg bg-primary/10 h-fit">
                <AppWindow className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">{t.reports.adminHelpTaxas}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t.reports.adminHelpTaxasDesc}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => window.open("https://www.bazg.admin.ch/", "_blank")}
              data-testid="button-ofdf-portal"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {t.reports.adminHelpLink}
            </Button>
            <Button onClick={() => setIsHelpDialogOpen(false)}>
              {t.common.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disclaimer Modal pour Export CSV */}
      <Dialog open={disclaimerOpen} onOpenChange={setDisclaimerOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Avertissement Important
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <AlertDescription className="text-sm leading-relaxed">
                En générant cet export, l'utilisateur reconnaît être responsable de l'exactitude des données saisies.
                La responsabilité de MineralTax.ch est limitée au montant de l'abonnement annuel.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">
              Veuillez vérifier l'exactitude de toutes vos données avant de soumettre vos fichiers aux autorités fiscales.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDisclaimerOpen(false);
                setPendingExportId(null);
              }}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (pendingExportId) {
                  exportCsvMutation.mutate(pendingExportId);
                  setDisclaimerOpen(false);
                  setPendingExportId(null);
                }
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              J'accepte et je télécharge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Déclaration légale obligatoire (Section 6) */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg border">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Avertissement légal :</strong> Ce document ne constitue ni une déclaration fiscale,
          ni un calcul de remboursement, ni une validation par l'OFDF. Il s'agit d'un outil interne
          de préparation destiné à structurer et vérifier les données avant saisie sur la plateforme
          officielle Taxas. La responsabilité des données déclarées incombe exclusivement à l'entreprise.
        </p>
        <p className="text-xs text-muted-foreground mt-2 italic">
          Document généré par MineralTax – outil de préparation interne
        </p>
      </div>
    </div>
  );
}
