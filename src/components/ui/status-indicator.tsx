import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatusIndicatorProps {
  status: "online" | "offline" | "syncing" | "error";
  label: string;
  icon?: LucideIcon;
  className?: string;
}

export function StatusIndicator({ status, label, icon: Icon, className }: StatusIndicatorProps) {
  const statusStyles = {
    online: "bg-status-success/10 text-status-success border-status-success/20",
    offline: "bg-muted text-muted-foreground border-muted",
    syncing: "bg-status-info/10 text-status-info border-status-info/20",
    error: "bg-status-error/10 text-status-error border-status-error/20",
  };

  const dotStyles = {
    online: "bg-status-success",
    offline: "bg-muted-foreground",
    syncing: "bg-status-info animate-pulse",
    error: "bg-status-error",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium",
        statusStyles[status],
        className
      )}
    >
      <span className={cn("w-2 h-2 rounded-full", dotStyles[status])} />
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span>{label}</span>
    </div>
  );
}
