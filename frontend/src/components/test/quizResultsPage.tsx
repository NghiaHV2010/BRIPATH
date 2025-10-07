import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchSuitableJobCategories, submitQuiz } from "../../api/quiz_api";
import type { SuitableJobCategory } from "../../api/quiz_api";

interface LocationStateResults {
  answers?: Record<number, number[]>; // { questionId: number[] }
}

export default function QuizResultsPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const selections = useMemo(
    () => (state as LocationStateResults)?.answers || {},
    [state]
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jobs, setJobs] = useState<SuitableJobCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Redirect if no selections
  useEffect(() => {
    if (!Object.keys(selections).length) navigate("/quiz");
  }, [selections, navigate]);

  // Submit answers sequentially then fetch job categories
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setSaving(true);
        // Submit each question's answers
        for (const [qStr, answerIds] of Object.entries(selections)) {
          if (!answerIds.length) continue;
          await submitQuiz(Number(qStr), answerIds);
          if (cancelled) return;
        }
        setSubmitted(true);
        // Fetch recommendations
        const data = await fetchSuitableJobCategories();
        if (!cancelled) setJobs(data);
      } catch {
        if (!cancelled) setError("Không thể lưu hoặc lấy gợi ý nghề nghiệp");
      } finally {
        if (!cancelled) {
          setLoading(false);
          setSaving(false);
        }
      }
    };
    if (Object.keys(selections).length) run();
    return () => {
      cancelled = true;
    };
  }, [selections]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-sm text-gray-600">
        Đang xử lý kết quả...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 text-center">
        <p className="text-red-600 text-sm">{error}</p>
        <button
          className="px-4 py-2 rounded bg-gray-800 text-white text-xs"
          onClick={() => navigate("/quiz")}
        >
          Quay lại làm lại
        </button>
      </div>
    );
  }

  const empty = !jobs.length;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">Kết quả trắc nghiệm</h1>
        <p className="text-xs text-gray-500">
          {submitted ? "Đã lưu lựa chọn của bạn." : "Đang lưu lựa chọn..."}
        </p>
      </header>

      {saving && (
        <div className="text-xs text-blue-600">Đang gửi dữ liệu...</div>
      )}

      {empty ? (
        <div className="rounded border p-4 text-sm text-gray-600 bg-gray-50">
          Chưa đủ dữ liệu để gợi ý nghề nghiệp. Hãy trả lời nhiều câu hơn.
        </div>
      ) : (
        <ul className="space-y-3">
          {jobs.map((j) => (
            <li
              key={j.id}
              className="border rounded p-3 bg-white flex flex-col gap-1"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{j.job_category}</span>
                <span className="text-xs text-gray-500 font-mono">
                  {(j.score * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-snug">
                {j.description}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => navigate("/quiz")}
          className="px-4 py-2 rounded bg-gray-800 text-white text-xs"
        >
          Làm lại
        </button>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 rounded border text-xs"
        >
          Trang chủ
        </button>
      </div>

      <p className="text-[11px] text-gray-400 pt-2">
        * Gợi ý dựa trên mức độ tương đồng embedding các lựa chọn của bạn.
      </p>
    </div>
  );
}
