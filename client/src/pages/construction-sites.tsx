import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Building2, MapPin, Calendar, Info, HardHat, Wrench, ArrowLeft } from "lucide-react";
import type { ConstructionSite, Machine, MachineSiteAssignment } from "@shared/schema";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// Schéma de validation frontend
const siteFormSchema = z.object({
    name: z.string().min(1, "Nom du chantier requis"),
    location: z.string().optional(),
    startDate: z.string().min(1, "Date de début requise"),
    endDate: z.string().optional(),
    status: z.enum(["active", "completed"]).default("active"),
    fiscalYear: z.coerce.number().min(2020).max(2100),
    notes: z.string().optional(),
});

type SiteFormData = z.infer<typeof siteFormSchema>;

// Schéma pour les affectations
const assignmentFormSchema = z.object({
    machineId: z.string().min(1, "Machine requise"),
    startDate: z.string().min(1, "Date de début requise"),
    endDate: z.string().optional(),
    comment: z.string().optional(),
});

type AssignmentFormData = z.infer<typeof assignmentFormSchema>;

// Types de machines agricoles à exclure pour le secteur BTP
const AGRICULTURE_MACHINE_TYPES = [
    "tractor", "combine_harvester", "forage_harvester", "sprayer", "seeder",
    "baler", "tedder", "mower", "trailer", "slurry_tanker", "forestry_tractor", "vineyard_tractor"
];

export default function ConstructionSitesPage() {
    const { t } = useI18n();
    const { toast } = useToast();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingSite, setEditingSite] = useState<ConstructionSite | null>(null);
    const [siteToDelete, setSiteToDelete] = useState<ConstructionSite | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>("all");

    // États pour le mode détail et affectations
    const [viewingSite, setViewingSite] = useState<ConstructionSite | null>(null);
    const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState<(MachineSiteAssignment & { machine?: Machine }) | null>(null);
    const [deleteAssignmentDialogOpen, setDeleteAssignmentDialogOpen] = useState(false);

    const currentYear = new Date().getFullYear();

    // Récupération des chantiers
    const { data: sites, isLoading } = useQuery<ConstructionSite[]>({
        queryKey: ["/api/construction-sites"],
    });

    // Récupération des machines pour affectations
    const { data: machines } = useQuery<Machine[]>({
        queryKey: ["/api/machines"],
    });

    // Récupération des affectations pour le chantier sélectionné
    const { data: siteAssignments, isLoading: assignmentsLoading } = useQuery<(MachineSiteAssignment & { machine?: Machine })[]>({
        queryKey: [`/api/construction-sites/${viewingSite?.id}/assignments`],
        enabled: !!viewingSite,
    });

    // Filtrer machines BTP uniquement (exclure types agricoles)
    const btpMachines = machines?.filter(m => !AGRICULTURE_MACHINE_TYPES.includes(m.type)) || [];

    // Formulaire chantier
    const form = useForm<SiteFormData>({
        resolver: zodResolver(siteFormSchema),
        defaultValues: {
            name: "",
            location: "",
            startDate: "",
            endDate: "",
            status: "active",
            fiscalYear: currentYear,
            notes: "",
        },
    });

    // Formulaire affectation
    const assignmentForm = useForm<AssignmentFormData>({
        resolver: zodResolver(assignmentFormSchema),
        defaultValues: {
            machineId: "",
            startDate: "",
            endDate: "",
            comment: "",
        },
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (data: SiteFormData) => {
            const response = await apiRequest("POST", "/api/construction-sites", data);
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Erreur serveur: réponse invalide");
            }
            return await response.json() as ConstructionSite;
        },
        onSuccess: async (newSite: ConstructionSite) => {
            // Mise à jour optimiste immédiate du cache
            queryClient.setQueryData<ConstructionSite[]>(["/api/construction-sites"], (oldData) => {
                return oldData ? [newSite, ...oldData] : [newSite];
            });
            // Forcer le refetch malgré staleTime: Infinity
            await queryClient.refetchQueries({ queryKey: ["/api/construction-sites"] });
            toast({ title: "Chantier créé avec succès" });
            handleCloseDialog();
        },
        onError: (error: any) => {
            toast({ title: error?.message || "Erreur lors de la création", variant: "destructive" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: SiteFormData }) => {
            const response = await apiRequest("PATCH", `/api/construction-sites/${id}`, data);
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Erreur serveur: réponse invalide");
            }
            return await response.json() as ConstructionSite;
        },
        onSuccess: async (updatedSite: ConstructionSite) => {
            // Mise à jour optimiste immédiate du cache
            queryClient.setQueryData<ConstructionSite[]>(["/api/construction-sites"], (oldData) => {
                return oldData?.map(s => s.id === updatedSite.id ? updatedSite : s) || [];
            });
            await queryClient.refetchQueries({ queryKey: ["/api/construction-sites"] });
            toast({ title: "Chantier modifié avec succès" });
            handleCloseDialog();
        },
        onError: (error: any) => {
            toast({ title: error?.message || "Erreur lors de la modification", variant: "destructive" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiRequest("DELETE", `/api/construction-sites/${id}`),
        onSuccess: async (_data, deletedId) => {
            // Mise à jour optimiste immédiate du cache
            queryClient.setQueryData<ConstructionSite[]>(["/api/construction-sites"], (oldData) => {
                return oldData?.filter(s => s.id !== deletedId) || [];
            });
            await queryClient.refetchQueries({ queryKey: ["/api/construction-sites"] });
            toast({ title: "Chantier supprimé" });
            setSiteToDelete(null);
            setDeleteDialogOpen(false);
        },
        onError: (error: any) => {
            toast({ title: error?.message || "Erreur lors de la suppression", variant: "destructive" });
        },
    });

    // Mutation création affectation
    const createAssignmentMutation = useMutation({
        mutationFn: async (data: AssignmentFormData & { siteId: string }) => {
            const response = await apiRequest("POST", "/api/machine-site-assignments", {
                ...data,
                startDate: new Date(data.startDate).toISOString(),
                endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
            });
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Erreur serveur: réponse invalide");
            }
            return await response.json();
        },
        onSuccess: async () => {
            await queryClient.refetchQueries({ queryKey: [`/api/construction-sites/${viewingSite?.id}/assignments`] });
            toast({ title: "Machine affectée au chantier" });
            setAssignmentDialogOpen(false);
            assignmentForm.reset();
        },
        onError: (error: any) => {
            toast({ title: error?.message || "Erreur lors de l'affectation", variant: "destructive" });
        },
    });

    // Mutation suppression affectation
    const deleteAssignmentMutation = useMutation({
        mutationFn: (id: string) => apiRequest("DELETE", `/api/machine-site-assignments/${id}`),
        onSuccess: async () => {
            await queryClient.refetchQueries({ queryKey: [`/api/construction-sites/${viewingSite?.id}/assignments`] });
            toast({ title: "Affectation supprimée" });
            setAssignmentToDelete(null);
            setDeleteAssignmentDialogOpen(false);
        },
        onError: (error: any) => {
            toast({ title: error?.message || "Erreur lors de la suppression", variant: "destructive" });
        },
    });

    const handleOpenDialog = (site?: ConstructionSite) => {
        if (site) {
            setEditingSite(site);
            form.reset({
                name: site.name,
                location: site.location || "",
                startDate: site.startDate ? new Date(site.startDate).toISOString().split("T")[0] : "",
                endDate: site.endDate ? new Date(site.endDate).toISOString().split("T")[0] : "",
                status: site.status,
                fiscalYear: site.fiscalYear,
                notes: site.notes || "",
            });
        } else {
            setEditingSite(null);
            form.reset({
                name: "",
                location: "",
                startDate: "",
                endDate: "",
                status: "active",
                fiscalYear: currentYear,
                notes: "",
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingSite(null);
        form.reset();
    };

    const handleDelete = (site: ConstructionSite) => {
        setSiteToDelete(site);
        setDeleteDialogOpen(true);
    };

    const onSubmit = (data: SiteFormData) => {
        if (editingSite) {
            updateMutation.mutate({ id: editingSite.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    // Filtrer par année
    const filteredSites = sites?.filter((site) => {
        if (selectedYear === "all") return true;
        return site.fiscalYear === parseInt(selectedYear);
    });

    // Statistiques
    const activeSites = sites?.filter((s) => s.status === "active").length || 0;
    const completedSites = sites?.filter((s) => s.status === "completed").length || 0;

    // Années disponibles pour le filtre
    const availableYears = Array.from(new Set(sites?.map((s) => s.fiscalYear) || [])).sort((a, b) => b - a);

    const formatDate = (date: string | Date | null) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("fr-CH");
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Building2 className="h-6 w-6 text-blue-600" />
                        <h1 className="text-2xl md:text-3xl font-bold text-blue-700">
                            Chantiers BTP
                        </h1>
                    </div>
                    <p className="text-muted-foreground">
                        Gestion et traçabilité des chantiers
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau chantier
                </Button>
            </div>

            {/* Disclaimer légal */}
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800 border-l-4 border-l-blue-500">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800 dark:text-blue-300">Traçabilité BTP</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400">
                    Pour le secteur BTP, MineralTax aide à structurer la traçabilité
                    machine ↔ chantier ↔ carburant.
                    La décision finale de remboursement appartient à l'OFDF.
                </AlertDescription>
            </Alert>

            {/* Indicateurs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Chantiers actifs</p>
                                <p className="text-2xl font-bold font-mono text-blue-600">{activeSites}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-blue-100">
                                <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Terminés</p>
                                <p className="text-2xl font-bold font-mono text-green-600">{completedSites}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-green-100">
                                <HardHat className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Machines BTP</p>
                                <p className="text-2xl font-bold font-mono text-amber-600">{machines?.length || 0}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-amber-100">
                                <HardHat className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtre par année */}
            <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Année fiscale :</span>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes</SelectItem>
                        {availableYears.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                                {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Liste des chantiers */}
            <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        Liste des chantiers
                    </CardTitle>
                    <CardDescription>
                        {filteredSites?.length || 0} chantier(s) enregistré(s)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-20 w-full" />
                            ))}
                        </div>
                    ) : filteredSites && filteredSites.length > 0 ? (
                        <div className="space-y-3">
                            {filteredSites.map((site) => (
                                <div
                                    key={site.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/50 rounded-lg gap-3"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold truncate">{site.name}</span>
                                            <Badge variant={site.status === "active" ? "default" : "secondary"}>
                                                {site.status === "active" ? "En cours" : "Terminé"}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                            {site.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {site.location}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(site.startDate)} - {site.endDate ? formatDate(site.endDate) : "En cours"}
                                            </span>
                                            <Badge variant="outline">{site.fiscalYear}</Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setViewingSite(site)}
                                            className="text-blue-600 hover:text-blue-700"
                                        >
                                            <Wrench className="h-4 w-4 mr-1" />
                                            Affectations
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleOpenDialog(site)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(site)}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>Aucun chantier enregistré</p>
                            <p className="text-sm">Cliquez sur "Nouveau chantier" pour commencer</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog création/édition */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingSite ? "Modifier le chantier" : "Nouveau chantier"}
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nom du chantier *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Rénovation immeuble Lausanne" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Localisation</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Lausanne, Vaud" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date de début *</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date de fin</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="fiscalYear"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Année fiscale *</FormLabel>
                                            <FormControl>
                                                <Input type="number" min={2020} max={2100} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Statut</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="active">En cours</SelectItem>
                                                    <SelectItem value="completed">Terminé</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Informations complémentaires..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                >
                                    {editingSite ? "Enregistrer" : "Créer"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Dialog suppression */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce chantier ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Le chantier "{siteToDelete?.name}" sera supprimé définitivement,
                            ainsi que toutes les affectations de machines associées.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => siteToDelete && deleteMutation.mutate(siteToDelete.id)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog détail chantier avec affectations */}
            <Dialog open={!!viewingSite} onOpenChange={(open) => !open && setViewingSite(null)}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ArrowLeft
                                className="h-5 w-5 cursor-pointer hover:text-blue-600"
                                onClick={() => setViewingSite(null)}
                            />
                            <Building2 className="h-5 w-5 text-blue-600" />
                            {viewingSite?.name}
                        </DialogTitle>
                    </DialogHeader>

                    {viewingSite && (
                        <div className="space-y-6">
                            {/* Infos chantier */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Lieu:</span>
                                    <span className="ml-2 font-medium">{viewingSite.location || "-"}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Statut:</span>
                                    <Badge variant={viewingSite.status === "active" ? "default" : "secondary"} className="ml-2">
                                        {viewingSite.status === "active" ? "En cours" : "Terminé"}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Période:</span>
                                    <span className="ml-2 font-medium">
                                        {formatDate(viewingSite.startDate)} - {viewingSite.endDate ? formatDate(viewingSite.endDate) : "En cours"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Année fiscale:</span>
                                    <Badge variant="outline" className="ml-2">{viewingSite.fiscalYear}</Badge>
                                </div>
                            </div>

                            {/* Section affectations */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                        <Wrench className="h-5 w-5 text-blue-600" />
                                        Machines affectées
                                    </h3>
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            assignmentForm.reset({
                                                machineId: "",
                                                startDate: viewingSite.startDate ? new Date(viewingSite.startDate).toISOString().split("T")[0] : "",
                                                endDate: "",
                                                comment: "",
                                            });
                                            setAssignmentDialogOpen(true);
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Affecter machine
                                    </Button>
                                </div>

                                {assignmentsLoading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-12 w-full" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                ) : siteAssignments && siteAssignments.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Machine</TableHead>
                                                <TableHead>Période</TableHead>
                                                <TableHead>Commentaire</TableHead>
                                                <TableHead className="w-20">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {siteAssignments.map((assignment) => (
                                                <TableRow key={assignment.id}>
                                                    <TableCell className="font-medium">
                                                        {assignment.machine?.name || "Machine inconnue"}
                                                        <span className="text-xs text-muted-foreground ml-2">
                                                            ({assignment.machine?.type})
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(assignment.startDate)}
                                                        {assignment.endDate && ` - ${formatDate(assignment.endDate)}`}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {assignment.comment || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setAssignmentToDelete(assignment);
                                                                setDeleteAssignmentDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                                        <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>Aucune machine affectée à ce chantier</p>
                                        <p className="text-sm">Cliquez sur "Affecter machine" pour commencer</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Dialog ajout affectation */}
            <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Affecter une machine</DialogTitle>
                    </DialogHeader>
                    <Form {...assignmentForm}>
                        <form onSubmit={assignmentForm.handleSubmit((data) => {
                            if (viewingSite) {
                                createAssignmentMutation.mutate({ ...data, siteId: viewingSite.id });
                            }
                        })} className="space-y-4">
                            <FormField
                                control={assignmentForm.control}
                                name="machineId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Machine BTP *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner une machine" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {btpMachines.length > 0 ? (
                                                    btpMachines.map((machine) => (
                                                        <SelectItem key={machine.id} value={machine.id}>
                                                            {machine.name} ({machine.type})
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                                        Aucune machine BTP disponible.
                                                        <br />
                                                        Créez des machines dans le Parc machines.
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={assignmentForm.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date début *</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={assignmentForm.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date fin</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={assignmentForm.control}
                                name="comment"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Commentaire</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Notes sur l'affectation..."
                                                className="resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setAssignmentDialogOpen(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={createAssignmentMutation.isPending}>
                                    Affecter
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Dialog suppression affectation */}
            <AlertDialog open={deleteAssignmentDialogOpen} onOpenChange={setDeleteAssignmentDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer cette affectation ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            La machine "{assignmentToDelete?.machine?.name}" ne sera plus affectée à ce chantier.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => assignmentToDelete && deleteAssignmentMutation.mutate(assignmentToDelete.id)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
