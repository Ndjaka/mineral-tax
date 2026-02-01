import { Link, useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useSector } from "@/lib/sector-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Truck,
  Fuel,
  FileText,
  Settings,
  LogOut,
  Calculator,
  ScrollText,
  CreditCard,
  Send,
  Building2,
  HelpCircle,
  TreePine,
} from "lucide-react";

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
  disabledInAgri?: boolean;  // Désactivé en Agriculture
  agriOnly?: boolean;        // Visible uniquement en Agriculture
  btpOnly?: boolean;         // Visible uniquement en BTP
}

export function AppSidebar() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const { sector } = useSector();
  const isAgri = sector === "agriculture";

  // Tooltip pour les items désactivés en Agriculture
  const agriDisabledTooltip = "Fonctionnalité non applicable au secteur Agriculture (Art. 18 LMin – remboursement forfaitaire)";

  const menuItems: MenuItem[] = [
    { title: t.nav.dashboard, url: "/", icon: LayoutDashboard },
    { title: t.nav.fleet, url: "/fleet", icon: Truck },
    { title: t.agriculturalSurfaces?.title || "Surfaces agricoles", url: "/agricultural-surfaces", icon: TreePine, agriOnly: true },
    { title: "Chantiers", url: "/construction-sites", icon: Building2, btpOnly: true },
    { title: t.nav.fuelEntry, url: "/fuel", icon: Fuel, btpOnly: true },
    // SUPPRIMÉ V1 : Calculateur (Art. 18 LMin - aucun montant ne doit être affiché)
    // { title: t.calculator.title, url: "/calculator", icon: Calculator, agriOnly: true },
    { title: t.nav.reports, url: "/reports", icon: FileText, btpOnly: true },
    { title: t.nav.taxas, url: "/taxas", icon: Send },
    { title: t.company.title, url: "/company", icon: Building2 },
    // MASQUÉ V1 : Abonnement (phase tests gratuite)
    // { title: t.nav.subscription, url: "/subscription", icon: CreditCard },
    { title: t.nav.settings, url: "/settings", icon: Settings },
    // SUPPRIMÉ V1 : Comment ça marche (uniquement sur landing page)
    // { title: t.nav.howItWorks, url: "/comment-ca-marche", icon: HelpCircle },
    { title: t.nav.terms, url: "/terms", icon: ScrollText },
  ];

  // Filtrer les items selon le secteur
  const filteredMenuItems = menuItems.filter((item) => {
    // Masquer les items "agriOnly" si on n'est pas en Agriculture
    if (item.agriOnly && !isAgri) return false;
    // Masquer les items "btpOnly" si on est en Agriculture
    if (item.btpOnly && isAgri) return false;
    return true;
  });

  const userInitials = user
    ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "U"
    : "U";

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer" data-testid="link-logo">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-[#003366] flex items-center justify-center">
                <span className="text-white font-bold text-lg">MT</span>
              </div>
              {/* Indicateur vert secteur Agriculture */}
              {isAgri && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">MineralTax</span>
              <span className={`text-xs ${isAgri ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                {isAgri ? "Agriculture" : "Swiss"}
              </span>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <TooltipProvider>
              <SidebarMenu>
                {filteredMenuItems.map((item) => {
                  const isDisabled = isAgri && item.disabledInAgri;
                  const Icon = item.icon;

                  if (isDisabled) {
                    // Item désactivé avec tooltip
                    return (
                      <SidebarMenuItem key={item.title}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className="flex items-center gap-2 px-3 py-2 text-muted-foreground/50 cursor-not-allowed select-none"
                              data-testid={`nav-item-${item.url.replace("/", "") || "dashboard"}-disabled`}
                            >
                              <Icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-[250px]">
                            <p className="text-xs">{agriDisabledTooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </SidebarMenuItem>
                    );
                  }

                  // Item normal cliquable
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location === item.url}
                        data-testid={`nav-item-${item.url.replace("/", "") || "dashboard"}`}
                      >
                        <Link href={item.url}>
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </TooltipProvider>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-user-name">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
