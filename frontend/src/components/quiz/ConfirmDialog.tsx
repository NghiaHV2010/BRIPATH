import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <DialogTitle>{title || "Xác nhận rời khỏi trang"}</DialogTitle>
        </DialogHeader>
        <div className="my-4 text-gray-700">
          {description ||
            "Bạn có chắc chắn muốn rời khỏi trang làm quiz? Tiến trình làm bài sẽ bị mất."}
        </div>
        <DialogFooter className="flex gap-3 justify-center">
          <Button variant="custom" onClick={onCancel}>
            Ở lại
          </Button>
          <Button variant="outline" onClick={onConfirm}>
            Thoát
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
