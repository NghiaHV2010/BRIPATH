import { Router } from "express";
import { createJob, getAllJobs, getJobByID, getJobsByCompanyId, getJobsByFilter, updateJob, getAllJobCategories, getAllJobLabels, deleteJob } from "../controllers/job.controller";
import { authenticationMiddleware, authorizationMiddleware } from "../middlewares/auth.middleware";

const jobRouter = Router();

jobRouter.get('/jobs', getAllJobs);
jobRouter.get('/job', getJobByID);
jobRouter.get('/filter-jobs', getJobsByFilter);
jobRouter.get('/jobs/:companyId', getJobsByCompanyId);

jobRouter.post('/job', authenticationMiddleware, authorizationMiddleware("Company"), createJob);
jobRouter.put('/job/:jobId', authenticationMiddleware, authorizationMiddleware("Company"), updateJob);
jobRouter.delete('/job/:jobId', authenticationMiddleware, authorizationMiddleware("Company"), deleteJob);

jobRouter.get('/job/categories', getAllJobCategories);
jobRouter.get('/job/labels', getAllJobLabels);

export default jobRouter;