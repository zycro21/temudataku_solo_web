import express from "express";
import {
  getJobs,
} from "../controllers/websitescraping.controller.js";
import { validate } from "../middlewares/validate.js";
import {
  getJobsSchema,
} from "../validations/websitescraping.validation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Website Scraping
 *   description: API untuk Website Scraping Practice
 */

router.get(
  "/jobs",
  validate(getJobsSchema),
  getJobs
);

export default router;
