import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { ScrollText } from "lucide-react";

export function AppFooter() {
  const { t } = useI18n();

  return (
    <footer className="border-t py-4 px-6 mt-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>&copy; 2026 MineralTax Swiss</span>
        <Link 
          href="/terms" 
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          data-testid="link-terms-app-footer"
        >
          <ScrollText className="h-4 w-4" />
          <span>{t.nav.terms}</span>
        </Link>
      </div>
    </footer>
  );
}
