import { Router } from "express";
import { createJob, getAllJobs, getJobByID, getJobsByCompanyId, getJobsByFilter, updateJob, getAllJobCategories, getAllJobLabels, deleteJob, filterSuitableCVforJob, getAllSuitableCVs, createJobView, getRecommendedJobs, createMockStats } from "../controllers/job.controller";
import { authenticationMiddleware, authorizationMiddleware } from "../middlewares/auth.middleware";
import { subscriptionMiddleware, subscriptionPermissionMiddleware } from "../middlewares/subscription.middleware";

const jobRouter = Router();

jobRouter.get('/jobs', getAllJobs);
jobRouter.get('/job', getJobByID);
jobRouter.get('/filter-jobs', getJobsByFilter);
jobRouter.get('/recommend-jobs', getRecommendedJobs);
jobRouter.get('/my-jobs', authenticationMiddleware, authorizationMiddleware("Company"), getJobsByCompanyId);

jobRouter.post('/job-view/:jobId', authenticationMiddleware, createJobView);

jobRouter.post('/job', authenticationMiddleware, authorizationMiddleware("Company"), subscriptionMiddleware, createJob);
jobRouter.put('/job/:jobId', authenticationMiddleware, authorizationMiddleware("Company"), updateJob);
jobRouter.delete('/job/:jobId', authenticationMiddleware, authorizationMiddleware("Company"), deleteJob);

jobRouter.get('/job/suitable/:jobId', authenticationMiddleware, authorizationMiddleware("Company"), subscriptionPermissionMiddleware, filterSuitableCVforJob);
jobRouter.get('/job/suitable-all/:jobId', authenticationMiddleware, authorizationMiddleware("Company"), subscriptionPermissionMiddleware, getAllSuitableCVs);

jobRouter.get('/job/categories', getAllJobCategories);
jobRouter.get('/job/labels', getAllJobLabels);

jobRouter.get('/create-mock-data', authenticationMiddleware, createMockStats);

export default jobRouter;