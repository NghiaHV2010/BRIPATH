import { Router } from "express";
import { authenticationMiddleware, authorizationMiddleware } from "../middlewares/auth.middleware";
import { createCompany, feedbackCV, getAllCompanies, getApplicantsByStatus, getCompaniesByFilter, getCompanyByID, updateApplicantStatus, createCompanyLabel } from "../controllers/company.controller";

const companyRouter = Router();

companyRouter.post('/company', authenticationMiddleware, createCompany);
companyRouter.post('/company/labels', authenticationMiddleware, authorizationMiddleware('Admin'), createCompanyLabel);
companyRouter.get('/companies', getAllCompanies);
companyRouter.get('/company', getCompanyByID);
companyRouter.get('/filter-companies', getCompaniesByFilter);
companyRouter.post('/feedback/cv/:cvId', authenticationMiddleware, authorizationMiddleware("Company"), feedbackCV);

companyRouter.get('/applicants', authenticationMiddleware, authorizationMiddleware("Company"), getApplicantsByStatus);
companyRouter.put('/applicant/:applicantId', authenticationMiddleware, authorizationMiddleware("Company"), updateApplicantStatus);

export default companyRouter;