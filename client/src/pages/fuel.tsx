import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Fuel, Calendar, Camera, Loader2, ChevronDown, HelpCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { StatsBar } from "@/components/stats-bar";
import { Progress } from "@/components/ui/progress";
import type { Machine, FuelEntry } from "@shared/schema";
import { calculateReimbursement } from "@shared/schema";
import { extractTextFromImage } from "@/lib/ocr";

const fuelTypesArr = ["diesel", "gasoline", "biodiesel"] as const;

const fuelEntryFormSchema = z.object({
  machineId: z.string().min(1),
  invoiceDate: z.string().min(1),
  invoiceNumber: z.string().optional(),
  volumeLiters: z.coerce.number().positive(),
  engineHours: z.coerce.number().nonnegative().optional(),
  fuelType: z.enum(fuelTypesArr).default("diesel"),
  articleNumber: z.string().optional(),
  warehouseNumber: z.string().optional(),
  movementNumber: z.string().optional(),
  bd: z.string().optional(),
  stat: z.string().optional(),
  ci: z.string().optional(),
  notes: z.string().optional(),
});

type FuelEntryFormData = z.infer<typeof fuelEntryFormSchema>;

function InfoPopover({ content }: { content: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="ml-1 text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
          onClick={(e) => e.stopPropagation()}
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" className="max-w-xs text-sm z-[200] p-3">
        <p>{content}</p>
      </PopoverContent>
    </Popover>
  );
}

export default function FuelPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FuelEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<FuelEntry | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const form = useForm<FuelEntryFormData>({
    resolver: zodResolver(fuelEntryFormSchema),
    defaultValues: {
      machineId: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      invoiceNumber: "",
      volumeLiters: undefined,
      engineHours: undefined,
      fuelType: "diesel",
      articleNumber: "",
      warehouseNumber: "",
      movementNumber: "",
      bd: "",
      stat: "",
      ci: "",
      notes: "",
    },
  });

  const volumeValue = form.watch("volumeLiters");
  const calculatedReimbursement = volumeValue
    ? calculateReimbursement(volumeValue).toFixed(2)
    : "0.00";

  const { data: machines } = useQuery<Machine[]>({
    queryKey: ["/api/machines"],
  });

  const { data: entries, isLoading } = useQuery<(FuelEntry & { machine?: Machine })[]>({
    queryKey: ["/api/fuel-entries"],
  });

  const createMutation = useMutation({
    mutationFn: (data: FuelEntryFormData) => apiRequest("POST", "/api/fuel-entries", {
      ...data,
      invoiceDate: new Date(data.invoiceDate).toISOString(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fuel-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: t.fuel.successAdd });
      handleCloseDialog();
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FuelEntryFormData }) =>
      apiRequest("PATCH", `/api/fuel-entries/${id}`, {
        ...data,
        invoiceDate: new Date(data.invoiceDate).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fuel-entries"] });
      toast({ title: t.fuel.successUpdate });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: t.common.error, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/fuel-entries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fuel-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: t.fuel.successDelete });
      setDeletingEntry(null);
    },
    onError: () => {
      toast({ title: t.common.error, variant: "destructive" });
    },
  });

  const handleOpenDialog = (entry?: FuelEntry) => {
    if (entry) {
      setEditingEntry(entry);
      form.reset({
        machineId: entry.machineId,
        invoiceDate: new Date(entry.invoiceDate).toISOString().split("T")[0],
        invoiceNumber: entry.invoiceNumber || "",
        volumeLiters: entry.volumeLiters,
        engineHours: entry.engineHours || undefined,
        fuelType: entry.fuelType as any,
        articleNumber: (entry as any).articleNumber || "",
        warehouseNumber: (entry as any).warehouseNumber || "",
        movementNumber: (entry as any).movementNumber || "",
        bd: (entry as any).bd || "",
        stat: (entry as any).stat || "",
        ci: (entry as any).ci || "",
        notes: entry.notes || "",
      });
    } else {
      setEditingEntry(null);
      form.reset({
        machineId: "",
        invoiceDate: new Date().toISOString().split("T")[0],
        invoiceNumber: "",
        volumeLiters: undefined,
        engineHours: undefined,
        fuelType: "diesel",
        articleNumber: "",
        warehouseNumber: "",
        movementNumber: "",
        bd: "",
        stat: "",
        ci: "",
        notes: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEntry(null);
    form.reset();
  };

  const onSubmit = (data: FuelEntryFormData) => {
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data });
    } else {
      createMutation.mutate(data);
    }
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

  const getFuelTypeLabel = (type: string) => {
    return (t.fuel.fuelTypes as any)[type] || type;
  };

  const allMachines = machines || [];

  const handleScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanProgress(0);

    try {
      const result = await extractTextFromImage(file, (progress) => {
        setScanProgress(progress);
      });

      handleOpenDialog();

      if (result.extractedData.volume) {
        form.setValue("volumeLiters", result.extractedData.volume);
      }
      if (result.extractedData.date) {
        form.setValue("invoiceDate", result.extractedData.date);
      }
      if (result.extractedData.invoiceNumber) {
        form.setValue("invoiceNumber", result.extractedData.invoiceNumber);
      }

      toast({
        title: t.fuel.scanComplete,
        description: result.extractedData.volume
          ? `${result.extractedData.volume}${t.fuel.volumeDetected}`
          : t.fuel.checkData,
      });
    } catch (error) {
      console.error("OCR error:", error);
      toast({
        title: t.common.error,
        description: t.fuel.ocrError,
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
      event.target.value = "";
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold" data-testid="text-fuel-title">
            {t.fuel.title}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {entries?.length || 0} {t.dashboard.recentEntries.toLowerCase()}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            disabled={isScanning}
            className="relative bg-primary hover:bg-primary/90"
            data-testid="button-scan-ticket"
          >
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleScan}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isScanning}
            />
            {isScanning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t.fuel.ocrAnalyzing}
              </>
            ) : (
              <>
                <Camera className="h-5 w-5 mr-2" />
                {t.fuel.scanTicket}
              </>
            )}
          </Button>
          <Button onClick={() => handleOpenDialog()} data-testid="button-add-fuel-entry">
            <Plus className="h-4 w-4 mr-2" />
            {t.fuel.addEntry}
          </Button>
        </div>
      </div>

      <StatsBar />

      {isScanning && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">
                  {t.fuel.scanningTicket}
                </p>
                <Progress value={scanProgress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : entries && entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry) => {
            const machine = machines?.find((m) => m.id === entry.machineId);
            const reimbursement = calculateReimbursement(entry.volumeLiters);

            return (
              <Card key={entry.id} className="hover-elevate" data-testid={`card-fuel-entry-${entry.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Fuel className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {machine?.name || "-"}
                          {machine && !machine.isEligible && (
                            <span className="ml-2 text-[10px] text-destructive uppercase tracking-tighter">
                              {t.fuel.notEligibleTag}
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(entry.invoiceDate).toLocaleDateString()}</span>
                          {entry.invoiceNumber && (
                            <>
                              <span>•</span>
                              <span>N° {entry.invoiceNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="text-right">
                        <p className="font-mono font-bold text-lg">{formatNumber(entry.volumeLiters)} L</p>
                        <p className="text-xs text-primary font-mono">
                          {machine?.isEligible ? `+ ${formatCurrency(reimbursement)}` : "0.00 CHF"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(entry)}
                          data-testid={`button-edit-entry-${entry.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeletingEntry(entry)}
                          data-testid={`button-delete-entry-${entry.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          <Fuel className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t.common.noData}</p>
          <p className="text-sm mt-1">{t.fuel.emptyDescription}</p>
          <Button onClick={() => handleOpenDialog()} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            {t.fuel.addEntry}
          </Button>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? t.fuel.editEntry : t.fuel.addEntry}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="machineId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.fleet.title}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir une machine" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60">
                          {allMachines.map((machine) => (
                            <SelectItem key={machine.id} value={machine.id}>
                              {machine.name} {!machine.isEligible && `(${t.fleet.notEligible})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.fuel.invoiceDate}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="volumeLiters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.fuel.volume}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="number" step="0.01" {...field} placeholder="0.00" className="pr-12 font-mono" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">L</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.fuel.invoiceNumber}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="N° de facture" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Calculator className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.fuel.calculatedReimbursement}</p>
                    <p className="text-[10px] text-muted-foreground">Taux: 0.3405 CHF/L (OFDF)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary font-mono">{calculatedReimbursement} CHF</p>
                </div>
              </div>

              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between px-2 font-normal text-muted-foreground hover:text-foreground">
                    Données Taxas optionnelles (Codes douaniers)
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="articleNumber"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center">
                            <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground leading-none">N° Article</FormLabel>
                            <InfoPopover content="Code interne agriculture/BTP" />
                          </div>
                          <FormControl>
                            <Input {...field} className="h-8 text-xs font-mono" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="warehouseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground leading-none">N° Entrepôt</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-8 text-xs font-mono" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="movementNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground leading-none">N° Mouvement</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-8 text-xs font-mono" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="bd"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center">
                            <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground leading-none">BD</FormLabel>
                            <InfoPopover content="Usage spécial" />
                          </div>
                          <FormControl>
                            <Input {...field} className="h-8 text-xs font-mono" placeholder="45" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="stat"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center">
                            <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground leading-none">Stat.</FormLabel>
                            <InfoPopover content="Code douanier (ex: 2710)" />
                          </div>
                          <FormControl>
                            <Input {...field} className="h-8 text-xs font-mono" placeholder="2710" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ci"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center">
                            <FormLabel className="text-[10px] uppercase font-bold text-muted-foreground leading-none">CI</FormLabel>
                            <InfoPopover content="Clé d'imposition (ex: A1)" />
                          </div>
                          <FormControl>
                            <Input {...field} className="h-8 text-xs font-mono" placeholder="A1" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fuel.notes}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Informations complémentaires..." className="resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCloseDialog}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {t.common.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-fuel-entry"
                >
                  {t.common.save}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingEntry}
        onOpenChange={(open) => !open && setDeletingEntry(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.common.confirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.fuel.deleteConfirm}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {t.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                if (deletingEntry) deleteMutation.mutate(deletingEntry.id);
              }}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "..." : t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
