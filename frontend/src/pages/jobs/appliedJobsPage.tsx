
export default function AppliedJobsPage() {
  return (
    <div className="min-h-screen max-w-5xl w-full bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Việc làm đã ứng tuyển
        </h3>
        <p className="text-gray-600 text-sm mb-6">
          Danh sách việc làm bạn đã nộp sẽ hiển thị ở đây. Bạn có thể lưu
          trạng thái: Chờ duyệt / Đang xử lý / Từ chối / Phỏng vấn.
        </p>
        <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
          Chưa có dữ liệu.
        </div>
      </div>
    </div>
  );
}
