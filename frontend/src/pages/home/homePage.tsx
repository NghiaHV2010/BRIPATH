import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Target,
  Users,
  TrendingUp,
  Star,
  CheckCircle,
  Zap,
  Heart,
  Globe,
  Loader
} from "lucide-react";
import InfiniteScroll from "@/components/animations/InfiniteScrollProps";
import { useEffect } from "react";
import { useJobStore } from "@/store/job.store";
import { JobCard } from "@/components/job";

export default function HomePage() {
  const navigate = useNavigate();
  const {
    jobs,
    isLoading,
    getAllJobs,
    checkIfSaved,
    saveJob,
    unsaveJob,
  } = useJobStore();

  useEffect(() => {
    if (!isLoading)
      getAllJobs({ page: 1 });
  }, []);


  if (isLoading) {
    return (
      <Loader className="h-10 w-10 text-blue-600 animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
    );
  }

  return (
    <div className="bg-linear-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-r from-blue-600 via-purple-600 to-indigo-700 text-white max-h-screen">
        <div className="absolute inset-0 bg-black/10"></div>
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-20 lg:pt-32 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                <Star className="h-4 w-4 text-yellow-400" />
                Nền tảng định hướng nghề nghiệp hàng đầu
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Khám phá con đường sự nghiệp
                <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-orange-400">
                  {" "}phù hợp
                </span>
              </h1>

              <p className="text-xl text-blue-100 leading-relaxed">
                Trắc nghiệm nghề nghiệp thông minh, tìm kiếm việc làm phù hợp và kết nối với
                các công ty hàng đầu. Bắt đầu hành trình sự nghiệp của bạn ngay hôm nay.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Link to="/quiz" className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Bắt đầu trắc nghiệm
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl font-semibold backdrop-blur-sm hover:scale-105 transition-all duration-300"
                >
                  <Link to="/jobs" className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Tìm việc làm
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-400" />
                  <span className="text-sm">10,000+ người dùng</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-green-400" />
                  <span className="text-sm">500+ công ty</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <span className="text-sm">95% hài lòng</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-linear-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Trắc nghiệm nghề nghiệp</h3>
                      <p className="text-blue-100 text-sm">Khám phá nghề phù hợp</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-sm">AI phân tích tính cách</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-sm">Gợi ý nghề nghiệp cá nhân</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-sm">Lộ trình phát triển sự nghiệp</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate('/quiz')}
                    className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    Thử ngay
                  </Button>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-400/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-full z-0">
          <InfiniteScroll
            items={
              jobs.length > 0
                ? jobs.map((job) => ({
                  content: (
                    <JobCard
                      key={job.id}
                      job={job}
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      // onSave={() => handleSaveJob(job.id)}
                      compact={false}
                      isSaved={job.isSaved || false}
                    />
                  ),
                }))
                : []
            }
            isTilted={true}
            tiltDirection='right'
            autoplay={true}
            autoplaySpeed={0.5}
            autoplayDirection="up"
            pauseOnHover={true}
          />
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-indigo-600 border-indigo-200">
              Cách thức hoạt động
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Hành trình khám phá sự nghiệp của bạn
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chỉ với 3 bước đơn giản, bạn có thể tìm ra con đường sự nghiệp phù hợp nhất
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection lines for desktop */}
            <div className="hidden md:block absolute top-1/2 left-1/3 right-1/3 h-0.5 -translate-y-1/2"></div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Làm trắc nghiệm</h3>
              <p className="text-gray-600 leading-relaxed">
                Trả lời 10 câu hỏi về sở thích, tính cách và mục tiêu của bạn. Trắc nghiệm được thiết kế đơn giản và thú vị.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-linear-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI phân tích</h3>
              <p className="text-gray-600 leading-relaxed">
                Hệ thống AI của chúng tôi phân tích câu trả lời và so khớp với cơ sở dữ liệu nghề nghiệp chuyên sâu.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-linear-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Nhận kết quả</h3>
              <p className="text-gray-600 leading-relaxed">
                Xem top 3 nghề nghiệp phù hợp nhất với bạn cùng lộ trình phát triển sự nghiệp chi tiết.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
              Tính năng nổi bật
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn BRIPATH?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chúng tôi cung cấp giải pháp toàn diện để giúp bạn tìm ra con đường sự nghiệp phù hợp nhất
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Trắc nghiệm AI</h3>
                <p className="text-gray-600 leading-relaxed">
                  Trắc nghiệm thông minh được hỗ trợ bởi AI để phân tích tính cách và sở thích của bạn
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Việc làm phù hợp</h3>
                <p className="text-gray-600 leading-relaxed">
                  Tìm kiếm và ứng tuyển vào các công việc phù hợp với kỹ năng và mục tiêu của bạn
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Kết nối công ty</h3>
                <p className="text-gray-600 leading-relaxed">
                  Kết nối trực tiếp với các công ty hàng đầu và cơ hội việc làm chất lượng cao
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-linear-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Lộ trình phát triển</h3>
                <p className="text-gray-600 leading-relaxed">
                  Nhận lộ trình phát triển sự nghiệp cá nhân hóa để đạt được mục tiêu của bạn
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-linear-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Cộng đồng</h3>
                <p className="text-gray-600 leading-relaxed">
                  Tham gia cộng đồng người dùng, chia sẻ kinh nghiệm và học hỏi từ nhau
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-linear-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Nhanh chóng</h3>
                <p className="text-gray-600 leading-relaxed">
                  Hoàn thành trắc nghiệm chỉ trong 5 phút và nhận kết quả ngay lập tức
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-linear-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl lg:text-5xl font-bold">10,000+</div>
              <div className="text-blue-100">Người dùng tin tưởng</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl lg:text-5xl font-bold">500+</div>
              <div className="text-blue-100">Công ty đối tác</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl lg:text-5xl font-bold">95%</div>
              <div className="text-blue-100">Tỷ lệ hài lòng</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl lg:text-5xl font-bold">50+</div>
              <div className="text-blue-100">Ngành nghề</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-linear-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-purple-600 border-purple-200">
              Đánh giá từ người dùng
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Những gì người dùng nói về BRIPATH
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hàng nghìn người dùng đã tìm thấy con đường sự nghiệp phù hợp với họ
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "BRIPATH đã giúp tôi khám phá ra đam mê thực sự của mình. Trắc nghiệm rất chính xác và gợi ý nghề nghiệp phù hợp hoàn toàn với tính cách của tôi."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">A</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Anh Minh</p>
                    <p className="text-sm text-gray-500">Software Engineer</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "Tôi đã tìm được công việc mơ ước thông qua BRIPATH. Nền tảng này không chỉ giúp tôi hiểu bản thân mà còn kết nối với những cơ hội việc làm tuyệt vời."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">L</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Chị Linh</p>
                    <p className="text-sm text-gray-500">Marketing Manager</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "Giao diện đẹp, dễ sử dụng và kết quả trắc nghiệm rất hữu ích. Tôi đã giới thiệu cho nhiều bạn bè và họ đều rất hài lòng với dịch vụ này."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">H</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Anh Hùng</p>
                    <p className="text-sm text-gray-500">Business Analyst</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-green-600 border-green-200">
              Câu hỏi thường gặp
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Những câu hỏi thường gặp
            </h2>
            <p className="text-xl text-gray-600">
              Tìm hiểu thêm về cách BRIPATH hoạt động
            </p>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Trắc nghiệm nghề nghiệp có mất phí không?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Hoàn toàn miễn phí! BRIPATH cung cấp trắc nghiệm nghề nghiệp miễn phí để giúp bạn khám phá con đường sự nghiệp phù hợp. Tuy nhiên, bạn cần đăng nhập để lưu kết quả.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Mất bao lâu để hoàn thành trắc nghiệm?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Trắc nghiệm của chúng tôi được thiết kế để hoàn thành trong khoảng 5-10 phút. Chỉ cần trả lời 10 câu hỏi đơn giản về sở thích và tính cách của bạn.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Kết quả trắc nghiệm có chính xác không?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Trắc nghiệm được phát triển dựa trên các nghiên cứu tâm lý học và được hỗ trợ bởi AI để phân tích. Tuy nhiên, kết quả chỉ mang tính tham khảo và bạn nên kết hợp với việc tự đánh giá bản thân.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Tôi có thể làm lại trắc nghiệm không?
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Có, bạn có thể làm lại trắc nghiệm bất cứ lúc nào. Chúng tôi khuyên bạn nên làm lại sau 6 tháng để cập nhật kết quả dựa trên sự thay đổi trong sở thích và mục tiêu của bạn.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
              <Heart className="h-4 w-4" />
              Bắt đầu hành trình của bạn
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Sẵn sàng tìm ra con đường sự nghiệp phù hợp?
            </h2>

            <p className="text-xl text-gray-600 leading-relaxed">
              Tham gia hàng nghìn người dùng đã tìm thấy công việc mơ ước thông qua BRIPATH.
              Bắt đầu ngay hôm nay!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-linear-to-r from-blue-700 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Link to="/quiz" className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Làm trắc nghiệm ngay
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
              >
                <Link to="/jobs" className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Khám phá việc làm
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">BRIPATH</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Nền tảng định hướng nghề nghiệp hàng đầu, giúp bạn tìm ra con đường sự nghiệp phù hợp nhất.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Dịch vụ</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/quiz" className="hover:text-white transition-colors">Trắc nghiệm nghề nghiệp</Link></li>
                <li><Link to="/jobs" className="hover:text-white transition-colors">Tìm việc làm</Link></li>
                <li><Link to="/companies" className="hover:text-white transition-colors">Công ty</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">Về chúng tôi</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Hỗ trợ</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/contact" className="hover:text-white transition-colors">Liên hệ</Link></li>
                <li><Link to="/help" className="hover:text-white transition-colors">Trợ giúp</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Chính sách</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Kết nối</h3>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer hover:scale-110">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors cursor-pointer hover:scale-110">
                  <Users className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors cursor-pointer hover:scale-110">
                  <Heart className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BRIPATH. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
