import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail } from "lucide-react";

export default function TermsPage() {
  const { t } = useI18n();

  const sections = [
    { title: t.terms.section1Title, content: t.terms.section1Content },
    { title: t.terms.section2Title, content: t.terms.section2Content },
    { title: t.terms.section3Title, content: t.terms.section3Content },
    { title: t.terms.section4Title, content: t.terms.section4Content },
    { title: t.terms.section5Title, content: t.terms.section5Content },
    { title: t.terms.section6Title, content: t.terms.section6Content },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto" data-testid="page-terms">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" data-testid="text-terms-title">
          {t.terms.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t.terms.lastUpdated}: 11.01.2026
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {sections.map((section, index) => (
            <div key={index} data-testid={`section-terms-${index + 1}`}>
              <h2 className="text-lg font-semibold mb-2">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {section.content}
              </p>
              {index < sections.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}

          <Separator />

          <div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="text-terms-contact">
            <Mail className="h-4 w-4" />
            <span>{t.terms.contact}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
