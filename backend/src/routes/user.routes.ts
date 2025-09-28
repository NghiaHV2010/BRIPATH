import { Router } from "express";
import { authenticationMiddleware, authorizationMiddleware } from "../middlewares/auth.middleware";
import { applyJob, feedbackCompany, followCompany, saveJob } from "../controllers/user.controller";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "../config/env.config";
import fs from "fs";

const userRouter = Router();

userRouter.get('/save-job/:jobId', authenticationMiddleware, saveJob);
userRouter.get('/follow-company/:companyId', authenticationMiddleware, followCompany);
userRouter.post('/feedback/:companyId', authenticationMiddleware, feedbackCompany);
userRouter.post('/apply-job/:jobId', authenticationMiddleware, applyJob);

userRouter.get('/test', async (req, res) => {
    const openai = new OpenAI({
        apiKey: OPENAI_API_KEY
    });

    const file = await openai.files.create({
        file: fs.createReadStream('training.jsonl'),
        purpose: 'fine-tune'
    })

    // @ts-ignore
    const fineTune = await openai.fineTuning.jobs.create({
        training_file: file.id,
        model: "gpt-4.1-mini-2025-04-14"
    });

    console.log(fineTune);
})

export default userRouter;