import { Router } from "express";
import { getAllPricings } from "../controllers/pricing.controller";

const pricingRouter = Router();

pricingRouter.get('/pricings', getAllPricings);

export default pricingRouter;