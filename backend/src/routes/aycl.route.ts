import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import {
  createAyclSchema,
  getAllAyclSchema,
  deleteAyclSchema,
  updateAyclSchema,
  getAyclDetailSchema,
} from "../validations/aycl.validation.js";
import { AyclController } from "../controllers/aycl.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: AYCL
 *     description: Manajemen AYCL
 */

/**
 * @swagger
 * /api/aycl/aycl:
 *   post:
 *     summary: Create AYCL batch lengkap
 *     tags: [AYCL]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/aycl",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(createAyclSchema),
  AyclController.createAycl
);

/**
 * @swagger
 * /api/aycl/aycl:
 *   get:
 *     summary: Get all AYCL batch
 *     tags: [AYCL]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/aycl",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(getAllAyclSchema),
  AyclController.getAllAycl
);

/**
 * @swagger
 * /api/aycl/aycl/{id}:
 *   delete:
 *     summary: Delete AYCL batch
 *     tags: [AYCL]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  "/aycl/:id",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(deleteAyclSchema),
  AyclController.deleteAycl
);

/**
 * @swagger
 * /api/aycl/aycl/{id}:
 *   put:
 *     summary: Update AYCL batch lengkap
 *     tags: [AYCL]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/aycl/:id",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(updateAyclSchema),
  AyclController.updateAycl
);

/**
 * @swagger
 * /api/aycl/aycl/{id}:
 *   get:
 *     summary: Get detail AYCL (batch + sections + materials + schedules)
 *     tags: [AYCL]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/aycl/:id",
  authenticate,
  authorizeRoles("admin", "cm", "curdev"),
  validate(getAyclDetailSchema),
  AyclController.getAyclDetail
);

/**
 * @swagger
 * /api/aycl/public/aycl:
 *   get:
 *     summary: Get active AYCL for public page
 *     tags: [AYCL Public]
 */
router.get(
  "/public/aycl",
  AyclController.getPublicAycl
);

export default router;