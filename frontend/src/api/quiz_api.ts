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

export const createCPAPI = (id: number, jobSpecialize: string) =>
  axiosConfig.post("/careerpath", { id, jobSpecialize })
    .then(res => res.data ?? {});


export const resetAnswer = async () => {
  const res = await axiosConfig.delete("/question/restart");
  return res.status; 
};


export const getUserCareerPath = async (): Promise<CareerPathResponse> => {
  const response = await axiosConfig.get('/careerpath');
  return response.data;
};

export const getUserCareerPathById = async (careerPathId: number): Promise<CareerPathResponse> => {
  const response = await axiosConfig.get(`/careerpath/${careerPathId}`);
  return response.data;
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


export type JobType = {
  id: number;
  job_type: string;
  description: string;
  score: number;
};

export interface SuitableJobCategory {
id: number;
  job_category: string;
  description: string;
  score: number;
  job_types: JobType[];
}

export interface CareerPathStep {
  id: number;
  title: string;
  description: string;
  resources: string;
  career_id: number;
}

export interface CareerPath {
  id: number;
  title: string;
  description: string;
  resources: string;
  level: string;
  estimate_duration: string;
  user_id: string;
  jobspecialized_id: number;
  careerPathSteps: CareerPathStep[];
}

export interface CareerPathResponse {
  success: boolean;
  data: CareerPath;
}
