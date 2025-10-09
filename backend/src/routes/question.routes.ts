import { Router } from "express";
import { createUserAnswer, getAllQuestions, getAnswersByQuestion, getSuitableJobCategories, restartUserAnswer } from "../controllers/question.controller";
import { authenticationMiddleware } from "../middlewares/auth.middleware";

const questionRouter = Router();
questionRouter.use(authenticationMiddleware);

questionRouter.get('/questions', getAllQuestions);
questionRouter.get('/answers/:questionId', getAnswersByQuestion);
questionRouter.post('/answers', createUserAnswer);
questionRouter.get('/question/finished', getSuitableJobCategories);
questionRouter.delete('/question/restart', restartUserAnswer);

export default questionRouter;