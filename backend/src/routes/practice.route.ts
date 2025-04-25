import { Router } from "express";
import * as PracticeController from "../controllers/practice.controller";
import { createPracticeSchema } from "../validations/practice.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

export default router;

router.post(
  "/admin/practices",
  authenticate,
  authorizeRoles("admin"),
  validate(createPracticeSchema),
  PracticeController.createPractice
);
