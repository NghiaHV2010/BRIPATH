import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/auth.middleware";
import { createCompany } from "../controllers/company.controller";

const companyRouter = Router();

companyRouter.post('/company', authenticationMiddleware, createCompany);

export default companyRouter;