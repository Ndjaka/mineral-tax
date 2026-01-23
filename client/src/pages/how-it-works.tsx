import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Truck, Fuel, Calculator, FileText, Building2 } from "lucide-react";
import { AppFooter } from "@/components/app-footer";

import fleetImage from "@assets/generated_images/fleet_registration_illustration.png";
import fuelImage from "@assets/generated_images/fuel_ticket_scanning_illustration.png";
import calculationImage from "@assets/generated_images/reimbursement_calculation_illustration.png";
import reportImage from "@assets/generated_images/pdf_report_generation_illustration.png";
import taxasImage from "@assets/generated_images/taxas_submission_illustration.png";

const steps = [
  { image: fleetImage, icon: Truck, color: "bg-primary" },
  { image: fuelImage, icon: Fuel, color: "bg-primary/80" },
  { image: calculationImage, icon: Calculator, color: "bg-accent-foreground" },
  { image: reportImage, icon: FileText, color: "bg-muted-foreground" },
  { image: taxasImage, icon: Building2, color: "bg-destructive" },
];

export default function HowItWorks() {
  const { t } = useI18n();
  const hp = t.howItWorksPage;

  const stepKeys = ["step1", "step2", "step3", "step4", "step5"] as const;

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4" data-testid="badge-rate">
              {hp.rate}: {hp.rateValue}
            </Badge>
            <h1 className="text-3xl font-semibold mb-4" data-testid="text-how-it-works-title">
              {hp.title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-how-it-works-subtitle">
              {hp.subtitle}
            </p>
          </div>

          <div className="space-y-16">
            {stepKeys.map((stepKey, index) => {
              const step = steps[index];
              const Icon = step.icon;
              const titleKey = `${stepKey}Title` as keyof typeof hp;
              const descKey = `${stepKey}Desc` as keyof typeof hp;
              const featuresKey = `${stepKey}Features` as keyof typeof hp;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={stepKey}
                  className={`flex flex-col flex-wrap ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 items-center`}
                  data-testid={`section-${stepKey}`}
                >
                  <div className="w-full lg:w-1/2">
                    <Card className="overflow-hidden">
                      <img
                        src={step.image}
                        alt={hp[titleKey] as string}
                        className="w-full h-auto object-cover"
                        loading="lazy"
                        width="800"
                        height="600"
                        data-testid={`img-${stepKey}`}
                      />
                    </Card>
                  </div>

                  <div className="w-full lg:w-1/2 space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className={`p-3 rounded-full ${step.color} text-primary-foreground`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <Badge variant="outline" className="text-lg px-3 py-1" data-testid={`badge-${stepKey}-number`}>
                        {index + 1}
                      </Badge>
                    </div>

                    <h2 className="text-xl font-medium" data-testid={`text-${stepKey}-title`}>
                      {hp[titleKey] as string}
                    </h2>

                    <p className="text-muted-foreground text-base" data-testid={`text-${stepKey}-desc`}>
                      {hp[descKey] as string}
                    </p>

                    <ul className="space-y-2 pt-2">
                      {(hp[featuresKey] as unknown as string[]).map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center gap-2 text-sm" data-testid={`text-${stepKey}-feature-${fIndex}`}>
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-24 p-8 rounded-3xl bg-primary/5 border border-primary/10 text-center space-y-6">
            <h2 className="text-2xl font-semibold" data-testid="text-cta-title">
              {hp.ctaTitle}
            </h2>
            <p className="text-muted-foreground" data-testid="text-cta-subtitle">
              {hp.ctaSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="rounded-full px-8" asChild data-testid="button-cta-start">
                <Link href="/auth">{hp.ctaButton}</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8" asChild data-testid="button-cta-login">
                <Link href="/auth">{hp.ctaLogin}</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t">
          <p className="text-center text-sm text-muted-foreground px-4">
            {t.landing.legalSource}
          </p>
        </div>
      </div>
      <AppFooter />
    </>
  );
}
