import axiosConfig from "../config/axios.config";

export const fetchQuestions = () =>
  axiosConfig.get("/questions")
    .then(res => res.data?.data ?? []);

export const fetchAnswersByQuestion = (questionId: number) =>
  axiosConfig.get(`/answers/${questionId}`)
    .then(res => res.data?.data ?? []);

export const answerQuiz = (questionId: number, answerId: number[]) =>
  axiosConfig.post("/answers",
    { question_id: questionId, answer_id: answerId },
  ).then(res => res.data?.data ?? {});

  export const submitQuiz = () =>
  axiosConfig.get("/question/finished")
    .then(res => res.data?.data ?? {}); 

export const createCPAPI = (
  id: number,
  jobSpecialized: string) =>
axiosConfig.post("/careerpath", { id, jobSpecialized })
  .then(res => res.data?.data ?? {});


export const resetAnswer = async () => {
  const res = await axiosConfig.delete("/question/restart");
  console.log("dit me mayf");
  return res.status; 
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