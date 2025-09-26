import { Router } from "express";
import { deleteCV, getUserCV, uploadCV } from "../controllers/cv.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const cvRouter = Router();

cvRouter.post('/cv/upload', authMiddleware, uploadCV);

cvRouter.get('/cv', authMiddleware, getUserCV);

cvRouter.delete('/cv/:id', authMiddleware, deleteCV);

export default cvRouter;