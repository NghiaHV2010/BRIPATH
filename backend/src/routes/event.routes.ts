import { Router } from "express";
import { createEvent, getAllEvents } from "../controllers/event.controller";
import { authenticationMiddleware, eventAuthMiddleware } from "../middlewares/auth.middleware";

const eventRouter = Router();

eventRouter.get('/events', getAllEvents);
eventRouter.post('/upload/event', authenticationMiddleware, eventAuthMiddleware, createEvent);

export default eventRouter;