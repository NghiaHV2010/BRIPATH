import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface AdminEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-3 py-10 text-center text-gray-500">
      <Icon className="h-8 w-8 text-gray-300" />
      <div>
        <p className="text-sm font-medium text-gray-700">{title}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

