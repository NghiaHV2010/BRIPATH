import Layout from "../../components/layout/layout";

export default function ProfilePageWrapper() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Hồ sơ cá nhân
            </h1>
            <p className="text-gray-600">
              Trang profile đang được phát triển. Sẽ có đầy đủ thông tin người
              dùng ở đây.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
