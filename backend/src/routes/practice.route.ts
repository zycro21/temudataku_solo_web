import { Router } from "express";
import * as PracticeController from "../controllers/practice.controller";
import {
  createPracticeSchema,
  updatePracticeSchema,
  getAdminPracticeListSchema,
  getAdminPracticeDetailSchema,
  getMentorPracticesQuerySchema,
  getMentorPracticeDetailParamsSchema,
  getPublicPracticesQuerySchema,
  getPracticePreviewSchema,
  createPracticeMaterialValidator,
  updatePracticeMaterialValidator,
  deletePracticeMaterialValidator,
  uploadPracticeFileValidator,
  updatePracticeFileValidator,
  deletePracticeFileValidator,
  getPracticeFilesByMaterialValidator,
  getPracticeMaterialsValidator,
  getPracticeMaterialDetailValidator,
  createPracticePurchaseSchema,
  cancelPracticePurchaseSchema,
  getPracticePurchasesSchema,
  getPracticePurchaseDetailSchema,
  getAdminPracticePurchasesSchema,
  getAdminPracticePurchaseDetailSchema,
  updatePracticePurchaseStatusSchema,
  exportPracticePurchaseSchema,
  createOrUpdatePracticeProgressSchema,
  updatePracticeProgressSchema,
  getAllPracticeProgressSchema,
  getPracticeProgressByIdSchema,
  deletePracticeProgressSchema,
  createPracticeReviewSchema,
  updatePracticeReviewSchema,
  getUserPracticeReviewsSchema,
  getPracticeReviewsSchema,
  updateAdminPracticeReviewSchema,
  deleteAdminPracticeReviewSchema,
  getAllAdminPracticeReviewsSchema,
  getAdminPracticeReviewByIdSchema,
  exportAdminPracticeReviewsSchema,
} from "../validations/practice.validation";
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

router.post(
  "/createPractices",
  authenticate,
  authorizeRoles("admin"),
  handleThumbnailUpload("thumbnailImage", true), // Memungkinkan upload multiple gambar
  validate(createPracticeSchema),
  PracticeController.createPractice
);

router.patch(
  "/admin/practices/:id",
  authenticate,
  authorizeRoles("admin"),
  preloadPracticeTitle,
  handleThumbnailUpload("thumbnailImage", true), // Bisa upload multiple thumbnail
  validate(updatePracticeSchema),
  PracticeController.updatePractice
);

router.get(
  "/admin/practices",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminPracticeListSchema),
  PracticeController.getAdminPracticeList
);

router.get(
  "/admin/practices/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminPracticeDetailSchema),
  PracticeController.getAdminPracticeDetail
);

router.delete(
  "/admin/practices/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminPracticeDetailSchema), // You can reuse validation schema for checking practice existence
  PracticeController.deleteAdminPractice
);

router.get(
  "/mentor/practices",
  authenticate,
  authorizeRoles("mentor"),
  validate(getMentorPracticesQuerySchema),
  PracticeController.getMentorPractices
);

router.get(
  "/mentor/practices/:id",
  authenticate,
  authorizeRoles("mentor"),
  validate(getMentorPracticeDetailParamsSchema),
  PracticeController.getPracticeDetail
);

router.get(
  "/practices",
  validate(getPublicPracticesQuerySchema),
  PracticeController.getPublicPractices
);

router.get(
  "/practices/:id",
  validate(getPracticePreviewSchema),
  PracticeController.getPracticePreview
);

router.post(
  "/admin/materialPractices/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(createPracticeMaterialValidator),
  PracticeController.createPracticeMaterialController
);

router.patch(
  "/admin/materialPractices/:id/:materialId",
  authenticate,
  authorizeRoles("admin"),
  validate(updatePracticeMaterialValidator),
  PracticeController.updatePracticeMaterialController
);

router.delete(
  "/admin/materialPractices/:id/:materialId",
  authenticate,
  authorizeRoles("admin"),
  validate(deletePracticeMaterialValidator),
  PracticeController.deletePracticeMaterialController
);

router.get(
  "/materialPractices/:id",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getPracticeMaterialsValidator),
  PracticeController.getPracticeMaterialsController
);

router.get(
  "/materialDetailPractices/:id/:materialId",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getPracticeMaterialDetailValidator),
  PracticeController.getPracticeMaterialDetailController
);

router.post(
  "/admin/practiceFiles/upload",
  authenticate,
  authorizeRoles("admin"),
  handlePracticeFileUpload("file"), // Field name 'file'
  validate(uploadPracticeFileValidator),
  PracticeController.uploadPracticeFileController
);

router.patch(
  "/admin/practiceFiles/:fileId",
  authenticate,
  authorizeRoles("admin"),
  validate(updatePracticeFileValidator),
  PracticeController.updatePracticeFileController
);

router.delete(
  "/admin/practiceFiles/:fileId",
  authenticate,
  authorizeRoles("admin"),
  validate(deletePracticeFileValidator),
  PracticeController.deletePracticeFileController
);

router.get(
  "/practiceFiles/:materialId",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(getPracticeFilesByMaterialValidator),
  PracticeController.getPracticeFilesByMaterialController
);

// Practice Purchases
router.post(
  "/mentees/practice-purchases",
  authenticate,
  validate(createPracticePurchaseSchema),
  PracticeController.createPracticePurchaseController
);

router.patch(
  "/mentees/practice-purchases-cancel/:id",
  authenticate,
  validate(cancelPracticePurchaseSchema),
  PracticeController.cancelPracticePurchaseController
);

router.get(
  "/mentees/practice-purchases",
  authenticate,
  validate(getPracticePurchasesSchema),
  PracticeController.getPracticePurchasesController
);

router.get(
  "/mentees/practice-purchases/:id",
  authenticate,
  validate(getPracticePurchaseDetailSchema),
  PracticeController.getPracticePurchaseDetailController
);

router.get(
  "/admin/practice-purchases",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminPracticePurchasesSchema),
  PracticeController.getAllPracticePurchasesController
);

router.get(
  "/admin/practice-purchases/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminPracticePurchaseDetailSchema),
  PracticeController.getAdminPracticePurchaseDetailController
);

router.patch(
  "/admin/practice-purchases-status/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(updatePracticePurchaseStatusSchema),
  PracticeController.updatePracticePurchaseStatusController
);

router.get(
  "/admin/practice-purchases-export",
  authenticate,
  authorizeRoles("admin"),
  validate(exportPracticePurchaseSchema),
  PracticeController.exportPracticePurchasesController
);

// Practice Progress
router.post(
  "/practice/progress",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(createOrUpdatePracticeProgressSchema),
  PracticeController.createOrUpdatePracticeProgressController
);

router.patch(
  "/practice/progress/:id",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(updatePracticeProgressSchema),
  PracticeController.updatePracticeProgressController
);

router.get(
  "/practice/progress",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getAllPracticeProgressSchema),
  PracticeController.getAllPracticeProgressController
);

router.get(
  "/practice/progress/:id",
  authenticate,
  authorizeRoles("admin", "mentee", "mentor"),
  validate(getPracticeProgressByIdSchema),
  PracticeController.getPracticeProgressByIdController
);

router.delete(
  "/practice/progress/:id",
  authenticate,
  authorizeRoles("admin"), // Hanya admin yang diizinkan
  validate(deletePracticeProgressSchema),
  PracticeController.deletePracticeProgressController
);

// Practice Review
router.post(
  "/practice/reviews",
  authenticate,
  authorizeRoles("mentee"), // Hanya mentee yang diizinkan
  validate(createPracticeReviewSchema),
  PracticeController.createPracticeReviewController
);

router.patch(
  "/practice/reviews/:id",
  authenticate,
  authorizeRoles("mentee"),
  validate(updatePracticeReviewSchema),
  PracticeController.updatePracticeReviewController
);

router.get(
  "/users/practice-reviews/:id",
  authenticate,
  authorizeRoles("mentee"),
  validate(getUserPracticeReviewsSchema),
  PracticeController.getUserPracticeReviewsController
);

router.get(
  "/practices-reviews/:id",
  authenticate,
  authorizeRoles("mentee"),
  validate(getPracticeReviewsSchema),
  PracticeController.getPracticeReviewsController
);

router.patch(
  "/admin/practice-reviews/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(updateAdminPracticeReviewSchema),
  PracticeController.updateAdminPracticeReviewController
);

router.delete(
  "/admin/practice-reviews/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(deleteAdminPracticeReviewSchema),
  PracticeController.deleteAdminPracticeReviewController
);

router.get(
  "/admin/practice-reviews",
  authenticate,
  authorizeRoles("admin"),
  validate(getAllAdminPracticeReviewsSchema),
  PracticeController.getAllAdminPracticeReviewsController
);

router.get(
  "/admin/practice-reviews/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminPracticeReviewByIdSchema),
  PracticeController.getAdminPracticeReviewByIdController
);

router.get(
  "/admin/practice-reviews-export",
  authenticate,
  authorizeRoles("admin"),
  validate(exportAdminPracticeReviewsSchema),
  PracticeController.exportAdminPracticeReviewsController
);