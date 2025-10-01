import { Router } from "express";
import { createMyAnswer, getAllQuestions, getAnswersByQuestion, getSuitableJobCategories } from "../controllers/question.controller";
import { authenticationMiddleware } from "../middlewares/auth.middleware";

const questionRouter = Router();

questionRouter.get('/questions', authenticationMiddleware, getAllQuestions);
questionRouter.get('/answers/:questionId', authenticationMiddleware, getAnswersByQuestion);
questionRouter.post('/answers', authenticationMiddleware, createMyAnswer);
questionRouter.get('/finished', authenticationMiddleware, getSuitableJobCategories);

export default questionRouter;