import { Router } from "express";
import { createMyAnswer, getAllQuestions, getAnswersByQuestion, getSuitableJobCategories } from "../controllers/question.controller";
import { authenticationMiddleware } from "../middlewares/auth.middleware";

const questionRouter = Router();
questionRouter.use(authenticationMiddleware);

questionRouter.get('/questions', getAllQuestions);
questionRouter.get('/answers/:questionId', getAnswersByQuestion);
questionRouter.post('/answers', createMyAnswer);
questionRouter.get('/finished', getSuitableJobCategories);

export default questionRouter;