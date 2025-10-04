import axiosConfig from "../config/axios.config";

export const fetchQuestions = () =>
  axiosConfig.get("/questions", { withCredentials: true })
    .then(res => res.data?.data ?? []);

export const fetchAnswersByQuestion = (questionId: number) =>
  axiosConfig.get(`/answers/${questionId}`, { withCredentials: true })
    .then(res => res.data?.data ?? []);

export const submitQuiz = (questionId: number, answerId: number[]) =>
  axiosConfig.post("/answers",
    { question_id: questionId, answer_id: answerId },
    { withCredentials: true }
  ).then(res => res.data?.data ?? {});

  
export const fetchSuitableJobCategories = async (): Promise<SuitableJobCategory[]> => {
  const res = await axiosConfig.get('/finished', { withCredentials: true });
  return res.data?.data ?? [];
};


export interface QuizQuestion {
  id: number;
  question: string;
}

export interface QuizAnswer {
  id: number;
  answer: string;
  question_id: number;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
}


export interface SuitableJobCategory {
  id: number;
  job_category: string;
  description: string;
  score: number;
}