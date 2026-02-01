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
    FormDescription,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, TreePine, Droplets, Wheat, Leaf } from "lucide-react";
import type { AgriculturalSurface } from "@shared/schema";

// Types de cultures avec emojis
const cultureTypes = [
    { value: "cereals", emoji: "🌾" },
    { value: "vegetables", emoji: "🥬" },
    { value: "vineyard", emoji: "🍇" },
    { value: "fruit_trees", emoji: "🍎" },
    { value: "pasture", emoji: "🌿" },
    { value: "fodder", emoji: "🌱" },
    { value: "industrial_crops", emoji: "🌻" },
    { value: "other_crops", emoji: "🪴" },
] as const;

// Schéma de validation frontend
const surfaceFormSchema = z.object({
    totalHectares: z.coerce.number().positive("La surface doit être positive"),
    cultureType: z.string().optional(),
    usageDescription: z.string().optional(),
    irrigation: z.boolean().default(false),
    declarationYear: z.coerce.number().min(2020).max(2100),
});

type SurfaceFormData = z.infer<typeof surfaceFormSchema>;

export default function AgriculturalSurfaces() {
    const { t } = useI18n();
    const { toast } = useToast();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingSurface, setEditingSurface] = useState<AgriculturalSurface | null>(null);
    const [surfaceToDelete, setSurfaceToDelete] = useState<AgriculturalSurface | null>(null);

    const currentYear = new Date().getFullYear();

    // Récupération des surfaces
    const { data: surfaces, isLoading } = useQuery<AgriculturalSurface[]>({
        queryKey: ["/api/agricultural-surfaces"],
    });

    // Formulaire
    const form = useForm<SurfaceFormData>({
        resolver: zodResolver(surfaceFormSchema),
        defaultValues: {
            totalHectares: 0,
            cultureType: undefined,
            usageDescription: "",
            irrigation: false,
            declarationYear: currentYear,
        },
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: async (data: SurfaceFormData) => {
            return apiRequest("POST", "/api/agricultural-surfaces", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/agricultural-surfaces"] });
            toast({
                title: t.agriculturalSurfaces?.created || "Surface créée",
                description: t.agriculturalSurfaces?.createdDescription || "La surface a été ajoutée avec succès.",
            });
            setDialogOpen(false);
            form.reset();
        },
        onError: () => {
            toast({
                title: t.common.error,
                description: t.agriculturalSurfaces?.createError || "Erreur lors de la création.",
                variant: "destructive",
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: SurfaceFormData }) => {
            return apiRequest("PATCH", `/api/agricultural-surfaces/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/agricultural-surfaces"] });
            toast({
                title: t.agriculturalSurfaces?.updated || "Surface modifiée",
                description: t.agriculturalSurfaces?.updatedDescription || "La surface a été mise à jour.",
            });
            setDialogOpen(false);
            setEditingSurface(null);
            form.reset();
        },
        onError: () => {
            toast({
                title: t.common.error,
                description: t.agriculturalSurfaces?.updateError || "Erreur lors de la modification.",
                variant: "destructive",
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return apiRequest("DELETE", `/api/agricultural-surfaces/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/agricultural-surfaces"] });
            toast({
                title: t.agriculturalSurfaces?.deleted || "Surface supprimée",
                description: t.agriculturalSurfaces?.deletedDescription || "La surface a été supprimée.",
            });
            setDeleteDialogOpen(false);
            setSurfaceToDelete(null);
        },
        onError: () => {
            toast({
                title: t.common.error,
                description: t.agriculturalSurfaces?.deleteError || "Erreur lors de la suppression.",
                variant: "destructive",
            });
        },
    });

    // Handlers
    const openAddDialog = () => {
        setEditingSurface(null);
        form.reset({
            totalHectares: 0,
            cultureType: undefined,
            usageDescription: "",
            irrigation: false,
            declarationYear: currentYear,
        });
        setDialogOpen(true);
    };

    const openEditDialog = (surface: AgriculturalSurface) => {
        setEditingSurface(surface);
        form.reset({
            totalHectares: surface.totalHectares,
            cultureType: surface.cultureType || undefined,
            usageDescription: surface.usageDescription || "",
            irrigation: surface.irrigation || false,
            declarationYear: surface.declarationYear,
        });
        setDialogOpen(true);
    };

    const openDeleteDialog = (surface: AgriculturalSurface) => {
        setSurfaceToDelete(surface);
        setDeleteDialogOpen(true);
    };

    const onSubmit = (data: SurfaceFormData) => {
        if (editingSurface) {
            updateMutation.mutate({ id: editingSurface.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    // Traduction type de culture
    const getCultureLabel = (type: string | null) => {
        if (!type) return "-";
        return t.agriculturalSurfaces?.cultureTypes?.[type] || type;
    };

    const getCultureEmoji = (type: string | null) => {
        const found = cultureTypes.find(c => c.value === type);
        return found?.emoji || "🌱";
    };

    // Calcul totaux (purement informatif)
    const totalHectares = surfaces?.reduce((sum, s) => sum + s.totalHectares, 0) || 0;
    const cultureCount = new Set(surfaces?.map(s => s.cultureType).filter(Boolean)).size;

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            {/* En-tête */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <TreePine className="h-6 w-6 text-green-600" />
                        <h1 className="text-2xl md:text-3xl font-bold text-green-700">
                            {t.agriculturalSurfaces?.title || "Surfaces Agricoles"}
                        </h1>
                    </div>
                    <p className="text-muted-foreground">
                        {t.agriculturalSurfaces?.subtitle || "Déclaration des surfaces exploitées"}
                    </p>
                </div>
                <Button onClick={openAddDialog} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    {t.agriculturalSurfaces?.add || "Ajouter une surface"}
                </Button>
            </div>

            {/* Badge secteur Agriculture */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-medium border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                <TreePine className="h-4 w-4" />
                <span>Agriculture – régime forfaitaire (Art. 18 LMin)</span>
            </div>

            {/* Disclaimer légal obligatoire */}
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800 border-l-4 border-l-green-500">
                <Leaf className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 dark:text-green-300">
                    {t.agriculturalSurfaces?.disclaimerTitle || "Données déclaratives"}
                </AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-400">
                    {t.agriculturalSurfaces?.disclaimer ||
                        "Les surfaces sont utilisées uniquement pour vérifier la cohérence du dossier. Le remboursement est calculé par l'OFDF selon les normes forfaitaires en vigueur (Art. 18 LMin)."}
                </AlertDescription>
            </Alert>

            {/* Indicateurs informatifs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t.agriculturalSurfaces?.totalHectares || "Surface totale"}
                                </p>
                                <p className="text-2xl font-bold font-mono text-green-600">
                                    {totalHectares.toFixed(2)} ha
                                </p>
                            </div>
                            <div className="p-2 rounded-lg bg-green-100">
                                <Wheat className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t.agriculturalSurfaces?.cultureCount || "Types de cultures"}
                                </p>
                                <p className="text-2xl font-bold font-mono text-green-600">
                                    {cultureCount}
                                </p>
                            </div>
                            <div className="p-2 rounded-lg bg-green-100">
                                <TreePine className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {t.agriculturalSurfaces?.declarations || "Déclarations"}
                                </p>
                                <p className="text-2xl font-bold font-mono text-green-600">
                                    {surfaces?.length || 0}
                                </p>
                            </div>
                            <div className="p-2 rounded-lg bg-green-100">
                                <Leaf className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Liste des surfaces */}
            <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wheat className="h-5 w-5 text-green-600" />
                        {t.agriculturalSurfaces?.listTitle || "Surfaces déclarées"}
                    </CardTitle>
                    <CardDescription>
                        {t.agriculturalSurfaces?.listDescription || "Liste de vos surfaces agricoles par type de culture et année"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-20 w-full" />
                            ))}
                        </div>
                    ) : surfaces && surfaces.length > 0 ? (
                        <div className="space-y-3">
                            {surfaces.map((surface) => (
                                <div
                                    key={surface.id}
                                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-3xl">{getCultureEmoji(surface.cultureType)}</div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {getCultureLabel(surface.cultureType)}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    ({surface.declarationYear})
                                                </span>
                                                {surface.irrigation && (
                                                    <Droplets className="h-4 w-4 text-blue-500" />
                                                )}
                                            </div>
                                            <p className="text-lg font-bold font-mono text-green-600">
                                                {surface.totalHectares.toFixed(2)} ha
                                            </p>
                                            {surface.usageDescription && (
                                                <p className="text-sm text-muted-foreground">
                                                    {surface.usageDescription}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEditDialog(surface)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => openDeleteDialog(surface)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <TreePine className="h-16 w-16 mx-auto mb-4 opacity-30 text-green-600" />
                            <p className="text-lg font-medium">
                                {t.agriculturalSurfaces?.empty || "Aucune surface déclarée"}
                            </p>
                            <p className="text-sm mt-1">
                                {t.agriculturalSurfaces?.emptyHint || "Commencez par ajouter vos surfaces agricoles"}
                            </p>
                            <Button onClick={openAddDialog} variant="outline" className="mt-4">
                                <Plus className="h-4 w-4 mr-2" />
                                {t.agriculturalSurfaces?.add || "Ajouter une surface"}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog ajout/modification */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingSurface
                                ? (t.agriculturalSurfaces?.editTitle || "Modifier la surface")
                                : (t.agriculturalSurfaces?.addTitle || "Ajouter une surface")}
                        </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="totalHectares"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t.agriculturalSurfaces?.hectaresLabel || "Surface (hectares)"} *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                placeholder="12.50"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="cultureType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t.agriculturalSurfaces?.cultureTypeLabel || "Type de culture"}
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t.agriculturalSurfaces?.selectCulture || "Sélectionner..."} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {cultureTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        <span className="flex items-center gap-2">
                                                            <span>{type.emoji}</span>
                                                            <span>{getCultureLabel(type.value)}</span>
                                                        </span>
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
                                name="declarationYear"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t.agriculturalSurfaces?.yearLabel || "Année de déclaration"} *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="2020"
                                                max="2100"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="usageDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t.agriculturalSurfaces?.descriptionLabel || "Description (optionnel)"}
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t.agriculturalSurfaces?.descriptionPlaceholder || "Ex: Parcelle nord, blé d'hiver"}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="irrigation"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <FormLabel>
                                                {t.agriculturalSurfaces?.irrigationLabel || "Irrigation"}
                                            </FormLabel>
                                            <FormDescription className="text-xs">
                                                {t.agriculturalSurfaces?.irrigationHint || "Cette parcelle est-elle irriguée ?"}
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                >
                                    {t.common.cancel}
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                >
                                    {editingSurface ? t.common.save : (t.agriculturalSurfaces?.add || "Ajouter")}
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
                        <AlertDialogTitle>
                            {t.agriculturalSurfaces?.deleteTitle || "Supprimer cette surface ?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {t.agriculturalSurfaces?.deleteDescription ||
                                "Cette action est irréversible. La surface sera définitivement supprimée."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => surfaceToDelete && deleteMutation.mutate(surfaceToDelete.id)}
                        >
                            {t.common.delete}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
