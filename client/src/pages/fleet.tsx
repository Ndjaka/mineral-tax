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
import { Plus, Pencil, Trash2, Truck, Search, AlertTriangle, Tractor, TreePine } from "lucide-react";
import { StatsBar } from "@/components/stats-bar";
import { useSector } from "@/lib/sector-context";
import type { Machine } from "@shared/schema";

// === Types BTP/Construction ===
const machineTypesBTP_Engins = [
  { value: "excavator", emoji: "🚜" },
  { value: "spider_excavator", emoji: "🕷️" },
  { value: "loader", emoji: "🚛" },
  { value: "crane", emoji: "🏗️" },
  { value: "drill", emoji: "🔩" },
  { value: "finisher", emoji: "🛤️" },
  { value: "milling_machine", emoji: "⚙️" },
  { value: "roller", emoji: "🚧" },
] as const;

const machineTypesBTP_Autres = [
  { value: "dumper", emoji: "🚚" },
  { value: "forklift", emoji: "📦" },
  { value: "crusher", emoji: "🪨" },
  { value: "generator", emoji: "⚡" },
  { value: "compressor", emoji: "💨" },
  { value: "concrete_pump", emoji: "🏭" },
  { value: "other", emoji: "🔧" },
] as const;

// === Types Agriculture ===
const machineTypesAgri_Recolte = [
  { value: "tractor", emoji: "🚜" },
  { value: "combine_harvester", emoji: "🌾" },
  { value: "forage_harvester", emoji: "🌿" },
  { value: "baler", emoji: "🎁" },
  { value: "mower", emoji: "✂️" },
  { value: "tedder", emoji: "🌀" },
] as const;

const machineTypesAgri_Autres = [
  { value: "sprayer", emoji: "💧" },
  { value: "seeder", emoji: "🌱" },
  { value: "trailer", emoji: "🚛" },
  { value: "slurry_tanker", emoji: "🛢️" },
  { value: "forestry_tractor", emoji: "🌲" },
  { value: "vineyard_tractor", emoji: "🍇" },
  { value: "other", emoji: "🔧" },
] as const;

// === Compatibilité - Tous les types (pour validation schema) ===
const machineTypes = [
  // BTP
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
  // Agriculture
  "tractor",
  "combine_harvester",
  "forage_harvester",
  "sprayer",
  "seeder",
  "baler",
  "tedder",
  "mower",
  "trailer",
  "slurry_tanker",
  "forestry_tractor",
  "vineyard_tractor",
  // Générique
  "other",
] as const;

const taxasActivities = [
  "agriculture_with_direct",
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

const plateColors = ["white", "green", "yellow", "blue", "none"] as const;

const machineFormSchema = z.object({
  name: z.string().min(1),
  type: z.enum(machineTypes),
  customType: z.string().optional(),
  taxasActivity: z.enum(taxasActivities).optional(),
  licensePlate: z.string().optional(),
  plateColor: z.enum(plateColors).optional(),
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
  message: "Veuillez préciser le type de machine",
  path: ["customType"],
});

type MachineFormData = z.infer<typeof machineFormSchema>;

export default function FleetPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { sector } = useSector();
  const isAgri = sector === 'agriculture';
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [deletingMachine, setDeletingMachine] = useState<Machine | null>(null);
  const [hasEligibilityOverride, setHasEligibilityOverride] = useState(false);

  const form = useForm<MachineFormData>({
    resolver: zodResolver(machineFormSchema),
    defaultValues: {
      name: "",
      type: isAgri ? "tractor" : "excavator",
      customType: "",
      taxasActivity: isAgri ? "agriculture_with_direct" : "construction",
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
      console.error("Create machine error:", error);
      if (error?.message?.includes("403") || error?.code === "subscription_required") {
        toast({ title: t.subscription.subscriptionRequired, variant: "destructive" });
        setLocation("/subscription");
      } else {
        const errorMessage = error?.message || t.common.error;
        toast({ title: errorMessage, variant: "destructive" });
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
        type: machine.type as typeof machineTypes[number],
        customType: machine.customType || "",
        taxasActivity: (machine.taxasActivity as typeof taxasActivities[number]) || "construction",
        licensePlate: machine.licensePlate || "",
        plateColor: (machine.plateColor as typeof plateColors[number]) || "none",
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
    return t.fleet.types[type as keyof typeof t.fleet.types] || type;
  };

  const getTaxasActivityLabel = (activity: string) => {
    return t.fleet.taxasActivities[activity as keyof typeof t.fleet.taxasActivities] || activity;
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
    return t.fleet.plateColors?.[color as keyof typeof t.fleet.plateColors] || color;
  };

  // === Variables et handlers V1 simplifiés ===
  // Les fonctions suivantes sont conservées mais inutilisées en V1 (soft-hide)
  // Réactivation possible en V2+
  // const watchPlateColor = form.watch("plateColor");
  // const watchIsEligible = form.watch("isEligible");
  const watchType = form.watch("type");

  // Handlers désactivés V1 (soft-hide)
  // const handlePlateColorChange = ...
  // const handleEligibilityChange = ...
  // const showWhitePlateWarning = ...

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
        <Button onClick={() => handleOpenDialog()} data-testid="button-add-machine" className={isAgri ? "bg-green-600 hover:bg-green-700" : ""}>
          <Plus className="h-4 w-4 mr-2" />
          {t.fleet.addMachine}
        </Button>
      </div>

      {/* Badge secteur Agriculture */}
      {isAgri && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-medium border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
          <TreePine className="h-4 w-4" />
          <span>Agriculture – régime forfaitaire (Art. 18 LMin)</span>
        </div>
      )}

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
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{machine.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {getMachineTypeLabel(machine.type)}
                      </p>
                    </div>
                  </div>
                  {/* Badge éligible masqué V1 (soft-hide) - réactivation V2+ */}
                </div>

                <div className="space-y-2 text-sm">
                  {/* Infos plaque masquées V1 (soft-hide) */}
                  {machine.year && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.fleet.year}</span>
                      <span className="font-mono">{machine.year}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenDialog(machine)}
                    data-testid={`button-edit-machine-${machine.id}`}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    {t.common.edit}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingMachine(machine)}
                    data-testid={`button-delete-machine-${machine.id}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-medium mb-2">{t.common.noData}</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {t.fleet.emptyDescription || "Commencez par ajouter vos véhicules et machines"}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMachine ? t.fleet.editMachine : t.fleet.addMachine}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fleet.machineName} *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-machine-name" />
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
                    <FormLabel>{t.fleet.machineType} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-machine-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isAgri ? (
                          <>
                            <SelectGroup>
                              <SelectLabel>🌾 Récolte & Fenaison</SelectLabel>
                              {machineTypesAgri_Recolte.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.emoji} {getMachineTypeLabel(type.value)}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>🚜 Autres équipements agricoles</SelectLabel>
                              {machineTypesAgri_Autres.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.emoji} {getMachineTypeLabel(type.value)}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </>
                        ) : (
                          <>
                            <SelectGroup>
                              <SelectLabel>🏗️ Engins de chantier</SelectLabel>
                              {machineTypesBTP_Engins.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.emoji} {getMachineTypeLabel(type.value)}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                            <SelectGroup>
                              <SelectLabel>⚙️ Autres équipements</SelectLabel>
                              {machineTypesBTP_Autres.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.emoji} {getMachineTypeLabel(type.value)}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchType === "other" && (
                <>
                  <FormField
                    control={form.control}
                    name="customType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Précisez le type de machine *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ex: Broyeur fixe, Pompe à lisier, Compresseur..."
                            data-testid="input-custom-type"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-start gap-3 p-3 rounded-md bg-amber-500/10 border border-amber-500/30">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      <strong>Note :</strong> Les machines de type "Autre" peuvent nécessiter une validation manuelle de l'OFDF. Assurez-vous qu'elles ne sont pas destinées au transport routier.
                    </p>
                  </div>
                </>
              )}

              <FormField
                control={form.control}
                name="taxasActivity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fleet.taxasActivity}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-taxas-activity">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {taxasActivities.map((activity) => (
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

              {/* === CHAMPS OPTIONNELS V1 === */}
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fleet.year} (optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ""}
                        placeholder="Ex: 2020"
                        data-testid="input-year"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Message pédagogique V1 */}
              <div className="p-3 rounded-md bg-muted/50 border">
                <p className="text-xs text-muted-foreground text-center">
                  Ces informations servent uniquement à structurer votre dossier avant Taxas.
                </p>
              </div>

              {/* 
                === CHAMPS MASQUÉS V1 (soft-hide) ===
                Les champs suivants sont conservés dans le schéma mais masqués côté UI.
                Réactivation possible en V2+.
                
                - licensePlate (plaque d'immatriculation)
                - plateColor (couleur de plaque)
                - chassisNumber (numéro de châssis)
                - registrationNumber (numéro de matricule)
                - rcNumber (numéro RC Taxas)
                - power (puissance kW)
                - isEligible (toggle éligibilité - interprétation légale)
              */}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  {t.common.cancel}
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-machine"
                >
                  {t.common.save}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingMachine} onOpenChange={() => setDeletingMachine(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.common.confirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.fleet.deleteConfirm}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingMachine && deleteMutation.mutate(deletingMachine.id)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete"
            >
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
