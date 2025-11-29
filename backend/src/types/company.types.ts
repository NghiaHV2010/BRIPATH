export interface CreateCompanyRequestDto {
    fax_code: string;
    business_certificate: string;
    company_type: "business_househole" | "business";
    field: string;
}