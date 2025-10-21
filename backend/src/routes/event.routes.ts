import { Router } from "express";
import { createEvent, deleteEvent, getAllEvents, getEventsByUserId, getVolunteersByStatus, updateEvent, updateVolunteerStatus } from "../controllers/event.controller";
import { authenticationMiddleware, twoFactorMiddleware } from "../middlewares/auth.middleware";
import { subscriptionMiddleware } from "../middlewares/subscription.middleware";

const eventRouter = Router();

eventRouter.get('/events', getAllEvents);

eventRouter.post('/event', authenticationMiddleware, twoFactorMiddleware, subscriptionMiddleware, createEvent);
eventRouter.put('/event/:eventId', authenticationMiddleware, twoFactorMiddleware, updateEvent);
eventRouter.delete('/event/:eventId', authenticationMiddleware, deleteEvent);

eventRouter.get('/volunteers', authenticationMiddleware, getVolunteersByStatus);
eventRouter.put('/volunteer/:volunteerId', authenticationMiddleware, updateVolunteerStatus);

eventRouter.get('/events/:userId', authenticationMiddleware, getEventsByUserId);

export default eventRouter;