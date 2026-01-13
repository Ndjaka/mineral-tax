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
import { Plus, FileText, Download, Calendar, Loader2, HelpCircle, FileSpreadsheet, ExternalLink, Key, Building, AppWindow } from "lucide-react";
import type { Report } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report-${reportId}.pdf`;
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
      a.download = `mineraltax-data-${reportId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    },
    onError: () => {
      toast({ title: t.common.error, variant: "destructive" });
    },
  });

  const onSubmit = (data: ReportFormData) => {
    generateMutation.mutate(data);
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      draft: "secondary",
      submitted: "default",
      approved: "default",
      rejected: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {t.reports.status[status as keyof typeof t.reports.status] || status}
      </Badge>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                      <Input type="date" {...field} data-testid="input-period-start" />
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
                      <Input type="date" {...field} data-testid="input-period-end" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.reports.rate}</span>
                    <span className="font-mono font-medium">0.3405 CHF/L</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t.settings.language}</span>
                    <span className="font-medium">{language.toUpperCase()}</span>
                  </div>
                </CardContent>
              </Card>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t.common.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={generateMutation.isPending}
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
    </div>
  );
}
