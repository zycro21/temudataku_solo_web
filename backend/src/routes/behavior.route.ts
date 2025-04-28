import { Router } from "express";
import * as BehaviorController from "../controllers/behavior.controller";
import {} from "../validations/behavior.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";
import {
  handleThumbnailUpload,
  handlePracticeFileUpload,
} from "../middlewares/uploadImage";
import { preloadPracticeTitle } from "../middlewares/preloadTitlePractice";

const router = Router();



export default router;
