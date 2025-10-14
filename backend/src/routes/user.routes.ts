import { Router } from "express";
import { authenticationMiddleware } from "../middlewares/auth.middleware";
import { applyEvent, applyJob, createMessage, feedbackCompany, feedbackJob, followCompany, getAllUserFollowedCompanies, getAllUserSavedJobs, getLastestUserChat, getUserActivityHistory, getUserNotification, getUserProfile, saveJob, unfollowCompany, unsaveJob, updateUserNotification, updateUserProfile } from "../controllers/user.controller";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "../config/env.config";
import fs from "fs";

const userRouter = Router();
userRouter.use(authenticationMiddleware);

userRouter.get('/save-job/:jobId', saveJob);
userRouter.get('/save-jobs', getAllUserSavedJobs);
userRouter.delete('/save-job/:jobId', unsaveJob);

userRouter.get('/follow-company/:companyId', followCompany);
userRouter.get('/followed-companies', getAllUserFollowedCompanies);
userRouter.delete('/follow-company/:companyId', unfollowCompany);

userRouter.post('/feedback/company/:companyId', feedbackCompany);
userRouter.post('/apply-job/:jobId', applyJob);
userRouter.post('/apply-event/:eventId', applyEvent);

userRouter.get('/agent-chat', getLastestUserChat);
userRouter.post('/agent-chat', createMessage);

userRouter.post('/feedback/job/:jobId', feedbackJob);

userRouter.get('/user/profile', getUserProfile);
userRouter.put('/user/profile', updateUserProfile);

userRouter.get('/user/notification', getUserNotification);
userRouter.put('/user/notification', updateUserNotification);

userRouter.get('/user/history', getUserActivityHistory);

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