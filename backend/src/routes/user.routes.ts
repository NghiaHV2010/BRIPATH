import { Router } from "express";
import { authenticationMiddleware, authorizationMiddleware } from "../middlewares/auth.middleware";
import { applyJob, feedbackCompany, followCompany, saveJob } from "../controllers/user.controller";

const userRouter = Router();

userRouter.get('/save-job/:jobId', authenticationMiddleware, saveJob);
userRouter.get('/follow-company/:companyId', authenticationMiddleware, followCompany);
userRouter.post('/feedback/:companyId', authenticationMiddleware, feedbackCompany);
userRouter.post('/apply-job/:jobId', authenticationMiddleware, applyJob);

export default userRouter;