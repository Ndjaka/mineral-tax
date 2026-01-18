import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Truck, Fuel, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalMachines: number;
  totalFuelEntries: number;
  totalVolume: number;
  eligibleVolume: number;
  estimatedReimbursement: number;
  pendingReports: number;
}

export function StatsBar() {
  const { t } = useI18n();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("de-CH").format(num);
  };

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-4 p-3 bg-muted/50 rounded-lg border mb-4" data-testid="stats-bar-loading">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-32" />
      </div>
    );
  }

  if (!stats) return null;

  const items = [
    {
      icon: Fuel,
      label: t.reports.eligibleVolume,
      value: `${formatNumber(stats.eligibleVolume)} L`,
      color: "text-chart-3",
      testId: "eligible-volume",
    },
    {
      icon: TrendingUp,
      label: t.dashboard.totalReimbursement,
      value: formatCurrency(stats.estimatedReimbursement),
      color: "text-primary",
      testId: "reimbursement",
    },
    {
      icon: Truck,
      label: t.dashboard.activeMachines,
      value: stats.totalMachines.toString(),
      color: "text-chart-2",
      testId: "active-machines",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 md:gap-6 p-3 bg-muted/50 rounded-lg border mb-4" data-testid="stats-bar">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2" data-testid={`stats-bar-item-${item.testId}`}>
          <item.icon className={`h-4 w-4 ${item.color}`} />
          <span className="text-sm text-muted-foreground hidden sm:inline">{item.label}:</span>
          <span className="text-sm font-semibold" data-testid={`text-${item.testId}`}>{item.value}</span>
          {index < items.length - 1 && (
            <span className="hidden md:inline text-muted-foreground/30 ml-2">|</span>
          )}
        </div>
      ))}
    </div>
  );
}
