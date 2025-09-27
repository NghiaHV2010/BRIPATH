import { Router } from "express";
import { deleteCV, getUserCV, uploadCV } from "../controllers/cv.controller";
import { authenticationMiddleware } from "../middlewares/auth.middleware";

const cvRouter = Router();

cvRouter.post('/cv/upload', authenticationMiddleware, uploadCV);

cvRouter.get('/cv', authenticationMiddleware, getUserCV);

cvRouter.delete('/cv/:id', authenticationMiddleware, deleteCV);

export default cvRouter;