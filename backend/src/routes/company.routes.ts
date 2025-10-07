import { Router } from "express";
import { authenticationMiddleware, authorizationMiddleware } from "../middlewares/auth.middleware";
import { createCompany, createCompanyLabel } from "../controllers/company.controller";

const companyRouter = Router();

companyRouter.post('/company', authenticationMiddleware, createCompany);
companyRouter.post('/company/labels', authenticationMiddleware, authorizationMiddleware('Admin'), createCompanyLabel);

export default companyRouter;