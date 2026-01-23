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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Truck, Search, AlertTriangle } from "lucide-react";
import { StatsBar } from "@/components/stats-bar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Machine } from "@shared/schema";

const machineTypesEngins = [
  { value: "excavator", emoji: "🚜" },
  { value: "spider_excavator", emoji: "🕷️" },
  { value: "loader", emoji: "🚛" },
  { value: "crane", emoji: "🏗️" },
  { value: "drill", emoji: "🔩" },
  { value: "finisher", emoji: "🛤️" },
  { value: "milling_machine", emoji: "⚙️" },
  { value: "roller", emoji: "🚧" },
] as const;

const machineTypesAutres = [
  { value: "dumper", emoji: "🚚" },
  { value: "forklift", emoji: "📦" },
  { value: "crusher", emoji: "🪨" },
  { value: "generator", emoji: "⚡" },
  { value: "compressor", emoji: "💨" },
  { value: "concrete_pump", emoji: "🏭" },
  { value: "other", emoji: "🔧" },
] as const;

const machineTypesArr = [
  "excavator",
  "spider_excavator",
  "loader",
  "crane",
  "drill",
  "finisher",
  "milling_machine",
  "roller",
  "dumper",
  "forklift",
  "crusher",
  "generator",
  "compressor",
  "concrete_pump",
  "other",
] as const;

const taxasActivitiesArr = [
  "agriculture_with_direct",
  "agriculture_with_direct_old",
  "agriculture_without_direct",
  "forestry",
  "rinsing",
  "concession_transport",
  "natural_stone",
  "snow_groomer",
  "professional_fishing",
  "stationary_generator",
  "stationary_cleaning",
  "stationary_combustion",
  "construction",
  "other_taxas",
] as const;

const plateColorsArr = ["white", "green", "yellow", "blue", "none"] as const;

const machineFormSchema = z.object({
  name: z.string().min(1),
  type: z.enum(machineTypesArr),
  customType: z.string().optional(),
  taxasActivity: z.enum(taxasActivitiesArr).optional(),
  licensePlate: z.string().optional(),
  plateColor: z.enum(plateColorsArr).optional(),
  chassisNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  rcNumber: z.string().optional(),
  year: z.coerce.number().min(1900).max(2100).optional(),
  power: z.string().optional(),
  isEligible: z.boolean().default(true),
}).refine((data) => {
  if (data.type === "other") {
    return data.customType && data.customType.trim().length > 0;
  }
  return true;
}, {
  message: "Required",
  path: ["customType"],
});

type MachineFormData = z.infer<typeof machineFormSchema>;

export default function FleetPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [deletingMachine, setDeletingMachine] = useState<Machine | null>(null);
  const [hasEligibilityOverride, setHasEligibilityOverride] = useState(false);

  const form = useForm<MachineFormData>({
    resolver: zodResolver(machineFormSchema),
    defaultValues: {
      name: "",
      type: "excavator",
      customType: "",
      taxasActivity: "construction",
      licensePlate: "",
      plateColor: "none",
      chassisNumber: "",
      registrationNumber: "",
      rcNumber: "",
      year: undefined,
      power: "",
      isEligible: true,
    },
  });

  const { data: machines, isLoading } = useQuery<Machine[]>({
    queryKey: ["/api/machines"],
  });

  const createMutation = useMutation({
    mutationFn: (data: MachineFormData) => apiRequest("POST", "/api/machines", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: t.fleet.successAdd });
      handleCloseDialog();
    },
    onError: (error: any) => {
      if (error?.message?.includes("403") || error?.code === "subscription_required") {
        toast({ title: t.subscription.subscriptionRequired, variant: "destructive" });
        setLocation("/subscription");
      } else {
        toast({ title: error?.message || t.common.error, variant: "destructive" });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MachineFormData }) =>
      apiRequest("PATCH", `/api/machines/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
      toast({ title: t.fleet.successUpdate });
      handleCloseDialog();
    },
    onError: () => {
      toast({ title: t.common.error, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/machines/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/machines"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ title: t.fleet.successDelete });
      setDeletingMachine(null);
    },
    onError: () => {
      toast({ title: t.common.error, variant: "destructive" });
    },
  });

  const handleOpenDialog = (machine?: Machine) => {
    setHasEligibilityOverride(false);
    if (machine) {
      setEditingMachine(machine);
      form.reset({
        name: machine.name,
        type: (machine.type as any) || "excavator",
        customType: machine.customType || "",
        taxasActivity: (machine.taxasActivity as any) || "construction",
        licensePlate: machine.licensePlate || "",
        plateColor: (machine.plateColor as any) || "none",
        chassisNumber: machine.chassisNumber || "",
        registrationNumber: machine.registrationNumber || "",
        rcNumber: machine.rcNumber || "",
        year: machine.year || undefined,
        power: machine.power || "",
        isEligible: machine.isEligible,
      });
      setHasEligibilityOverride(true);
    } else {
      setEditingMachine(null);
      form.reset({
        name: "",
        type: "excavator",
        customType: "",
        taxasActivity: "construction",
        licensePlate: "",
        plateColor: "none",
        chassisNumber: "",
        registrationNumber: "",
        rcNumber: "",
        year: undefined,
        power: "",
        isEligible: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMachine(null);
    setHasEligibilityOverride(false);
    form.reset();
  };

  const onSubmit = (data: MachineFormData) => {
    if (editingMachine) {
      updateMutation.mutate({ id: editingMachine.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredMachines = machines?.filter((machine) =>
    machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    machine.chassisNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMachineTypeLabel = (type: string) => {
    return (t.fleet.types as any)[type] || type;
  };

  const getTaxasActivityLabel = (activity: string) => {
    return (t.fleet.taxasActivities as any)[activity] || activity;
  };

  const getPlateColorInfo = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string; text: string; eligible: boolean }> = {
      white: { bg: "bg-white", border: "border-gray-400", text: "text-black", eligible: false },
      green: { bg: "bg-green-600", border: "border-green-700", text: "text-white", eligible: true },
      yellow: { bg: "bg-yellow-500", border: "border-yellow-600", text: "text-black", eligible: true },
      blue: { bg: "bg-blue-600", border: "border-blue-700", text: "text-white", eligible: false },
      none: { bg: "bg-gray-200", border: "border-gray-400", text: "text-gray-600", eligible: true },
    };
    return colorMap[color] || colorMap.none;
  };

  const getPlateColorLabel = (color: string) => {
    return (t.fleet.plateColors as any)?.[color] || color;
  };

  const watchPlateColor = form.watch("plateColor");
  const watchIsEligible = form.watch("isEligible");
  const watchType = form.watch("type");

  const handlePlateColorChange = (color: string) => {
    form.setValue("plateColor", color as any);
    if (!hasEligibilityOverride) {
      const colorInfo = getPlateColorInfo(color);
      form.setValue("isEligible", colorInfo.eligible);
    }
  };

  const handleEligibilityChange = (value: boolean) => {
    setHasEligibilityOverride(true);
    form.setValue("isEligible", value);
  };

  const showWhitePlateWarning = (watchPlateColor === "white" || watchPlateColor === "blue") && watchIsEligible;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold" data-testid="text-fleet-title">
            {t.fleet.title}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {machines?.length || 0} {t.dashboard.activeMachines.toLowerCase()}
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} data-testid="button-add-machine">
          <Plus className="h-4 w-4 mr-2" />
          {t.fleet.addMachine}
        </Button>
      </div>

      <StatsBar />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t.common.search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
          data-testid="input-search-machines"
        />
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMachines && filteredMachines.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMachines.map((machine) => (
            <Card key={machine.id} className="hover-elevate" data-testid={`card-machine-${machine.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{machine.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {getMachineTypeLabel(machine.type)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={machine.isEligible ? "default" : "secondary"}>
                    {machine.isEligible ? t.fleet.eligible : t.fleet.notEligible}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  {machine.licensePlate && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t.fleet.licensePlate || "Plaque"}</span>
                      <div className="flex items-center gap-2">
                        {machine.plateColor && machine.plateColor !== "none" && (
                          <span
                            className={`w-4 h-4 rounded border ${getPlateColorInfo(machine.plateColor).bg} ${getPlateColorInfo(machine.plateColor).border}`}
                            title={getPlateColorLabel(machine.plateColor)}
                          />
                        )}
                        <span className="font-mono">{machine.licensePlate}</span>
                      </div>
                    </div>
                  )}
                  {machine.chassisNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.fleet.chassisNumber}</span>
                      <span className="font-mono">{machine.chassisNumber}</span>
                    </div>
                  )}
                  {machine.year && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.fleet.year}</span>
                      <span>{machine.year}</span>
                    </div>
                  )}
                  {machine.taxasActivity && (
                    <div className="pt-2 border-t mt-2">
                      <p className="text-[10px] uppercase text-muted-foreground tracking-wider mb-1">
                        {t.fleet.taxasActivity}
                      </p>
                      <p className="text-xs font-medium">
                        {getTaxasActivityLabel(machine.taxasActivity)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(machine)}
                    data-testid={`button-edit-machine-${machine.id}`}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    {t.common.edit}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeletingMachine(machine)}
                    data-testid={`button-delete-machine-${machine.id}`}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t.common.delete}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t.common.noData}</p>
          <p className="text-sm mt-1">{t.fleet.emptyDescription}</p>
          <Button onClick={() => handleOpenDialog()} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            {t.fleet.addMachine}
          </Button>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingMachine ? t.fleet.editMachine : t.fleet.addMachine}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.fleet.machineName}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Pelle hydraulique A12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.fleet.machineType}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>{t.fleet.constructionEngines}</SelectLabel>
                            {machineTypesEngins.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.emoji} {getMachineTypeLabel(type.value)}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>{t.fleet.otherEquipment}</SelectLabel>
                            {machineTypesAutres.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.emoji} {getMachineTypeLabel(type.value)}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {watchType === "other" && (
                <FormField
                  control={form.control}
                  name="customType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.fleet.specifyMachineType}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t.fleet.otherTypePlaceholder}
                        />
                      </FormControl>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                        {t.fleet.otherTypeNote}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="taxasActivity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.fleet.taxasActivity}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir une activité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {taxasActivitiesArr.map((activity) => (
                            <SelectItem key={activity} value={activity}>
                              {getTaxasActivityLabel(activity)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="licensePlate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.fleet.licensePlate || "Plaque"}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="VD 123456" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="plateColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.fleet.plateColorLabel || "Couleur"}</FormLabel>
                        <Select
                          onValueChange={(val) => handlePlateColorChange(val)}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {plateColorsArr.map((color) => (
                              <SelectItem key={color} value={color}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full border ${getPlateColorInfo(color).bg} ${getPlateColorInfo(color).border}`} />
                                  {getPlateColorLabel(color)}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="chassisNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.fleet.chassisNumber}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="VIN / N° de châssis" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.fleet.registrationNumber}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Matricule / N° d'immatriculation" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {t.fleet.eligible}
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    {t.fleet.plateColorHint || "Plaques vertes et jaunes = éligible. Plaques blanches = non éligible."}
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="isEligible"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(val) => handleEligibilityChange(val)}
                          data-testid="switch-is-eligible"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {showWhitePlateWarning && (
                <Alert className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {t.fleet.whitePlateWarning || "Plaque blanche marquée comme éligible : documentez l'usage spécial pour l'OFDF."}
                  </AlertDescription>
                </Alert>
              )}

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
                  data-testid="button-save-machine"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <span className="mr-2 animate-spin">⏳</span>
                  )}
                  {t.common.save}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingMachine}
        onOpenChange={(open) => !open && setDeletingMachine(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.common.confirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.fleet.deleteConfirm}
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
                if (deletingMachine) deleteMutation.mutate(deletingMachine.id);
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
