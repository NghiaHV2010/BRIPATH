import { useState, useEffect, useRef } from "react";
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
      { id: "1c", text: "Tương tác và giao tiếp với mọi người", field: "communication" },
      { id: "1d", text: "Giải quyết vấn đề kỹ thuật", field: "technology" },
      { id: "1e", text: "Lập kế hoạch và tổ chức công việc", field: "management" },
      { id: "1f", text: "Nghiên cứu và học hỏi kiến thức mới", field: "research" },
      { id: "1g", text: "Giúp đỡ và hỗ trợ người khác", field: "service" },
      { id: "1h", text: "Tạo ra sản phẩm và dự án mới", field: "innovation" }
    ]
  },
  {
    id: 2,
    question: "Môi trường làm việc lý tưởng của bạn như thế nào?",
    options: [
      { id: "2a", text: "Văn phòng hiện đại với công nghệ cao", field: "technology" },
      { id: "2b", text: "Studio sáng tạo với không gian mở", field: "design" },
      { id: "2c", text: "Phòng họp và gặp gỡ khách hàng", field: "business" },
      { id: "2d", text: "Phòng thí nghiệm và nghiên cứu", field: "research" },
      { id: "2e", text: "Ngoài trời và tiếp xúc với thiên nhiên", field: "environment" },
      { id: "2f", text: "Bệnh viện hoặc trung tâm y tế", field: "healthcare" },
      { id: "2g", text: "Trường học và cơ sở giáo dục", field: "education" },
      { id: "2h", text: "Nhà máy và cơ sở sản xuất", field: "manufacturing" }
    ]
  },
  {
    id: 3,
    question: "Bạn có điểm mạnh nào sau đây?",
    options: [
      { id: "3a", text: "Tư duy logic và phân tích", field: "analytics" },
      { id: "3b", text: "Khả năng sáng tạo và nghệ thuật", field: "creative" },
      { id: "3c", text: "Kỹ năng giao tiếp và thuyết phục", field: "communication" },
      { id: "3d", text: "Hiểu biết về công nghệ", field: "technology" },
      { id: "3e", text: "Khả năng lãnh đạo và quản lý", field: "leadership" },
      { id: "3f", text: "Kiên nhẫn và tỉ mỉ", field: "precision" },
      { id: "3g", text: "Đồng cảm và quan tâm người khác", field: "empathy" },
      { id: "3h", text: "Thích thử thách và mạo hiểm", field: "adventure" }
    ]
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
      { id: "4h", text: "Người đưa ra giải pháp", field: "problem-solving" }
    ]
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
      { id: "5h", text: "Truyền thông và giải trí", field: "media" }
    ]
  },
  {
    id: 6,
    question: "Loại nhiệm vụ nào khiến bạn cảm thấy hứng thú nhất?",
    options: [
      { id: "6a", text: "Viết code và phát triển phần mềm", field: "programming" },
      { id: "6b", text: "Thiết kế giao diện và trải nghiệm", field: "design" },
      { id: "6c", text: "Phân tích thị trường và dữ liệu", field: "marketing" },
      { id: "6d", text: "Chăm sóc và điều trị bệnh nhân", field: "medical" },
      { id: "6e", text: "Giảng dạy và truyền đạt kiến thức", field: "teaching" },
      { id: "6f", text: "Quản lý dự án và nhân sự", field: "management" },
      { id: "6g", text: "Tư vấn và hỗ trợ khách hàng", field: "consulting" },
      { id: "6h", text: "Nghiên cứu và phát triển sản phẩm", field: "rd" }
    ]
  },
  {
    id: 7,
    question: "Bạn muốn tác động như thế nào đến xã hội?",
    options: [
      { id: "7a", text: "Tạo ra công nghệ cải thiện cuộc sống", field: "tech-impact" },
      { id: "7b", text: "Truyền cảm hứng qua nghệ thuật", field: "creative-impact" },
      { id: "7c", text: "Xây dựng doanh nghiệp bền vững", field: "business-impact" },
      { id: "7d", text: "Chăm sóc sức khỏe cộng đồng", field: "health-impact" },
      { id: "7e", text: "Giáo dục thế hệ tương lai", field: "education-impact" },
      { id: "7f", text: "Bảo vệ môi trường sống", field: "environmental-impact" },
      { id: "7g", text: "Phát hiện tri thức mới", field: "research-impact" },
      { id: "7h", text: "Kết nối và truyền thông", field: "social-impact" }
    ]
  },
  {
    id: 8,
    question: "Phong cách làm việc nào phù hợp với bạn?",
    options: [
      { id: "8a", text: "Làm việc độc lập và tự chủ", field: "independent" },
      { id: "8b", text: "Hợp tác nhóm và brainstorm", field: "collaborative" },
      { id: "8c", text: "Tiếp xúc trực tiếp với người khác", field: "interpersonal" },
      { id: "8d", text: "Tập trung sâu vào chi tiết", field: "detail-oriented" },
      { id: "8e", text: "Đa nhiệm và linh hoạt", field: "multitasking" },
      { id: "8f", text: "Có cấu trúc và quy trình rõ ràng", field: "structured" },
      { id: "8g", text: "Sáng tạo và đổi mới liên tục", field: "innovative" },
      { id: "8h", text: "Giải quyết vấn đề phức tạp", field: "complex-solving" }
    ]
  },
  {
    id: 9,
    question: "Công cụ/kỹ năng nào bạn muốn phát triển?",
    options: [
      { id: "9a", text: "Ngôn ngữ lập trình và framework", field: "coding" },
      { id: "9b", text: "Phần mềm thiết kế đồ họa", field: "design-tools" },
      { id: "9c", text: "Phân tích dữ liệu và thống kê", field: "data-analysis" },
      { id: "9d", text: "Kỹ năng chẩn đoán y khoa", field: "medical-skills" },
      { id: "9e", text: "Phương pháp giảng dạy hiện đại", field: "teaching-methods" },
      { id: "9f", text: "Quản lý dự án và lãnh đạo", field: "project-management" },
      { id: "9g", text: "Marketing digital và truyền thông", field: "digital-marketing" },
      { id: "9h", text: "Nghiên cứu khoa học và thực nghiệm", field: "research-methods" }
    ]
  },
  {
    id: 10,
    question: "Thành công với bạn có nghĩa là gì?",
    options: [
      { id: "10a", text: "Tạo ra sản phẩm công nghệ đột phá", field: "tech-innovation" },
      { id: "10b", text: "Có tác phẩm nghệ thuật được công nhận", field: "artistic-recognition" },
      { id: "10c", text: "Xây dựng doanh nghiệp thành công", field: "business-success" },
      { id: "10d", text: "Cứu sống và chữa khỏi bệnh nhân", field: "medical-impact" },
      { id: "10e", text: "Học sinh thành công nhờ sự dạy dỗ", field: "educational-success" },
      { id: "10f", text: "Góp phần bảo vệ hành tinh", field: "environmental-success" },
      { id: "10g", text: "Khám phá ra điều chưa biết", field: "discovery" },
      { id: "10h", text: "Kết nối và truyền cảm hứng mọi người", field: "social-connection" }
    ]
  }
];

export default function PersonalityQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: number]: string[] }>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<{ career: string; match: number; description: string }[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);
  
  const quizSectionRef = useRef<HTMLDivElement>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const startQuiz = () => {
    setShowQuiz(true);
    setTimeout(() => {
      quizSectionRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  const handleAnswerSelect = (questionId: number, optionId: string) => {
    const currentSelections = selectedAnswers[questionId] || [];
    
    if (currentSelections.includes(optionId)) {
      // Bỏ chọn nếu đã chọn rồi
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: currentSelections.filter(id => id !== optionId)
      });
    } else if (currentSelections.length < 3) {
      // Thêm lựa chọn nếu chưa đạt tối đa 3
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: [...currentSelections, optionId]
      });
    }
  };

  const nextQuestion = () => {
    window.scrollTo(0, 0);
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults();
    }
  };

  const previousQuestion = () => {
    window.scrollTo(0, 0);
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResults = () => {
    const fieldCounts: { [field: string]: number } = {};
    
    Object.entries(selectedAnswers).forEach(([questionId, answers]) => {
      const question = quizQuestions.find(q => q.id === parseInt(questionId));
      if (question) {
        answers.forEach(answerId => {
          const option = question.options.find(opt => opt.id === answerId);
          if (option) {
            fieldCounts[option.field] = (fieldCounts[option.field] || 0) + 1;
          }
        });
      }
    });

    // Simulate AI-generated career recommendations (hardcoded for now)
    const careerRecommendations = generateCareerRecommendations(fieldCounts);
    setResults(careerRecommendations);
    setIsCompleted(true);
    window.scrollTo(0, 0);
  };

  const generateCareerRecommendations = (fieldCounts: { [field: string]: number }) => {
    // Hardcoded career database - in real app this would come from AI API
    const careerDatabase = [
      {
        career: "Lập trình viên Full-stack",
        fields: ["technology", "programming", "coding", "problem-solving"],
        description: "Phát triển ứng dụng web và mobile hoàn chỉnh, từ giao diện người dùng đến hệ thống backend"
      },
      {
        career: "UI/UX Designer", 
        fields: ["design", "creative", "design-tools", "user-experience"],
        description: "Thiết kế giao diện và trải nghiệm người dùng cho các sản phẩm số"
      },
      {
        career: "Data Scientist",
        fields: ["data", "analytics", "data-analysis", "research"],
        description: "Phân tích dữ liệu lớn để tìm ra insights và dự đoán xu hướng"
      },
      {
        career: "Product Manager",
        fields: ["management", "leadership", "business", "project-management"],
        description: "Quản lý phát triển sản phẩm từ ý tưởng đến thị trường"
      },
      {
        career: "Digital Marketing Specialist",
        fields: ["marketing", "digital-marketing", "communication", "social-impact"],
        description: "Xây dựng và triển khai chiến lược marketing online"
      },
      {
        career: "Bác sĩ đa khoa",
        fields: ["healthcare", "medical", "medical-skills", "health-impact"],
        description: "Chẩn đoán, điều trị và chăm sóc sức khỏe toàn diện cho bệnh nhân"
      },
      {
        career: "Giáo viên THPT",
        fields: ["education", "teaching", "teaching-methods", "educational-success"],
        description: "Giảng dạy và định hướng học sinh trung học phổ thông"
      },
      {
        career: "Kỹ sư môi trường",
        fields: ["environment", "sustainability", "environmental-impact", "science"],
        description: "Nghiên cứu và phát triển giải pháp bảo vệ môi trường"
      },
      {
        career: "Nhà nghiên cứu AI",
        fields: ["research", "technology", "innovation", "discovery"],
        description: "Nghiên cứu và phát triển các thuật toán trí tuệ nhân tạo"
      },
      {
        career: "Creative Director",
        fields: ["arts", "creative", "design", "artistic-recognition"],
        description: "Dẫn dắt và chỉ đạo sáng tạo cho các dự án quảng cáo và truyền thông"
      },
      {
        career: "Startup Founder",
        fields: ["business", "innovation", "leadership", "business-success"],
        description: "Khởi nghiệp và xây dựng doanh nghiệp công nghệ"
      },
      {
        career: "Social Media Manager",
        fields: ["media", "communication", "social-connection", "networking"],
        description: "Quản lý và phát triển sự hiện diện trên các nền tảng mạng xã hội"
      }
    ];

    // Calculate match scores
    const careerScores = careerDatabase.map(career => {
      let score = 0;
      career.fields.forEach(field => {
        score += fieldCounts[field] || 0;
      });
      return {
        career: career.career,
        match: Math.min(95, Math.max(65, score * 8 + Math.random() * 10)), // Random factor for demo
        description: career.description
      };
    });

    // Sort by match score and return top 3
    return careerScores
      .sort((a, b) => b.match - a.match)
      .slice(0, 3);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setIsCompleted(false);
    setResults([]);
    setShowQuiz(false);
    window.scrollTo(0, 0);
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6 animate-bounce-subtle shadow-2xl">
                <span className="text-3xl">🎯</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Nghề nghiệp phù hợp với bạn!
              </h1>
              <p className="text-base text-purple-200 max-w-2xl mx-auto">
                Dựa trên AI phân tích câu trả lời của bạn, đây là 3 ngành nghề được gợi ý hàng đầu
              </p>
            </div>

          {/* Career Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {results.map((result, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 transform transition-all duration-500 hover:scale-105 hover:bg-white/15 animate-fade-in-up shadow-2xl"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                    index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 
                    'bg-gradient-to-br from-orange-400 to-orange-600'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      {Math.round(result.match)}%
                    </div>
                    <div className="text-sm text-purple-200">phù hợp</div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-4">
                  {result.career}
                </h3>
                
                <p className="text-purple-100 leading-relaxed mb-6">
                  {result.description}
                </p>

                {/* Progress Bar */}
                <div className="relative">
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 delay-${index * 200} ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' : 
                        'bg-gradient-to-r from-orange-400 to-orange-600'
                      }`}
                      style={{ width: `${result.match}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <div className="flex justify-center space-x-6">
              <Button 
                onClick={restartQuiz}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-2xl"
              >
                🔄 Làm lại trắc nghiệm
              </Button>
              <Button 
                onClick={() => window.location.href = '/quiz'}
                className="px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-105 shadow-2xl"
              >
                🏠 Về trang chủ
              </Button>
            </div>
            
            <p className="text-purple-300 text-sm">
              Kết quả này chỉ mang tính chất tham khảo. Hãy khám phá thêm để tìm ra con đường phù hợp nhất!
            </p>
          </div>
          </div>
        </div>
      </div>
    );
  }

  const question = quizQuestions[currentQuestion];
  const currentSelections = selectedAnswers[question.id] || [];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-white">
      {/* Landing Section */}
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl w-full text-center">
          {/* Hero Content */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6 shadow-lg">
              <span className="text-3xl">🎯</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trắc nghiệm nghề nghiệp
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Khám phá con đường sự nghiệp phù hợp với bạn thông qua trắc nghiệm thông minh được hỗ trợ bởi AI. 
              Chỉ mất 5-10 phút để có được gợi ý nghề nghiệp cá nhân hóa.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-xl">🧠</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Thông minh</h3>
              <p className="text-gray-600 text-sm">Phân tích tính cách và sở thích để đưa ra gợi ý chính xác</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nhanh chóng</h3>
              <p className="text-gray-600 text-sm">Chỉ 10 câu hỏi đơn giản, hoàn thành trong 5 phút</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <span className="text-xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cá nhân hóa</h3>
              <p className="text-gray-600 text-sm">Kết quả được tùy chỉnh riêng cho từng người dùng</p>
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={startQuiz}
            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            🚀 Làm bài trắc nghiệm ngay
          </Button>
          
          <p className="text-gray-500 text-sm mt-4">
            Hoàn toàn miễn phí • Không cần đăng ký
          </p>
        </div>
      </div>

      {/* Quiz Section */}
      {showQuiz && (
        <div ref={quizSectionRef} className="min-h-screen bg-white flex items-center justify-center p-4">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-80 h-80 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>

          <div className="relative z-10 max-w-6xl w-full">
            {/* Quiz Area with Gradient Background */}
            <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl p-8 shadow-2xl">{/* Header */}
    

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
                <span className="text-sm">Chọn tối đa 3 đáp án phù hợp nhất với bạn</span>
              </div>
            </div>

          {/* Options Grid */}
          <div className="grid md:grid-cols-2 gap-5 mb-10">
            {question.options.map((option, index) => (
              <div
                key={option.id}
                className={`group p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] animate-fade-in-up ${
                  currentSelections.includes(option.id)
                    ? 'border-cyan-400 bg-cyan-500/20 shadow-lg shadow-cyan-500/25'
                    : 'border-white/30 bg-white/5 hover:border-purple-400 hover:bg-purple-500/10'
                }`}
                onClick={() => handleAnswerSelect(question.id, option.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    currentSelections.includes(option.id)
                      ? 'border-cyan-400 bg-cyan-400 shadow-lg'
                      : 'border-white/50 group-hover:border-purple-400'
                  }`}>
                    {currentSelections.includes(option.id) && (
                      <div className="w-2.5 h-2.5 rounded-full bg-white animate-scale-in"></div>
                    )}
                  </div>
                  <span className={`font-medium text-sm transition-all duration-200 leading-relaxed ${
                    currentSelections.includes(option.id) ? 'text-white' : 'text-white/90 group-hover:text-white'
                  }`}>
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
                        ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50' 
                        : 'bg-white/30'
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
              className="flex-1 bg-white/20 hover:bg-white/30 text-white py-4 text-sm rounded-2xl font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border border-white/30"
            >
              ← Câu trước
            </Button>
            
            <Button
              onClick={nextQuestion}
              disabled={currentSelections.length === 0}
              className="flex-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 text-white py-4 text-sm rounded-2xl font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl"
            >
              {currentQuestion === quizQuestions.length - 1 ? 'Xem kết quả 🎯' : 'Câu tiếp →'}
            </Button>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="mt-8 text-center animate-fade-in">
          <p className="text-purple-300/70 text-sm">
            💡 Mẹo: Hãy chọn những đáp án phản ánh đúng nhất sở thích và điểm mạnh của bạn!
          </p>
        </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}