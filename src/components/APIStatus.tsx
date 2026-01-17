import { useHealthCheck } from "@/hooks/useAPI";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function APIStatus() {
  const { data, isLoading, isError } = useHealthCheck();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Checking API...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <XCircle className="w-4 h-4" />
        Backend API Offline
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-status-success">
      <CheckCircle2 className="w-4 h-4" />
      Backend Connected ({data?.mode})
    </div>
  );
}
