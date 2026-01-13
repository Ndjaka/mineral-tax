import { Link, useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
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
} from "lucide-react";

export function AppSidebar() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const menuItems = [
    { title: t.nav.dashboard, url: "/", icon: LayoutDashboard },
    { title: t.nav.fleet, url: "/fleet", icon: Truck },
    { title: t.nav.fuelEntry, url: "/fuel", icon: Fuel },
    { title: t.calculator.title, url: "/calculator", icon: Calculator },
    { title: t.nav.reports, url: "/reports", icon: FileText },
    { title: t.nav.taxas, url: "/taxas", icon: Send },
    { title: t.nav.subscription, url: "/subscription", icon: CreditCard },
    { title: t.nav.settings, url: "/settings", icon: Settings },
    { title: t.nav.terms, url: "/terms", icon: ScrollText },
  ];

  const userInitials = user
    ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase() || "U"
    : "U";

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer" data-testid="link-logo">
            <div className="w-10 h-10 rounded-lg bg-[#003366] flex items-center justify-center">
              <span className="text-white font-bold text-lg">MT</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">MineralTax</span>
              <span className="text-xs text-muted-foreground">Swiss</span>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-item-${item.url.replace("/", "") || "dashboard"}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
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
