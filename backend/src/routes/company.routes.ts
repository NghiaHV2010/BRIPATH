import { Router } from "express";
import { authenticationMiddleware, authorizationMiddleware } from "../middlewares/auth.middleware";
import { createCompany, feedbackCV, getAllCompanies, getApplicantsByStatus, getCompaniesByFilter, getCompanyByID, updateApplicantStatus, getAllCompanyFields, getAllCompanyLabel, updateCompanyProfile } from "../controllers/company.controller";

const companyRouter = Router();

companyRouter.get('/companies', getAllCompanies);
companyRouter.get('/company', getCompanyByID);
companyRouter.get('/filter-companies', getCompaniesByFilter);

companyRouter.get('/company/fields', getAllCompanyFields);
companyRouter.get('/company/label', getAllCompanyLabel);

companyRouter.post('/company', authenticationMiddleware, createCompany);
companyRouter.put('/company/:companyId', authenticationMiddleware, authorizationMiddleware("Company"), updateCompanyProfile)

companyRouter.post('/feedback/cv/:cvId', authenticationMiddleware, authorizationMiddleware("Company"), feedbackCV);

companyRouter.get('/applicants', authenticationMiddleware, authorizationMiddleware("Company"), getApplicantsByStatus);
companyRouter.put('/applicant/:applicantId', authenticationMiddleware, authorizationMiddleware("Company"), updateApplicantStatus);

export default companyRouter;