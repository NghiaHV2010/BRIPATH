import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

interface QuizResults {
  career: string;
  match: number;
  description: string;
}

export default function QuizResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState<QuizResults[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const calculateResults = (selectedAnswers: {
      [questionId: number]: string[];
    }) => {
      const fieldCounts: { [field: string]: number } = {};

      Object.entries(selectedAnswers).forEach(([, answers]) => {
        answers.forEach((answerId) => {
          // Extract field từ answerId (ví dụ: "1a" -> field từ options)
          const field = getFieldFromAnswerId(answerId);
          if (field) {
            fieldCounts[field] = (fieldCounts[field] || 0) + 1;
          }
        });
      });

      return generateCareerRecommendations(fieldCounts);
    };

    // Lấy answers từ navigation state
    const answers = location.state?.answers;

    if (!answers) {
      // Nếu không có answers, redirect về quiz landing
      navigate("/quiz");
      return;
    }

    // Tính toán kết quả
    const calculatedResults = calculateResults(answers);
    setResults(calculatedResults);
  }, [location.state, navigate]);

  const getFieldFromAnswerId = (answerId: string): string => {
    // Mapping đơn giản - trong thực tế sẽ cần mapping chính xác hơn
    const fieldMapping: { [key: string]: string } = {
      // Question 1
      "1a": "design",
      "1b": "data",
      "1c": "communication",
      "1d": "technology",
      "1e": "management",
      "1f": "research",
      "1g": "service",
      "1h": "innovation",
      // Question 2
      "2a": "technology",
      "2b": "design",
      "2c": "business",
      "2d": "research",
      "2e": "environment",
      "2f": "healthcare",
      "2g": "education",
      "2h": "manufacturing",
      // Question 3
      "3a": "analytics",
      "3b": "creative",
      "3c": "communication",
      "3d": "technology",
      "3e": "leadership",
      "3f": "precision",
      "3g": "empathy",
      "3h": "adventure",
      // Question 4
      "4a": "leadership",
      "4b": "innovation",
      "4c": "analytics",
      "4d": "execution",
      "4e": "networking",
      "4f": "support",
      "4g": "quality",
      "4h": "problem-solving",
      // Question 5
      "5a": "technology",
      "5b": "arts",
      "5c": "business",
      "5d": "healthcare",
      "5e": "education",
      "5f": "sustainability",
      "5g": "science",
      "5h": "media",
      // Question 6
      "6a": "programming",
      "6b": "design",
      "6c": "marketing",
      "6d": "medical",
      "6e": "teaching",
      "6f": "management",
      "6g": "consulting",
      "6h": "rd",
      // Question 7
      "7a": "tech-impact",
      "7b": "creative-impact",
      "7c": "business-impact",
      "7d": "health-impact",
      "7e": "education-impact",
      "7f": "environmental-impact",
      "7g": "research-impact",
      "7h": "social-impact",
      // Question 8
      "8a": "independent",
      "8b": "collaborative",
      "8c": "interpersonal",
      "8d": "detail-oriented",
      "8e": "multitasking",
      "8f": "structured",
      "8g": "innovative",
      "8h": "complex-solving",
      // Question 9
      "9a": "coding",
      "9b": "design-tools",
      "9c": "data-analysis",
      "9d": "medical-skills",
      "9e": "teaching-methods",
      "9f": "project-management",
      "9g": "digital-marketing",
      "9h": "research-methods",
      // Question 10
      "10a": "tech-innovation",
      "10b": "artistic-recognition",
      "10c": "business-success",
      "10d": "medical-impact",
      "10e": "educational-success",
      "10f": "environmental-success",
      "10g": "discovery",
      "10h": "social-connection",
    };

    return fieldMapping[answerId] || "";
  };

  const generateCareerRecommendations = (fieldCounts: {
    [field: string]: number;
  }) => {
    // Hardcoded career database - in real app this would come from AI API
    const careerDatabase = [
      {
        career: "Lập trình viên Full-stack",
        fields: ["technology", "programming", "coding", "problem-solving"],
        description:
          "Phát triển ứng dụng web và mobile hoàn chỉnh, từ giao diện người dùng đến hệ thống backend",
      },
      {
        career: "UI/UX Designer",
        fields: ["design", "creative", "design-tools", "arts"],
        description:
          "Thiết kế giao diện và trải nghiệm người dùng cho các sản phẩm số",
      },
      {
        career: "Data Scientist",
        fields: ["data", "analytics", "data-analysis", "research"],
        description:
          "Phân tích dữ liệu lớn để tìm ra insights và dự đoán xu hướng",
      },
      {
        career: "Product Manager",
        fields: ["management", "leadership", "business", "project-management"],
        description: "Quản lý phát triển sản phẩm từ ý tưởng đến thị trường",
      },
      {
        career: "Digital Marketing Specialist",
        fields: [
          "marketing",
          "digital-marketing",
          "communication",
          "social-impact",
        ],
        description: "Xây dựng và triển khai chiến lược marketing online",
      },
      {
        career: "Bác sĩ đa khoa",
        fields: ["healthcare", "medical", "medical-skills", "health-impact"],
        description:
          "Chẩn đoán, điều trị và chăm sóc sức khỏe toàn diện cho bệnh nhân",
      },
      {
        career: "Giáo viên THPT",
        fields: [
          "education",
          "teaching",
          "teaching-methods",
          "educational-success",
        ],
        description: "Giảng dạy và định hướng học sinh trung học phổ thông",
      },
      {
        career: "Kỹ sư môi trường",
        fields: [
          "environment",
          "sustainability",
          "environmental-impact",
          "science",
        ],
        description: "Nghiên cứu và phát triển giải pháp bảo vệ môi trường",
      },
      {
        career: "Nhà nghiên cứu AI",
        fields: ["research", "technology", "innovation", "discovery"],
        description: "Nghiên cứu và phát triển các thuật toán trí tuệ nhân tạo",
      },
      {
        career: "Creative Director",
        fields: ["arts", "creative", "design", "artistic-recognition"],
        description:
          "Dẫn dắt và chỉ đạo sáng tạo cho các dự án quảng cáo và truyền thông",
      },
      {
        career: "Startup Founder",
        fields: ["business", "innovation", "leadership", "business-success"],
        description: "Khởi nghiệp và xây dựng doanh nghiệp công nghệ",
      },
      {
        career: "Social Media Manager",
        fields: ["media", "communication", "social-connection", "networking"],
        description:
          "Quản lý và phát triển sự hiện diện trên các nền tảng mạng xã hội",
      },
    ];

    // Calculate match scores
    const careerScores = careerDatabase.map((career) => {
      let score = 0;
      career.fields.forEach((field) => {
        score += fieldCounts[field] || 0;
      });
      return {
        career: career.career,
        match: Math.min(95, Math.max(65, score * 8 + Math.random() * 10)), // Random factor for demo
        description: career.description,
      };
    });

    // Sort by match score and return top 3
    return careerScores.sort((a, b) => b.match - a.match).slice(0, 3);
  };

  const restartQuiz = () => {
    navigate("/quiz");
  };

  const goHome = () => {
    navigate("/quiz");
  };

  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang phân tích kết quả...</p>
        </div>
      </div>
    );
  }

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
              Dựa trên AI phân tích câu trả lời của bạn, đây là 3 ngành nghề
              được gợi ý hàng đầu
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
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                      index === 0
                        ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                        : index === 1
                        ? "bg-gradient-to-br from-gray-400 to-gray-600"
                        : "bg-gradient-to-br from-orange-400 to-orange-600"
                    }`}
                  >
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
                      className={`h-3 rounded-full transition-all duration-1000 delay-${
                        index * 200
                      } ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                          : index === 1
                          ? "bg-gradient-to-r from-gray-400 to-gray-600"
                          : "bg-gradient-to-r from-orange-400 to-orange-600"
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
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-medium rounded-xl transform transition-transform duration-300 ease-out hover:scale-105 shadow-lg hover:shadow-2xl"
              >
                🔄 Làm lại trắc nghiệm
              </Button>
              <Button
                onClick={goHome}
                className="px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white text-sm font-medium rounded-xl transform transition-transform duration-300 ease-out hover:scale-105 shadow-lg hover:shadow-2xl"
              >
                🏠 Về trang chủ
              </Button>
            </div>

            <p className="text-purple-300 text-sm">
              Kết quả này chỉ mang tính chất tham khảo. Hãy khám phá thêm để tìm
              ra con đường phù hợp nhất!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
