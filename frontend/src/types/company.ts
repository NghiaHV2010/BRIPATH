// Company Types based on backend Prisma schema

export const CompanyType = {
  BUSINESS_HOUSEHOLD: "business_household" as const, // Hộ kinh doanh
  BUSINESS: "business" as const, // Doanh nghiệp
} as const;

export type CompanyType = typeof CompanyType[keyof typeof CompanyType];

export interface CompanyField {
  id: number;
  field_name: string;
}

export interface CompanyLabel {
  id: number;
  label_name: string;
}

export interface Company {
  id: string;
  company_name: string;
  company_website?: string | null;
  address_street: string;
  address_ward: string;
  address_city: string;
  address_country: string;
  email?: string | null;
  phone?: string | null;
  business_certificate?: string | null;
  company_type: CompanyType;
  description?: string | null;
  logo_url?: string | null;
  background_url?: string | null;
  employees?: number | null;
  is_verified: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  fax_code?: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  field_id?: number | null;
  label_id?: number | null;
  fields?: CompanyField | null;
  companyLabels?: CompanyLabel | null;
}

// Form data for company registration
export interface CompanyRegistrationForm {
  company_name: string;
  company_website?: string;
  address_street: string;
  address_ward: string;
  address_city: string;
  address_country: string;
  email?: string;
  phone?: string;
  business_certificate?: string;
  company_type: CompanyType;
  description?: string;
  logo_url?: string;
  background_url?: string;
  employees?: number;
  fax_code?: string;
  field_id?: number;
  label_id?: number;
}

// Company registration step data
export interface CompanyRegistrationStepData {
  // Step 1: Basic Information
  company_name: string;
  email: string;
  phone: string;
  address_street: string;
  address_ward: string;
  address_city: string;
  address_country: string;
  
  // Step 2: Company Details
  company_website?: string;
  company_type: CompanyType;
  employees?: number;
  fax_code?: string;
  business_certificate?: string;
  
  // Step 3: Additional Info
  description?: string;
  field_id?: number;
  label_id?: number;
  logo_url?: string;
  background_url?: string;
}

// API Response types
export interface CompanyCreationResponse {
  message: string;
  company?: Partial<Company>;
}

// Validation errors
export interface CompanyFormErrors {
  company_name?: string;
  email?: string;
  phone?: string;
  address_street?: string;
  address_ward?: string;
  address_city?: string;
  address_country?: string;
  company_website?: string;
  employees?: string;
  fax_code?: string;
  business_certificate?: string;
  description?: string;
}