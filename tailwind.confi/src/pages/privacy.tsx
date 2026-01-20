import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Shield, Database, CreditCard, Lock } from "lucide-react";

export default function PrivacyPage() {
  const { t } = useI18n();

  const sections = [
    {
      icon: Database,
      title: t.privacy?.dataCollection || "Collecte des données",
      content: t.privacy?.dataCollectionContent || "Nous collectons uniquement les données de consommation de carburant nécessaires à la génération de vos rapports de remboursement OFDF. Ces données incluent: les informations sur vos machines, les volumes de carburant, les dates de facturation et les numéros de facture.",
    },
    {
      icon: Lock,
      title: t.privacy?.dataStorage || "Stockage sécurisé",
      content: t.privacy?.dataStorageContent || "Toutes vos données sont stockées de manière sécurisée sur des serveurs en Suisse/Europe. Nous utilisons le chiffrement SSL/TLS pour toutes les communications et les données sont protégées par des mesures de sécurité conformes aux standards de l'industrie.",
    },
    {
      icon: CreditCard,
      title: t.privacy?.payments || "Paiements via Stripe",
      content: t.privacy?.paymentsContent || "Les paiements sont traités de manière sécurisée par Stripe, un leader mondial des solutions de paiement. Nous ne stockons jamais vos informations de carte bancaire sur nos serveurs. Stripe est certifié PCI-DSS niveau 1.",
    },
    {
      icon: Shield,
      title: t.privacy?.rights || "Vos droits",
      content: t.privacy?.rightsContent || "Conformément au RGPD et à la LPD suisse, vous avez le droit d'accéder, de rectifier et de supprimer vos données personnelles. Vous pouvez exercer ces droits à tout moment en nous contactant.",
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto" data-testid="page-privacy">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" data-testid="text-privacy-title">
          {t.privacy?.title || "Politique de confidentialité"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t.privacy?.lastUpdated || "Dernière mise à jour"}: 12.01.2026
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            {t.privacy?.intro || "MineralTax Swiss s'engage à protéger votre vie privée et à traiter vos données personnelles avec le plus grand soin. Cette politique explique comment nous collectons, utilisons et protégeons vos informations."}
          </p>

          <Separator />

          {sections.map((section, index) => (
            <div key={index} data-testid={`section-privacy-${index + 1}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">{section.title}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-12">
                {section.content}
              </p>
              {index < sections.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}

          <Separator />

          <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="text-privacy-contact">
            <Mail className="h-4 w-4" />
            <span>{t.privacy?.contact || "Pour toute question: support@mineraltax.ch"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
