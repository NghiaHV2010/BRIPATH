import { Router } from "express";
import { createCareerPath, createUserAnswer, getAllQuestions, getAnswersByQuestion, getSuitableJobCategories, getUserCareerPathById, getUserCareerPaths, restartUserAnswer } from "../controllers/question.controller";
import { authenticationMiddleware } from "../middlewares/auth.middleware";

const questionRouter = Router();
questionRouter.use(authenticationMiddleware);

questionRouter.get('/questions', getAllQuestions);
questionRouter.get('/answers/:questionId', getAnswersByQuestion);
questionRouter.post('/answers', createUserAnswer);
questionRouter.get('/question/finished', getSuitableJobCategories);
questionRouter.delete('/question/restart', restartUserAnswer);

questionRouter.post('/careerpath', createCareerPath);
questionRouter.get('/careerpath', getUserCareerPaths);
questionRouter.get('/careerpath/:careerPathId', getUserCareerPathById);

export default questionRouter;