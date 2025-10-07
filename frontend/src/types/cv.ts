export interface CVRecord {
  id: number;
  fullname: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  introduction?: string | null;
  apply_job?: string | null;
  career_goal?: string | null;
  soft_skills?: string[] | null;
  primary_skills?: string[] | null;
  created_at?: string;
  updated_at?: string;
  awards: CVAward[];
  certificates: CVCertificate[];
  educations: CVEducation[];
  experiences: CVExperience[];
  projects: CVProject[];
  references: CVReference[];
  languages: CVLanguage[];
}

export interface CVPeriod {
  start_date?: string | null;
  end_date?: string | null;
}

export interface CVExperience extends CVPeriod {
  id: number;
  company_name?: string | null;
  title?: string | null;
  description?: string | null;
}

export interface CVEducation extends CVPeriod {
  id: number;
  school?: string | null;
  graduated_type?: string | null;
  gpa?: number | null;
}

export interface CVProject extends CVPeriod {
  id: number;
  title?: string | null;
  description?: string | null;
}

export interface CVCertificate extends CVPeriod {
  id: number;
  title?: string | null;
  description?: string | null;
  link?: string | null;
}

export interface CVAward extends CVPeriod {
  id: number;
  title?: string | null;
  description?: string | null;
}

export interface CVReference {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
}

export interface CVLanguage {
  id: number;
  name: string;
  level?: string | null;
  certificate?: string | null;
}
