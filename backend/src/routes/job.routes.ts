import { Router } from "express";
import { getAllJobs, getJobByID, getJobsByFilter } from "../controllers/job.controller";

const jobRouter = Router();

jobRouter.get('/jobs', getAllJobs);
jobRouter.get('/job', getJobByID);
jobRouter.get('/filter-jobs', getJobsByFilter)

export default jobRouter;