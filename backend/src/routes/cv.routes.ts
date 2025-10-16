import { Router } from "express";
import { deleteCV, getSuitableJobs, getUserCV, getUserCVById, uploadCV } from "../controllers/cv.controller";
import { authenticationMiddleware } from "../middlewares/auth.middleware";

const cvRouter = Router();
cvRouter.use(authenticationMiddleware);

cvRouter.post('/cv/upload', uploadCV);
cvRouter.get('/cv', getUserCV);
cvRouter.get('/cv/:id', getUserCVById);
cvRouter.delete('/cv/:id', deleteCV);
cvRouter.get('/cv/suitable/:id', getSuitableJobs);

export default cvRouter;