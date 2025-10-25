import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface RegistrationInforDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: {
    company_type?: string;
    field?: string;
    fax_code?: string;
    business_certificate?: string;
  } | null;
}

export default function RegistrationInforDialog({
  open,
  onOpenChange,
  data,
}: RegistrationInforDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thông tin đơn đăng ký doanh nghiệp</DialogTitle>
        </DialogHeader>
        {data ? (
          <div className="space-y-3">
            <div>
              <span className="font-semibold">Loại hình doanh nghiệp:</span>{" "}
              {data.company_type}
            </div>
            <div>
              <span className="font-semibold">Lĩnh vực hoạt động:</span>{" "}
              {data.field}
            </div>
            <div>
              <span className="font-semibold">Fax Code:</span> {data.fax_code}
            </div>
            <div>
              <span className="font-semibold">Giấy phép kinh doanh:</span>
              {data.business_certificate ? (
                <img
                  src={data.business_certificate}
                  alt="Business certificate"
                  className="w-32 h-32 object-cover rounded-md mt-2"
                />
              ) : (
                <span>Chưa tải lên</span>
              )}
            </div>
          </div>
        ) : (
          <div>Không có dữ liệu đơn đăng ký.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
