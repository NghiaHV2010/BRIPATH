import express from "express";
import { getUserSettings, mockUserSettings, updateUserSetting } from "../controllers/setting.controller";
import { authenticationMiddleware } from "../middlewares/auth.middleware";

const settingRouter = express.Router();
settingRouter.use(authenticationMiddleware);

settingRouter.get("/settings", getUserSettings);
settingRouter.put("/setting", updateUserSetting);
settingRouter.get("/mock-settings", mockUserSettings);

export default settingRouter;
