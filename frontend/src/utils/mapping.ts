// =============================
// Ứng viên (Applicants)
// =============================
export const ApplicantsStatusMap = {
  pending: "Đang chờ",
  approved: "Chấp nhận",
  rejected: "Từ chối",
} as const;

// =============================
// Loại công ty
// =============================
export const CompanyTypeMap = {
  business_househole: "Hộ kinh doanh",
  business: "Doanh nghiệp",
} as const;

// =============================
// Học vấn
// =============================
export const EducationMap = {
  bachelor: "Cử nhân",
  mastter: "Thạc sĩ",
  phd: "Tiến sĩ",
  others: "Khác",
  highschool_graduate: "Tốt nghiệp trung học phổ thông",
} as const;

// =============================
// Giới tính
// =============================
export const GenderMap = {
  male: "Nam",
  female: "Nữ",
  others: "Khác",
} as const;

// =============================
// Trạng thái công việc
// =============================
export const JobStatusMap = {
  over_due: "Hết hạn",
  on_going: "Đang mở",
} as const;

// =============================
// Loại hình công việc
// =============================
export const JobTypeMap = {
  remote: "Remote",
  part_time: "Part time",
  full_time: "Full time",
  others: "Khác",
} as const;

// =============================
// Loại thông báo
// =============================
export const NotificationsTypeMap = {
  system: "Hệ thống",
  pricing_plan: "Gói đăng ký",
  applicant: "Hồ sơ",
  followed: "Đang theo dõi",
} as const;

// =============================
// Cổng thanh toán
// =============================
export const PaymentGatewayMap = {
  MoMo: "MoMo",
  Bank: "Ngân hàng",
  ZaloPay: "ZaloPay",
  Stripe: "Stripe",
} as const;

// =============================
// Phương thức thanh toán
// =============================
export const PaymentMethodMap = {
  bank_card: "Thẻ ngân hàng",
  e_wallet: "Ví điện tử",
  bank_transfer: "Chuyển khoản",
  QR_Code: "Mã QR",
} as const;

// =============================
// Trạng thái thanh toán
// =============================
export const PaymentStatusMap = {
  success: "Thành công",
  failure: "Thất bại",
} as const;

// =============================
// Trạng thái gói đăng ký
// =============================
export const SubscriptionStatusMap = {
  on_going: "Còn hạn",
  over_date: "Hết hạn",
  canceled: "Đã hủy",
} as const;

// =============================
// 🔧 Helper chung
// =============================
export function mapEnumValue<T extends Record<string, string>>(
  map: T,
  key?: keyof T | null
): string {
  if (!key) return "-";
  return map[key] ?? String(key);
}
