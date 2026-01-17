import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "accent" | "warning" | "success";
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "border-border hover:border-primary/20",
    accent: "border-accent/20 bg-accent/5 hover:border-accent/40",
    warning: "border-status-warning/20 bg-status-warning/5 hover:border-status-warning/40",
    success: "border-status-success/20 bg-status-success/5 hover:border-status-success/40",
  };

  const iconStyles = {
    default: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    warning: "bg-status-warning/10 text-status-warning",
    success: "bg-status-success/10 text-status-success",
  };

  return (
    <div className={cn("stat-card group", variantStyles[variant])}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2.5 rounded-lg", iconStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              trend.value >= 0
                ? "bg-status-success/10 text-status-success"
                : "bg-status-error/10 text-status-error"
            )}
          >
            {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-semibold text-foreground mb-1">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
