import express from "express";
import { getUserSettings, updateUserSetting } from "../controllers/setting.controller";
import { authenticationMiddleware } from "../middlewares/auth.middleware";

const settingRouter = express.Router();
settingRouter.use(authenticationMiddleware);

settingRouter.get("/settings", getUserSettings);
settingRouter.put("/setting", updateUserSetting);

export default settingRouter;
