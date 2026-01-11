import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Truck, Search } from "lucide-react";
import type { Machine } from "@shared/schema";

const machineTypes = [
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

const machineFormSchema = z.object({
  name: z.string().min(1),
  type: z.enum(machineTypes),
  chassisNumber: z.string().optional(),
  year: z.coerce.number().min(1900).max(2100).optional(),
  isEligible: z.boolean().default(true),
});

type MachineFormData = z.infer<typeof machineFormSchema>;

export default function FleetPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [deletingMachine, setDeletingMachine] = useState<Machine | null>(null);

  const form = useForm<MachineFormData>({
    resolver: zodResolver(machineFormSchema),
    defaultValues: {
      name: "",
      type: "excavator",
      chassisNumber: "",
      year: undefined,
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
    onError: () => {
      toast({ title: t.common.error, variant: "destructive" });
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
    if (machine) {
      setEditingMachine(machine);
      form.reset({
        name: machine.name,
        type: machine.type as typeof machineTypes[number],
        chassisNumber: machine.chassisNumber || "",
        year: machine.year || undefined,
        isEligible: machine.isEligible,
      });
    } else {
      setEditingMachine(null);
      form.reset({
        name: "",
        type: "excavator",
        chassisNumber: "",
        year: undefined,
        isEligible: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingMachine(null);
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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-fleet-title">
            {t.fleet.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            {machines?.length || 0} {t.dashboard.activeMachines.toLowerCase()}
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} data-testid="button-add-machine">
          <Plus className="h-4 w-4 mr-2" />
          {t.fleet.addMachine}
        </Button>
      </div>

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
                  {machine.chassisNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.fleet.chassisNumber}</span>
                      <span className="font-mono">{machine.chassisNumber}</span>
                    </div>
                  )}
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
              {t.fleet.addMachine}
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              {t.fleet.addMachine}
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
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
                        {machineTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {getMachineTypeLabel(type)}
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
                name="chassisNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fleet.chassisNumber}</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-chassis-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.fleet.year}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ""}
                        data-testid="input-year"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isEligible"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t.fleet.eligible}</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        {t.calculator.eligibilityNote}
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-eligible"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

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
