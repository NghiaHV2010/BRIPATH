import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface AdminCardSkeletonProps {
  title: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export function AdminCardSkeleton({ title, icon, children }: AdminCardSkeletonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children ?? (
          <div className="space-y-4">
            <div className="h-4 w-1/3 rounded-md bg-gray-100 animate-pulse" />
            <div className="h-4 w-2/3 rounded-md bg-gray-100 animate-pulse" />
            <div className="h-4 w-1/2 rounded-md bg-gray-100 animate-pulse" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

