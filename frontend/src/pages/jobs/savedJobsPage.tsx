import Layout from "../../components/layout/layout";

export default function SavedJobsPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Việc làm đã lưu
            </h1>
            <p className="text-gray-600 text-sm mb-6">
              Danh sách việc làm bạn đã lưu sẽ hiển thị ở đây. Bạn có thể thêm
              phân loại theo ngành hoặc mức độ ưu tiên.
            </p>
            <div className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
              Chưa có dữ liệu.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
