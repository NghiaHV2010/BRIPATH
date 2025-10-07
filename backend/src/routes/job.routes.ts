import { Router } from "express";
import { getAllJobs, getJobByID, createJobLabel } from "../controllers/job.controller";
import { authenticationMiddleware, authorizationMiddleware } from "../middlewares/auth.middleware";

const jobRouter = Router();

jobRouter.get('/jobs', getAllJobs);
jobRouter.get('/job', getJobByID);
jobRouter.post('/job/labels', authenticationMiddleware, authorizationMiddleware('Admin'), createJobLabel);

export default jobRouter;