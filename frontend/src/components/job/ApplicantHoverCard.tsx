import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Calendar } from "lucide-react";

interface ApplicantHoverCardProps {
  description: string;
  applyDate: string;
  cvName?: string;
  children: React.ReactNode;
}

export function ApplicantHoverCard({
  description,
  applyDate,
  cvName,
  children,
}: ApplicantHoverCardProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-72">
        <div className="font-semibold mb-1">Thông tin ứng tuyển</div>
        {cvName && (
          <div className="mb-1 text-sm text-gray-700">
            CV: <span className="font-medium">{cvName}</span>
          </div>
        )}
        <div className="mb-1 text-sm text-gray-700">
          Cover letter:{" "}
          <span className="font-medium">{description || "(Không có)"}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          {new Date(applyDate).toLocaleString("vi-VN")}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
