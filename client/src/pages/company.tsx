import { useEffect } from "react";
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
import { Building2, MapPin, User, Landmark, Save, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const swissCantons = [
  "AG", "AI", "AR", "BE", "BL", "BS", "FR", "GE", "GL", "GR",
  "JU", "LU", "NE", "NW", "OW", "SG", "SH", "SO", "SZ", "TG",
  "TI", "UR", "VD", "VS", "ZG", "ZH"
] as const;

const companyFormSchema = z.object({
  companyName: z.string().min(1, "Required"),
  ideNumber: z.string().optional(),
  street: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  canton: z.string().optional(),
  country: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  bankName: z.string().optional(),
  iban: z.string().optional(),
  bic: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companyFormSchema>;

interface CompanyProfile {
  id: string;
  userId: string;
  companyName: string;
  ideNumber?: string | null;
  street?: string | null;
  postalCode?: string | null;
  city?: string | null;
  canton?: string | null;
  country?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  bankName?: string | null;
  iban?: string | null;
  bic?: string | null;
}

export default function CompanyPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const { data: profile, isLoading } = useQuery<CompanyProfile | null>({
    queryKey: ["/api/company-profile"],
  });

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      companyName: "",
      ideNumber: "",
      street: "",
      postalCode: "",
      city: "",
      canton: "",
      country: "Suisse",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      bankName: "",
      iban: "",
      bic: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        companyName: profile.companyName || "",
        ideNumber: profile.ideNumber || "",
        street: profile.street || "",
        postalCode: profile.postalCode || "",
        city: profile.city || "",
        canton: profile.canton || "",
        country: profile.country || "Suisse",
        contactName: profile.contactName || "",
        contactEmail: profile.contactEmail || "",
        contactPhone: profile.contactPhone || "",
        bankName: profile.bankName || "",
        iban: profile.iban || "",
        bic: profile.bic || "",
      });
    }
  }, [profile, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      return apiRequest("POST", "/api/company-profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-profile"] });
      toast({
        title: t.common.success,
        description: t.company.saveSuccess,
      });
    },
    onError: () => {
      toast({
        title: t.common.error,
        description: t.company.saveError,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CompanyFormData) => {
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">{t.company.title}</h1>
        <p className="text-sm md:text-base text-muted-foreground">{t.company.subtitle}</p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {t.company.requiredForTaxas}
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {t.company.companyName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.company.companyName} *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ma Société SA" {...field} data-testid="input-company-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ideNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.company.ideNumber}</FormLabel>
                    <FormControl>
                      <Input placeholder="CHE-123.456.789" {...field} data-testid="input-ide-number" />
                    </FormControl>
                    <FormDescription>{t.company.ideHelp}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t.company.address}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.company.street}</FormLabel>
                    <FormControl>
                      <Input placeholder="Rue de l'Industrie 10" {...field} data-testid="input-street" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.company.postalCode}</FormLabel>
                      <FormControl>
                        <Input placeholder="1000" {...field} data-testid="input-postal-code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.company.city}</FormLabel>
                      <FormControl>
                        <Input placeholder="Lausanne" {...field} data-testid="input-city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="canton"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.company.canton}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-canton">
                            <SelectValue placeholder={t.company.canton} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {swissCantons.map((canton) => (
                            <SelectItem key={canton} value={canton}>
                              {canton}
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
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.company.country}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-country" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t.company.contact}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.company.contactName}</FormLabel>
                    <FormControl>
                      <Input placeholder="Jean Dupont" {...field} data-testid="input-contact-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.company.contactEmail}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@example.ch" {...field} data-testid="input-contact-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.company.contactPhone}</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+41 21 123 45 67" {...field} data-testid="input-contact-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5" />
                {t.company.bankDetails}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.company.bankName}</FormLabel>
                    <FormControl>
                      <Input placeholder="UBS, Credit Suisse, PostFinance..." {...field} data-testid="input-bank-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="iban"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.company.iban}</FormLabel>
                    <FormControl>
                      <Input placeholder="CH93 0076 2011 6238 5295 7" {...field} data-testid="input-iban" />
                    </FormControl>
                    <FormDescription>{t.company.ibanHelp}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.company.bic}</FormLabel>
                    <FormControl>
                      <Input placeholder="UBSWCHZH80A" {...field} data-testid="input-bic" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saveMutation.isPending} data-testid="button-save-company">
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? t.common.loading : t.common.save}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
