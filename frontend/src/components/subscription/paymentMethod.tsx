import { Button } from "../ui/button";

export type PaymentMethod = "zalopay" | "vnpay";

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  icon: string;
  description: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  hoverColor: string;
}

const paymentOptions: PaymentOption[] = [
  {
    id: "zalopay",
    name: "ZaloPay",
    icon: "💙",
    description: "Thanh toán nhanh chóng và bảo mật",
    backgroundColor: "bg-blue-50",
    borderColor: "border-blue-200 hover:border-blue-400",
    textColor: "text-blue-700",
    hoverColor: "hover:bg-blue-100",
  },
  {
    id: "vnpay",
    name: "VNPay",
    icon: "💚",
    description: "Thanh toán tiện lợi với ưu đãi hấp dẫn",
    backgroundColor: "bg-green-50",
    borderColor: "border-green-200 hover:border-green-400",
    textColor: "text-green-700",
    hoverColor: "hover:bg-green-100",
  },
];

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onSelectMethod: (method: PaymentMethod) => void;
  onProceedPayment: () => void;
  isLoading?: boolean;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
  onProceedPayment,
  isLoading = false,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Chọn Phương Thức Thanh Toán
        </h3>
        <p className="text-gray-600">
          Vui lòng chọn phương thức thanh toán bạn muốn sử dụng
        </p>
      </div>

      <div className="grid gap-4">
        {paymentOptions.map((option) => (
          <div
            key={option.id}
            onClick={() => onSelectMethod(option.id)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
              option.backgroundColor
            } ${
              selectedMethod === option.id
                ? `${option.borderColor.split(" ")[0]} ring-4 ring-opacity-20 ${
                    option.borderColor.includes("blue")
                      ? "ring-blue-400"
                      : option.borderColor.includes("pink")
                      ? "ring-pink-400"
                      : "ring-green-400"
                  } shadow-lg`
                : option.borderColor
            } ${option.hoverColor}`}
          >
            <div className="flex items-center space-x-4">
              {/* Payment Icon */}
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                  selectedMethod === option.id
                    ? "bg-white shadow-md"
                    : "bg-white/50"
                }`}
              >
                {option.icon}
              </div>

              {/* Payment Info */}
              <div className="flex-1">
                <h4 className={`font-bold text-lg ${option.textColor}`}>
                  {option.name}
                </h4>
                <p
                  className={`text-sm ${option.textColor.replace(
                    "700",
                    "600"
                  )}`}
                >
                  {option.description}
                </p>
              </div>

              {/* Selection Indicator */}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === option.id
                    ? `${option.borderColor.split(" ")[0]} bg-white`
                    : "border-gray-300"
                }`}
              >
                {selectedMethod === option.id && (
                  <div
                    className={`w-3 h-3 rounded-full ${
                      option.borderColor.includes("blue")
                        ? "bg-blue-500"
                        : option.borderColor.includes("pink")
                        ? "bg-pink-500"
                        : "bg-green-500"
                    } animate-scale-in`}
                  />
                )}
              </div>
            </div>

            {/* Additional Features */}
            {selectedMethod === option.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span
                    className={`flex items-center space-x-2 ${option.textColor.replace(
                      "700",
                      "600"
                    )}`}
                  >
                    <span>✅</span>
                    <span>Bảo mật cao</span>
                  </span>
                  <span
                    className={`flex items-center space-x-2 ${option.textColor.replace(
                      "700",
                      "600"
                    )}`}
                  >
                    <span>⚡</span>
                    <span>Xử lý nhanh</span>
                  </span>
                  <span
                    className={`flex items-center space-x-2 ${option.textColor.replace(
                      "700",
                      "600"
                    )}`}
                  >
                    <span>🎁</span>
                    <span>Ưu đãi thêm</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Proceed Button */}
      <div className="pt-6">
        <Button
          onClick={onProceedPayment}
          disabled={!selectedMethod || isLoading}
          className={`w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${
            selectedMethod
              ? selectedMethod === "zalopay"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/25"
                : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-500/25"
              : "bg-gray-300 text-gray-500 cursor-not-allowed hover:scale-100"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Đang xử lý...</span>
            </div>
          ) : selectedMethod ? (
            <>
              Thanh toán bằng{" "}
              {paymentOptions.find((p) => p.id === selectedMethod)?.name}
              <span className="ml-2">→</span>
            </>
          ) : (
            "Vui lòng chọn phương thức thanh toán"
          )}
        </Button>

        {/* Security Notice */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <span className="inline-flex items-center space-x-1">
            <span>🔒</span>
            <span>Giao dịch được bảo mật bằng SSL 256-bit</span>
          </span>
        </div>
      </div>
    </div>
  );
}

interface PaymentSuccessProps {
  paymentMethod: PaymentMethod;
  amount: number;
  onContinue: () => void;
}

export function PaymentSuccess({
  paymentMethod,
  amount,
  onContinue,
}: PaymentSuccessProps) {
  const option = paymentOptions.find((p) => p.id === paymentMethod);

  return (
    <div className="text-center py-12">
      <div className="mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">✅</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Thanh Toán Thành Công!
        </h2>
        <p className="text-gray-600 text-lg">
          Cảm ơn bạn đã đăng ký gói dịch vụ của chúng tôi
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-md mx-auto">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Phương thức:</span>
            <div className="flex items-center space-x-2">
              <span>{option?.icon}</span>
              <span className="font-semibold">{option?.name}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Số tiền:</span>
            <span className="font-bold text-lg text-green-600">
              {amount.toLocaleString()}₫
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Trạng thái:</span>
            <span className="text-green-600 font-semibold">Thành công</span>
          </div>
        </div>
      </div>

      <Button
        onClick={onContinue}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        Tiếp tục sử dụng dịch vụ
      </Button>
    </div>
  );
}
