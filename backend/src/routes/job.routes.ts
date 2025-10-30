import { Router } from "express";
import { createJob, getAllJobs, getJobByID, getJobsByCompanyId, getJobsByFilter, updateJob, getAllJobCategories, getAllJobLabels, deleteJob, filterSuitableCVforJob, getAllSuitableCVs, createJobView, getRecommendedJobs, createMockStats, getJobDetailsByCompanyId, getJobStats } from "../controllers/job.controller";
import { authenticationMiddleware, authorizationMiddleware } from "../middlewares/auth.middleware";
import { subscriptionMiddleware, subscriptionPermissionMiddleware } from "../middlewares/subscription.middleware";

const jobRouter = Router();

jobRouter.get('/jobs', getAllJobs);
jobRouter.get('/job', getJobByID);
jobRouter.get('/filter-jobs', getJobsByFilter);
jobRouter.get('/recommend-jobs', getRecommendedJobs);
jobRouter.get('/my-jobs', authenticationMiddleware, authorizationMiddleware("Company"), getJobsByCompanyId);
jobRouter.get('/my-jobs/:jobId', authenticationMiddleware, authorizationMiddleware("Company"), getJobDetailsByCompanyId);
jobRouter.get('/job-stats/:jobId', authenticationMiddleware, authorizationMiddleware("Company"), getJobStats);

jobRouter.post('/job-view/:jobId', authenticationMiddleware, createJobView);

jobRouter.post('/job', authenticationMiddleware, authorizationMiddleware("Company"), subscriptionMiddleware, createJob);
jobRouter.put('/job/:jobId', authenticationMiddleware, authorizationMiddleware("Company"), updateJob);
jobRouter.delete('/job/:jobId', authenticationMiddleware, authorizationMiddleware("Company"), deleteJob);

jobRouter.get('/job/suitable/:jobId', authenticationMiddleware, authorizationMiddleware("Company"), subscriptionPermissionMiddleware, filterSuitableCVforJob);
jobRouter.get('/job/suitable-all/:jobId', authenticationMiddleware, authorizationMiddleware("Company"), subscriptionPermissionMiddleware, getAllSuitableCVs);

jobRouter.get('/job/categories', getAllJobCategories);
jobRouter.get('/job/labels', getAllJobLabels);

export default jobRouter;