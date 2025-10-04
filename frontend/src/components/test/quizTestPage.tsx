import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchQuestions, fetchAnswersByQuestion } from "../../api";
import type { QuizQuestion, QuizAnswer } from "../../api";

// Minimal, clean quiz page (no gradients / animations)
export default function QuizTestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  interface LocationState {
    questions?: QuizQuestion[];
  }
  const initial = (location.state as LocationState | null)?.questions;

  const [questions, setQuestions] = useState<QuizQuestion[]>(initial || []);
  const [answersByQuestion, setAnswersByQuestion] = useState<
    Record<number, QuizAnswer[]>
  >({});
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<Record<number, number[]>>({});
  const [loadingQ, setLoadingQ] = useState(false);
  const [loadingA, setLoadingA] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (questions.length) return;
    const load = async () => {
      setLoadingQ(true);
      try {
        setQuestions(await fetchQuestions());
      } catch {
        setError("Không tải được câu hỏi");
      } finally {
        setLoadingQ(false);
      }
    };
    load();
  }, [questions.length]);

  useEffect(() => {
    const q = questions[current];
    if (!q || answersByQuestion[q.id]) return;
    const load = async () => {
      setLoadingA(true);
      try {
        const ans = await fetchAnswersByQuestion(q.id);
        setAnswersByQuestion((p) => ({ ...p, [q.id]: ans }));
      } catch {
        setError("Không tải được đáp án");
      } finally {
        setLoadingA(false);
      }
    };
    load();
  }, [current, questions, answersByQuestion]);

  const toggleAnswer = (qId: number, aId: number) => {
    setSelected((prev) => {
      const list = prev[qId] || [];
      return list.includes(aId)
        ? { ...prev, [qId]: list.filter((id) => id !== aId) }
        : list.length < 3
        ? { ...prev, [qId]: [...list, aId] }
        : prev;
    });
  };

  const next = () => {
    window.scrollTo(0, 0);
    if (current < questions.length - 1) setCurrent((c) => c + 1);
    else navigate("/quiz/results", { state: { answers: selected } });
  };
  const prev = () => {
    if (current > 0) {
      window.scrollTo(0, 0);
      setCurrent((c) => c - 1);
    }
  };

  const q = questions[current];
  const chosen = q ? selected[q.id] || [] : [];
  const progress = questions.length
    ? ((current + 1) / questions.length) * 100
    : 0;
  const answers = q ? answersByQuestion[q.id] || [] : [];

  const label = (a: QuizAnswer) => {
    const any = a as unknown as {
      answer?: string;
      text?: string;
      content?: string;
    };
    return any.answer || any.text || any.content || `Đáp án ${a.id}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold">Trắc nghiệm nghề nghiệp</h1>
        <p className="text-xs text-gray-500">Chọn tối đa 3 đáp án mỗi câu.</p>
      </header>

      <div className="space-y-2">
        <div className="flex justify-between text-[11px] text-gray-600">
          <span>
            {loadingQ
              ? "Đang tải..."
              : questions.length
              ? `Câu ${current + 1} / ${questions.length}`
              : "Không có câu hỏi"}
          </span>
          {questions.length > 0 && (
            <span>{Math.round(progress)}% hoàn thành</span>
          )}
        </div>
        <div className="w-full h-2 rounded bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-gray-800 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <main className="border rounded p-4 bg-white space-y-4">
        {error && <div className="text-xs text-red-600">{error}</div>}
        {q ? (
          <>
            <h2 className="text-sm font-medium leading-relaxed">
              {q.question}
            </h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {loadingA && !answers.length && (
                <li className="col-span-2 text-center text-xs text-gray-500">
                  Đang tải đáp án...
                </li>
              )}
              {answers.map((a) => {
                const active = chosen.includes(a.id);
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => toggleAnswer(q.id, a.id)}
                      className={`w-full text-left text-xs rounded border px-3 py-2 leading-snug transition-colors ${
                        active
                          ? "bg-gray-800 text-white border-gray-800"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {label(a)}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-gray-500">
                Đã chọn {chosen.length}/3
              </span>
              {chosen.length === 3 && (
                <span className="text-[11px] text-gray-600">(Đủ tối đa)</span>
              )}
            </div>
          </>
        ) : (
          <p className="text-xs text-gray-500">
            {loadingQ ? "Đang tải câu hỏi" : "Không có dữ liệu"}
          </p>
        )}
      </main>

      <nav className="flex gap-2">
        <button
          onClick={prev}
          disabled={current === 0 || loadingQ}
          className="flex-1 px-4 py-2 rounded border text-xs disabled:opacity-40"
        >
          ← Trước
        </button>
        <button
          onClick={next}
          disabled={loadingQ || loadingA || !q || chosen.length === 0}
          className="flex-1 px-4 py-2 rounded bg-gray-800 text-white text-xs disabled:opacity-40"
        >
          {questions.length && current === questions.length - 1
            ? "Nộp bài"
            : "Tiếp →"}
        </button>
      </nav>

      <p className="text-[11px] text-gray-400">
        Chọn những đáp án phản ánh đúng nhất sở thích và thế mạnh của bạn.
      </p>
    </div>
  );
}
