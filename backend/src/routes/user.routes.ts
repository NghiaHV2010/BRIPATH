import { Router } from "express";
import { authenticationMiddleware, twoFactorMiddleware } from "../middlewares/auth.middleware";
import { applyEvent, applyJob, createMessage, createReport, feedbackCompany, feedbackJob, followCompany, getAllUserAppliedJobs, getAllUserFollowedCompanies, getAllUserReports, getAllUserSavedJobs, getLastestUserChat, getUserActivityHistory, getUserNotification, getUserProfile, saveJob, unfollowCompany, unsaveJob, updateUserNotification, updateUserProfile } from "../controllers/user.controller";

const userRouter = Router();
userRouter.use(authenticationMiddleware);

userRouter.get('/save-job/:jobId', saveJob);
userRouter.get('/save-jobs', getAllUserSavedJobs);
userRouter.delete('/save-job/:jobId', unsaveJob);

userRouter.get('/follow-company/:companyId', followCompany);
userRouter.get('/followed-companies', getAllUserFollowedCompanies);
userRouter.delete('/follow-company/:companyId', unfollowCompany);

userRouter.post('/feedback/company/:companyId', twoFactorMiddleware, feedbackCompany);

userRouter.post('/apply-job/:jobId', applyJob);
userRouter.get('/apply-jobs', getAllUserAppliedJobs);

userRouter.post('/apply-event/:eventId', applyEvent);

userRouter.get('/agent-chat', getLastestUserChat);
userRouter.post('/agent-chat', createMessage);

userRouter.post('/feedback/job/:jobId', feedbackJob);

userRouter.get('/user/profile', getUserProfile);
userRouter.put('/user/profile', updateUserProfile);

userRouter.get('/user/notification', getUserNotification);
userRouter.put('/user/notification', updateUserNotification);

userRouter.get('/user/history', getUserActivityHistory);

userRouter.post('/report', createReport);
userRouter.get('/reports', getAllUserReports);

export default userRouter;