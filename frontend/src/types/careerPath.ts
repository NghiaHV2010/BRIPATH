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
