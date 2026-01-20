import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Upload,
  Download,
  Users,
  Shield,
  ClipboardList
} from "lucide-react";

export default function TaxasPage() {
  const { t } = useI18n();

  const steps = [
    {
      number: 1,
      icon: Building2,
      title: t.taxas.step1Title,
      description: t.taxas.step1Desc,
      action: t.taxas.step1Action,
      link: "https://eportal.admin.ch/"
    },
    {
      number: 2,
      icon: Users,
      title: t.taxas.step2Title,
      description: t.taxas.step2Desc,
      action: t.taxas.step2Action,
      link: "https://www.bazg.admin.ch/bazg/fr/home/services/services-firmen/registrierung-firmen/onboarding.html"
    },
    {
      number: 3,
      icon: ClipboardList,
      title: t.taxas.step3Title,
      description: t.taxas.step3Desc,
    },
    {
      number: 4,
      icon: Download,
      title: t.taxas.step4Title,
      description: t.taxas.step4Desc,
    },
    {
      number: 5,
      icon: Upload,
      title: t.taxas.step5Title,
      description: t.taxas.step5Desc,
      action: t.taxas.step5Action,
      link: "https://www.bazg.admin.ch/bazg/fr/home/services/services-entreprises/inland-abgaben_firmen/taxas.html"
    }
  ];

  const checklist = [
    t.taxas.checklist1,
    t.taxas.checklist2,
    t.taxas.checklist3,
    t.taxas.checklist4,
    t.taxas.checklist5,
    t.taxas.checklist6
  ];

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-semibold" data-testid="text-taxas-title">
            {t.taxas.title}
          </h1>
          <Badge variant="secondary">
            OFDF / BAZG
          </Badge>
        </div>
        <p className="text-sm md:text-base text-muted-foreground">
          {t.taxas.subtitle}
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {t.taxas.whatIsTaxas}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {t.taxas.taxasDescription}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline">{t.taxas.badgeDigital}</Badge>
            <Badge variant="outline">{t.taxas.badgeOfficial}</Badge>
            <Badge variant="outline">{t.taxas.badgeSecure}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t.taxas.stepsTitle}
          </CardTitle>
          <CardDescription>
            {t.taxas.stepsSubtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.number}>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {step.number}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <step.icon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                  {step.action && step.link && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => window.open(step.link, '_blank')}
                      data-testid={`button-taxas-step-${step.number}`}
                    >
                      {step.action}
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <Separator className="mt-6" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              {t.taxas.checklistTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {checklist.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              {t.taxas.importantTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                {t.taxas.deadlineWarning}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {t.taxas.deadlineInfo}
            </p>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm">
                <strong>{t.taxas.rateLabel}:</strong> 0.3405 CHF/L
              </p>
              <p className="text-sm mt-1">
                <strong>{t.taxas.formLabel}:</strong> 45.35
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.taxas.bridgeTitle}</CardTitle>
          <CardDescription>
            {t.taxas.bridgeDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 p-4 rounded-lg border bg-card">
              <h4 className="font-medium mb-2">MineralTax Swiss</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>{t.taxas.feature1}</li>
                <li>{t.taxas.feature2}</li>
                <li>{t.taxas.feature3}</li>
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg">→</span>
              </div>
            </div>
            <div className="flex-1 p-4 rounded-lg border bg-card">
              <h4 className="font-medium mb-2">Taxas (OFDF)</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>{t.taxas.taxasFeature1}</li>
                <li>{t.taxas.taxasFeature2}</li>
                <li>{t.taxas.taxasFeature3}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={() => window.open('https://eportal.admin.ch/', '_blank')}
          data-testid="button-access-eportal"
        >
          {t.taxas.accessEportal}
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
