import { Router } from "express";
import { getAllJobs, getJobByID } from "../controllers/job.controller";

const jobRouter = Router();

jobRouter.get('/jobs', getAllJobs);
jobRouter.get('/job', getJobByID);

export default jobRouter;