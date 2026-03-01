import { cn } from "@/lib/utils";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { ViewRequestStatus } from "../backend";

interface StatusBadgeProps {
  status: ViewRequestStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    [ViewRequestStatus.pending]: {
      className: "status-pending",
      icon: Clock,
      label: "Pending",
    },
    [ViewRequestStatus.approved]: {
      className: "status-approved",
      icon: CheckCircle,
      label: "Approved",
    },
    [ViewRequestStatus.rejected]: {
      className: "status-rejected",
      icon: XCircle,
      label: "Rejected",
    },
  };

  const variant = variants[status];
  const Icon = variant.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium font-mono",
        variant.className,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {variant.label}
    </span>
  );
}
