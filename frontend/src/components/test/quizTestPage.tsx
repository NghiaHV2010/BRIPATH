import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

interface QuizQuestion {
  id: number;
  question: string;
  options: { id: string; text: string; field: string }[];
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Bạn thích hoạt động nào nhất trong thời gian rảnh?",
    options: [
      { id: "1a", text: "Thiết kế và sáng tạo nội dung", field: "design" },
      { id: "1b", text: "Phân tích dữ liệu và số liệu", field: "data" },
      {
        id: "1c",
        text: "Tương tác và giao tiếp với mọi người",
        field: "communication",
      },
      { id: "1d", text: "Giải quyết vấn đề kỹ thuật", field: "technology" },
      {
        id: "1e",
        text: "Lập kế hoạch và tổ chức công việc",
        field: "management",
      },
      {
        id: "1f",
        text: "Nghiên cứu và học hỏi kiến thức mới",
        field: "research",
      },
      { id: "1g", text: "Giúp đỡ và hỗ trợ người khác", field: "service" },
      { id: "1h", text: "Tạo ra sản phẩm và dự án mới", field: "innovation" },
    ],
  },
  {
    id: 2,
    question: "Môi trường làm việc lý tưởng của bạn như thế nào?",
    options: [
      {
        id: "2a",
        text: "Văn phòng hiện đại với công nghệ cao",
        field: "technology",
      },
      { id: "2b", text: "Studio sáng tạo với không gian mở", field: "design" },
      { id: "2c", text: "Phòng họp và gặp gỡ khách hàng", field: "business" },
      { id: "2d", text: "Phòng thí nghiệm và nghiên cứu", field: "research" },
      {
        id: "2e",
        text: "Ngoài trời và tiếp xúc với thiên nhiên",
        field: "environment",
      },
      { id: "2f", text: "Bệnh viện hoặc trung tâm y tế", field: "healthcare" },
      { id: "2g", text: "Trường học và cơ sở giáo dục", field: "education" },
      { id: "2h", text: "Nhà máy và cơ sở sản xuất", field: "manufacturing" },
    ],
  },
  {
    id: 3,
    question: "Bạn có điểm mạnh nào sau đây?",
    options: [
      { id: "3a", text: "Tư duy logic và phân tích", field: "analytics" },
      { id: "3b", text: "Khả năng sáng tạo và nghệ thuật", field: "creative" },
      {
        id: "3c",
        text: "Kỹ năng giao tiếp và thuyết phục",
        field: "communication",
      },
      { id: "3d", text: "Hiểu biết về công nghệ", field: "technology" },
      { id: "3e", text: "Khả năng lãnh đạo và quản lý", field: "leadership" },
      { id: "3f", text: "Kiên nhẫn và tỉ mỉ", field: "precision" },
      { id: "3g", text: "Đồng cảm và quan tâm người khác", field: "empathy" },
      { id: "3h", text: "Thích thử thách và mạo hiểm", field: "adventure" },
    ],
  },
  {
    id: 4,
    question: "Khi làm việc nhóm, bạn thường đảm nhận vai trò gì?",
    options: [
      { id: "4a", text: "Người lãnh đạo và điều phối", field: "leadership" },
      { id: "4b", text: "Người đưa ra ý tưởng sáng tạo", field: "innovation" },
      { id: "4c", text: "Người phân tích và đánh giá", field: "analytics" },
      { id: "4d", text: "Người thực hiện và hoàn thành", field: "execution" },
      { id: "4e", text: "Người kết nối và giao tiếp", field: "networking" },
      { id: "4f", text: "Người hỗ trợ và giúp đỡ", field: "support" },
      { id: "4g", text: "Người kiểm tra chất lượng", field: "quality" },
      { id: "4h", text: "Người đưa ra giải pháp", field: "problem-solving" },
    ],
  },
  {
    id: 5,
    question: "Chủ đề nào bạn quan tâm nhất?",
    options: [
      { id: "5a", text: "Công nghệ và đổi mới", field: "technology" },
      { id: "5b", text: "Nghệ thuật và thiết kế", field: "arts" },
      { id: "5c", text: "Kinh doanh và tài chính", field: "business" },
      { id: "5d", text: "Y tế và sức khỏe", field: "healthcare" },
      { id: "5e", text: "Giáo dục và phát triển", field: "education" },
      { id: "5f", text: "Môi trường và bền vững", field: "sustainability" },
      { id: "5g", text: "Khoa học và nghiên cứu", field: "science" },
      { id: "5h", text: "Truyền thông và giải trí", field: "media" },
    ],
  },
  {
    id: 6,
    question: "Loại nhiệm vụ nào khiến bạn cảm thấy hứng thú nhất?",
    options: [
      {
        id: "6a",
        text: "Viết code và phát triển phần mềm",
        field: "programming",
      },
      { id: "6b", text: "Thiết kế giao diện và trải nghiệm", field: "design" },
      { id: "6c", text: "Phân tích thị trường và dữ liệu", field: "marketing" },
      { id: "6d", text: "Chăm sóc và điều trị bệnh nhân", field: "medical" },
      {
        id: "6e",
        text: "Giảng dạy và truyền đạt kiến thức",
        field: "teaching",
      },
      { id: "6f", text: "Quản lý dự án và nhân sự", field: "management" },
      { id: "6g", text: "Tư vấn và hỗ trợ khách hàng", field: "consulting" },
      { id: "6h", text: "Nghiên cứu và phát triển sản phẩm", field: "rd" },
    ],
  },
  {
    id: 7,
    question: "Bạn muốn tác động như thế nào đến xã hội?",
    options: [
      {
        id: "7a",
        text: "Tạo ra công nghệ cải thiện cuộc sống",
        field: "tech-impact",
      },
      {
        id: "7b",
        text: "Truyền cảm hứng qua nghệ thuật",
        field: "creative-impact",
      },
      {
        id: "7c",
        text: "Xây dựng doanh nghiệp bền vững",
        field: "business-impact",
      },
      { id: "7d", text: "Chăm sóc sức khỏe cộng đồng", field: "health-impact" },
      {
        id: "7e",
        text: "Giáo dục thế hệ tương lai",
        field: "education-impact",
      },
      {
        id: "7f",
        text: "Bảo vệ môi trường sống",
        field: "environmental-impact",
      },
      { id: "7g", text: "Phát hiện tri thức mới", field: "research-impact" },
      { id: "7h", text: "Kết nối và truyền thông", field: "social-impact" },
    ],
  },
  {
    id: 8,
    question: "Phong cách làm việc nào phù hợp với bạn?",
    options: [
      { id: "8a", text: "Làm việc độc lập và tự chủ", field: "independent" },
      { id: "8b", text: "Hợp tác nhóm và brainstorm", field: "collaborative" },
      {
        id: "8c",
        text: "Tiếp xúc trực tiếp với người khác",
        field: "interpersonal",
      },
      {
        id: "8d",
        text: "Tập trung sâu vào chi tiết",
        field: "detail-oriented",
      },
      { id: "8e", text: "Đa nhiệm và linh hoạt", field: "multitasking" },
      {
        id: "8f",
        text: "Có cấu trúc và quy trình rõ ràng",
        field: "structured",
      },
      { id: "8g", text: "Sáng tạo và đổi mới liên tục", field: "innovative" },
      {
        id: "8h",
        text: "Giải quyết vấn đề phức tạp",
        field: "complex-solving",
      },
    ],
  },
  {
    id: 9,
    question: "Công cụ/kỹ năng nào bạn muốn phát triển?",
    options: [
      { id: "9a", text: "Ngôn ngữ lập trình và framework", field: "coding" },
      { id: "9b", text: "Phần mềm thiết kế đồ họa", field: "design-tools" },
      {
        id: "9c",
        text: "Phân tích dữ liệu và thống kê",
        field: "data-analysis",
      },
      { id: "9d", text: "Kỹ năng chẩn đoán y khoa", field: "medical-skills" },
      {
        id: "9e",
        text: "Phương pháp giảng dạy hiện đại",
        field: "teaching-methods",
      },
      {
        id: "9f",
        text: "Quản lý dự án và lãnh đạo",
        field: "project-management",
      },
      {
        id: "9g",
        text: "Marketing digital và truyền thông",
        field: "digital-marketing",
      },
      {
        id: "9h",
        text: "Nghiên cứu khoa học và thực nghiệm",
        field: "research-methods",
      },
    ],
  },
  {
    id: 10,
    question: "Thành công với bạn có nghĩa là gì?",
    options: [
      {
        id: "10a",
        text: "Tạo ra sản phẩm công nghệ đột phá",
        field: "tech-innovation",
      },
      {
        id: "10b",
        text: "Có tác phẩm nghệ thuật được công nhận",
        field: "artistic-recognition",
      },
      {
        id: "10c",
        text: "Xây dựng doanh nghiệp thành công",
        field: "business-success",
      },
      {
        id: "10d",
        text: "Cứu sống và chữa khỏi bệnh nhân",
        field: "medical-impact",
      },
      {
        id: "10e",
        text: "Học sinh thành công nhờ sự dạy dỗ",
        field: "educational-success",
      },
      {
        id: "10f",
        text: "Góp phần bảo vệ hành tinh",
        field: "environmental-success",
      },
      { id: "10g", text: "Khám phá ra điều chưa biết", field: "discovery" },
      {
        id: "10h",
        text: "Kết nối và truyền cảm hứng mọi người",
        field: "social-connection",
      },
    ],
  },
];

export default function QuizTestPage() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [questionId: number]: string[];
  }>({});

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAnswerSelect = (questionId: number, optionId: string) => {
    const currentSelections = selectedAnswers[questionId] || [];

    if (currentSelections.includes(optionId)) {
      // Bỏ chọn nếu đã chọn rồi
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: currentSelections.filter((id) => id !== optionId),
      });
    } else if (currentSelections.length < 3) {
      // Thêm lựa chọn nếu chưa đạt tối đa 3
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: [...currentSelections, optionId],
      });
    }
  };

  const nextQuestion = () => {
    window.scrollTo(0, 0);
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Hoàn thành quiz, navigate đến results page
      navigate("/quiz/results", { state: { answers: selectedAnswers } });
    }
  };

  const previousQuestion = () => {
    window.scrollTo(0, 0);
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const question = quizQuestions[currentQuestion];
  const currentSelections = selectedAnswers[question.id] || [];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-6xl w-full">
        {/* Quiz Area with Gradient Background */}
        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          {/* <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Trắc nghiệm nghề nghiệp
            </h1>
            <p className="text-base text-purple-200">
              Khám phá nghề nghiệp phù hợp với bạn qua AI
            </p>
          </div> */}

          {/* Progress Section */}
          <div className="mb-8 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <div className="text-white/80 text-sm font-medium">
                Câu hỏi {currentQuestion + 1} / {quizQuestions.length}
              </div>
              <div className="text-white/80 text-sm font-medium">
                {Math.round(progress)}% hoàn thành
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm">
              <div
                className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 h-3 rounded-full transition-all duration-700 ease-out shadow-lg"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Main Quiz Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl animate-fade-in-up">
            {/* Question */}
            <div className="mb-10">
              <h2 className="text-lg md:text-xl font-bold text-white mb-6 leading-tight">
                {question.question}
              </h2>
              <div className="flex items-center space-x-3 text-purple-200">
                <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                <span className="text-sm">
                  Chọn tối đa 3 đáp án phù hợp nhất với bạn
                </span>
              </div>
            </div>

            {/* Options Grid */}
            <div className="grid md:grid-cols-2 gap-5 mb-10">
              {question.options.map((option, index) => (
                <div
                  key={option.id}
                  className={`group p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] animate-fade-in-up ${
                    currentSelections.includes(option.id)
                      ? "border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/25"
                      : "border-white/30 bg-white/5 hover:border-purple-400 hover:bg-purple-500/10"
                  }`}
                  onClick={() => handleAnswerSelect(question.id, option.id)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        currentSelections.includes(option.id)
                          ? "border-cyan-400 bg-cyan-400 shadow-lg"
                          : "border-white/50 group-hover:border-purple-400"
                      }`}
                    >
                      {currentSelections.includes(option.id) && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white animate-scale-in"></div>
                      )}
                    </div>
                    <span
                      className={`font-medium text-sm transition-all duration-200 leading-relaxed ${
                        currentSelections.includes(option.id)
                          ? "text-white"
                          : "text-white/90 group-hover:text-white"
                      }`}
                    >
                      {option.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selection Counter */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center space-x-2 px-6 py-3 bg-white/10 rounded-full border border-white/20">
                <div className="flex space-x-1">
                  {[1, 2, 3].map((dot) => (
                    <div
                      key={dot}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        dot <= currentSelections.length
                          ? "bg-cyan-400 shadow-lg shadow-cyan-400/50"
                          : "bg-white/30"
                      }`}
                    ></div>
                  ))}
                </div>
                <span className="text-white/80 text-sm font-medium ml-3">
                  {currentSelections.length}/3 đã chọn
                </span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white py-4 text-sm rounded-2xl font-medium transform transition-transform duration-300 ease-out hover:scale-105 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border border-white/30"
              >
                ← Câu trước
              </Button>

              <Button
                onClick={nextQuestion}
                disabled={currentSelections.length === 0}
                className="flex-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 text-white py-4 text-sm rounded-2xl font-medium transform transition-transform duration-300 ease-out hover:scale-105 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {currentQuestion === quizQuestions.length - 1
                  ? "Nộp bài 🎯"
                  : "Câu tiếp →"}
              </Button>
            </div>
          </div>

          {/* Fun Facts */}
          <div className="mt-8 text-center animate-fade-in">
            <p className="text-purple-300/70 text-sm">
              💡 Mẹo: Hãy chọn những đáp án phản ánh đúng nhất sở thích và điểm
              mạnh của bạn!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
