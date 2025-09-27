import { Layout } from "../../components";

export default function AboutPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Về BRIPATH</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            BRIPATH là nền tảng định hướng nghề nghiệp thông minh sử dụng công nghệ AI 
            để giúp người dùng khám phá và phát triển con đường sự nghiệp phù hợp.
          </p>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sứ mệnh</h2>
          <p className="text-gray-600 mb-6">
            Chúng tôi cam kết mang đến cho mọi người những công cụ và hướng dẫn cần thiết 
            để đưa ra quyết định nghề nghiệp sáng suốt và xây dựng tương lai thành công.
          </p>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tầm nhìn</h2>
          <p className="text-gray-600">
            Trở thành nền tảng hàng đầu về định hướng nghề nghiệp tại Việt Nam, 
            kết nối ứng viên với cơ hội việc làm phù hợp nhất.
          </p>
        </div>
      </div>
    </Layout>
  );
}