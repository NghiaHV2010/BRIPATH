import { useNavigate } from "react-router-dom";
import { useQuizStore } from "../../store/quiz.store";
import { createCPAPI } from "../../api/quiz_api";
import type { JobType } from "../../api/quiz_api";
import { Layout } from "../../components/layout";
import { Button } from "../../components/ui/button";
import { Trophy, Briefcase } from "lucide-react";

import { useState } from "react";

export default function QuizResultsPage() {
  const navigate = useNavigate();
  const { results, isLoading, error, resetQuiz } = useQuizStore();
  const [cpLoading, setCPLoading] = useState(false);

  const handleJobTypeClick = async (jobType: JobType) => {
    setCPLoading(true);
    try {
      const careerPathData = await createCPAPI(jobType.id, jobType.job_type);
      navigate("/quiz/career-path", {
        state: {
          careerPath: careerPathData,
          isLoading: false,
        },
      });
    } catch (err) {
      setCPLoading(false);
      console.error("Error creating career path:", err);
    }
  };

  const handleRetakeQuiz = () => {
    resetQuiz();
    navigate("/quiz");
  };

  const handleExploreJobs = () => {
    navigate("/jobs");
  };

  if (isLoading || cpLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md">
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={() => navigate("/quiz")} variant="outline">
              Quay lại
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (results.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Button onClick={() => navigate("/quiz")}>Làm lại quiz</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-8 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-6">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Kết Quả Định Hướng Nghề Nghiệp
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Dựa trên câu trả lời của bạn, đây là những lĩnh vực nghề nghiệp
              phù hợp nhất
            </p>
          </div>

          {/* All Results */}
          <div className="grid gap-6 mb-8">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {result.job_category}
                </h2>
                <p className="text-gray-600 mb-4">{result.description}</p>

                {/* Job Types */}
                <div className="grid md:grid-cols-2 gap-4">
                  {result.job_types.map((jobType: JobType) => (
                    <div
                      key={jobType.id}
                      onClick={() => handleJobTypeClick(jobType)}
                      className="cursor-pointer bg-gray-100 rounded-lg p-4 hover:bg-blue-50 transition"
                    >
                      <h3 className="font-semibold text-gray-900">
                        {jobType.job_type}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {jobType.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleExploreJobs} size="lg" variant={"emerald"}>
              <Briefcase className="w-5 h-5" />
              Khám Phá Việc Làm
            </Button>

            <Button
              onClick={handleRetakeQuiz}
              size="lg"
              variant="outline"
              className="flex items-center gap-2"
            >
              Làm Lại Bài Quiz
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
