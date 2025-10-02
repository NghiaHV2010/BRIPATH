import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/auth.middleware";
import { createCompany, getAllCompanies, getCompaniesByFilter, getCompanyByID } from "../controllers/company.controller";

const companyRouter = Router();

companyRouter.post('/company', authenticationMiddleware, createCompany);
companyRouter.get('/companies', getAllCompanies);
companyRouter.get('/company', getCompanyByID);
companyRouter.get('/filter-companies', getCompaniesByFilter);

export default companyRouter;