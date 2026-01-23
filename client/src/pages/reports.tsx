import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
import { Plus, FileText, Download, Calendar, Loader2, HelpCircle, FileSpreadsheet, ExternalLink, LogIn, Upload, Lightbulb, CheckCircle2, AlertTriangle, XCircle, Building, AppWindow, ShieldCheck } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Report } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatsBar } from "@/components/stats-bar";

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
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      periodStart: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0],
      periodEnd: new Date().toISOString().split("T")[0],
    },
  });

  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
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
        toast({ title: t.reports.auditSuccess || "Audit réussi" });
      } else {
        toast({
          title: t.reports.auditErrors || "Erreurs détectées",
          variant: "destructive"
        });
      }
    },
    onError: () => {
      toast({ title: t.common.error, variant: "destructive" });
    },
  });

  const handleAudit = () => {
    const values = form.getValues();
    auditMutation.mutate(values);
  };

  const onSubmit = (data: ReportFormData) => {
    generateMutation.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CH", {
      style: "currency",
      currency: "CHF",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fr-CH").format(num);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      draft: "secondary",
      submitted: "default",
      approved: "default",
      rejected: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {(t.reports.status as any)[status] || status}
      </Badge>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold" data-testid="text-reports-title">
            {t.reports.title}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {t.reports.formReference}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setIsHelpDialogOpen(true)} data-testid="button-admin-help">
            <HelpCircle className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t.reports.adminHelp}</span>
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} data-testid="button-generate-report">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{t.reports.generate}</span>
          </Button>
        </div>
      </div>

      <StatsBar />

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          {t.reports.form4535Notice}
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
            <Card key={report.id} className="hover-elevate" data-testid={`card-report-${report.id}`}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-foreground">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {new Date(report.periodStart).toLocaleDateString()} -{" "}
                          {new Date(report.periodEnd).toLocaleDateString()}
                        </h3>
                        {getStatusBadge(report.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {t.common.date}: {new Date(report.createdAt!).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div className="text-left sm:text-right">
                      <p className="text-xs sm:text-sm text-muted-foreground">{t.reports.eligibleVolume}</p>
                      <p className="font-mono font-medium">
                        {formatNumber(report.eligibleVolumeLiters)} L
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs sm:text-sm text-muted-foreground">{t.reports.reimbursementAmount}</p>
                      <p className="text-lg sm:text-xl font-bold text-primary font-mono">
                        {formatCurrency(report.reimbursementAmount)}
                      </p>
                    </div>

                    <div className="flex gap-2 ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportCsvMutation.mutate(report.id)}
                        disabled={exportCsvMutation.isPending}
                        data-testid={`button-export-csv-${report.id}`}
                        title={t.reports.exportTaxasDesc}
                      >
                        {exportCsvMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <FileSpreadsheet className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Taxas</span>
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadMutation.mutate(report.id)}
                        disabled={downloadMutation.isPending}
                        data-testid={`button-download-${report.id}`}
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
          <CardContent className="py-12 text-center text-foreground">
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

      {reports && reports.length > 0 && (
        <Accordion type="single" collapsible className="w-full text-foreground">
          <AccordionItem value="agate-guide" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline" data-testid="accordion-agate-guide">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="font-medium">{t.reports.agateGuideTitle}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 py-2">
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

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">2</span>
                      <h4 className="font-medium">{t.reports.agateStep2Title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 text-wrap">
                      {t.reports.agateStep2Desc}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 border-l-2 border-primary/20 pl-4 py-2 bg-primary/5 rounded-r-lg">
                  <Lightbulb className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm italic text-muted-foreground">
                    {t.reports.agateProTip}
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] text-foreground">
          <DialogHeader>
            <DialogTitle>{t.reports.generate}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="periodStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.reports.periodStart}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                      <FormLabel>{t.reports.periodEnd}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAudit}
                  disabled={auditMutation.isPending}
                  className="w-full"
                >
                  {auditMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t.reports.verifyData || "Vérifier mes données (Audit)"}
                </Button>

                {auditResult && (
                  <div className={`p-4 rounded-lg border ${auditResult.isValid ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {auditResult.isValid ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                      )}
                      <p className="font-semibold text-sm">
                        {auditResult.isValid ? t.reports.auditReady || "Prêt pour soumission" : t.reports.auditErrors || "Erreurs détectées"}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>{t.reports.machinesChecked || "Engins vérifiés"}:</span>
                        <span>{auditResult.summary.machinesChecked}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t.reports.entriesAnalyzed || "Tickets analysés"}:</span>
                        <span>{auditResult.summary.entriesAnalyzed}</span>
                      </div>
                    </div>

                    {auditResult.findings.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-black/5 space-y-2">
                        {auditResult.findings.map((finding, idx) => (
                          <div key={idx} className="flex gap-2 text-[10px] leading-tight">
                            {finding.type === "error" ? <XCircle className="h-3 w-3 text-destructive shrink-0" /> : <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />}
                            <span>{finding.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={generateMutation.isPending}
                >
                  {t.common.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={generateMutation.isPending || (auditResult !== null && !auditResult.isValid)}
                  data-testid="button-confirm-generate"
                >
                  {generateMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {t.reports.generate}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
        <DialogContent className="sm:max-w-[600px] text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              {t.reports.adminHelp}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm">
            <p>{t.reports.adminHelpIntro}</p>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted flex gap-4">
                <LogIn className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">{t.reports.adminHelpLoginTitle}</h4>
                  <p className="text-muted-foreground">{t.reports.adminHelpLoginDesc}</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted flex gap-4">
                <AppWindow className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">{t.reports.adminHelpSearchTitle}</h4>
                  <p className="text-muted-foreground">{t.reports.adminHelpSearchDesc}</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted flex gap-4">
                <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <h4 className="font-bold mb-1">{t.reports.adminHelpSubmitTitle}</h4>
                  <p className="text-muted-foreground">{t.reports.adminHelpSubmitDesc}</p>
                </div>
              </div>
            </div>
            <p className="font-semibold text-primary">{t.reports.adminHelpOutro}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsHelpDialogOpen(false)}>{t.common.close}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
