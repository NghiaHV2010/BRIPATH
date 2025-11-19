import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Crown } from "lucide-react";

interface SubscriptionRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

export function SubscriptionRequiredDialog({
  open,
  onOpenChange,
  message,
}: SubscriptionRequiredDialogProps) {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate("/subscriptions");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-amber-100 rounded-full">
              <Crown className="w-6 h-6 text-amber-600" />
            </div>
            <DialogTitle className="text-xl">
              Mua gói dịch vụ để tiếp tục ?
            </DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-gray-700">{message}</p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button variant="custom" onClick={() => onOpenChange(false)}>
            Để sau
          </Button>
          <Button variant="default" onClick={handleUpgrade}>
            <Crown className="w-4 h-4 mr-2" />
            Xem các gói dịch vụ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
