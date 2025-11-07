import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface DeleteJobDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    jobTitle: string;
    isDeleting?: boolean;
}

export function DeleteJobDialog({
    open,
    onOpenChange,
    onConfirm,
    jobTitle,
    isDeleting = false,
}: DeleteJobDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <Trash2 className="w-5 h-5 text-red-600" />
                        Xác nhận xóa tin tuyển dụng
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                        <p>
                            Bạn có chắc chắn muốn xóa tin tuyển dụng:{" "}
                            <span className="font-semibold text-gray-900">"{jobTitle}"</span>?
                        </p>
                        <p className="text-red-600">
                            ⚠️ Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan bao gồm:
                        </p>
                        <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                            <li>Danh sách ứng viên đã ứng tuyển</li>
                            <li>Lịch sử lượt xem và lưu tin</li>
                            <li>Thống kê và phân tích</li>
                        </ul>
                        <p className="text-gray-600">sẽ bị xóa vĩnh viễn.</p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        {isDeleting ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                Đang xóa...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa tin tuyển dụng
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}