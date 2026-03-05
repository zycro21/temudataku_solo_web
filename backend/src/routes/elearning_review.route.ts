import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import {
  createReviewController,
  getMyReviewsController,
  getCourseReviewsController,
  deleteReviewController,
  updateReviewController,
  getReviewSummaryController,
  getAllReviewStatsController
} from "../controllers/elearning_review.controller.js";
import {
  createReviewSchema,
  getCourseReviewsSchema,
  getMyReviewsSchema,
  deleteReviewSchema,
  updateReviewSchema,
  getReviewSummarySchema,
} from "../validations/elearning_review.validation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: E-Learning Reviews
 *   description: API untuk mengelola Review E-Learning Mentee
 */

/**
 * @swagger
 * /api/elearningReview/courses/{id}/review:
 *   post:
 *     summary: Berikan review pada course
 *     description: >
 *       Endpoint untuk mentee memberikan review terhadap course yang sudah dibeli.
 *       Setiap mentee hanya dapat memberikan **1 review per course**.
 *     tags:
 *       - E-Learning Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID course
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Course ini sangat membantu dan materinya jelas
 *     responses:
 *       200:
 *         description: Review berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     rating:
 *                       type: integer
 *                     comment:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Review sudah pernah diberikan
 *       403:
 *         description: Course belum dibeli
 *       404:
 *         description: Course tidak ditemukan
 */
router.post(
  "/courses/:id/review",
  authenticate,
  authorizeRoles("mentee"),
  validate(createReviewSchema),
  createReviewController
);

/**
 * @swagger
 * /api/elearningReview/courses/{id}/reviews:
 *   get:
 *     summary: Get public reviews for a course
 *     description: |
 *       Retrieve a list of **public reviews** for a specific course.
 *
 *       - Only reviews with `isPublic = true` will be returned
 *       - If a review is marked as `isAnonymous = true`, the reviewer identity will be masked
 *       - This endpoint is **public** and does not require authentication
 *     tags:
 *       - E-Learning Reviews
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Course ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number (default is 1)
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of items per page (default is 10000)
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Successfully retrieved course reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     meta:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 25
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "ckx123abc"
 *                           courseId:
 *                             type: string
 *                             example: "course_001"
 *                           rating:
 *                             type: integer
 *                             example: 5
 *                           comment:
 *                             type: string
 *                             nullable: true
 *                             example: "Materinya sangat jelas dan mudah dipahami"
 *                           isPublic:
 *                             type: boolean
 *                             example: true
 *                           isAnonymous:
 *                             type: boolean
 *                             example: false
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-01-01T10:00:00.000Z"
 *                           user:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 nullable: true
 *                                 example: "user_001"
 *                               fullName:
 *                                 type: string
 *                                 example: "Anonymous"
 *                               profilePicture:
 *                                 type: string
 *                                 nullable: true
 *                                 example: null
 *       400:
 *         description: Invalid request parameters
 *       404:
 *         description: Course not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/courses/:id/reviews",
  validate(getCourseReviewsSchema),
  getCourseReviewsController
);

/**
 * @swagger
 * /api/elearningReview/reviews/me:
 *   get:
 *     summary: Get reviews (my reviews or all reviews)
 *     description: |
 *       Retrieve reviews based on user role:
 *
 *       - **Mentee**: only their own reviews
 *       - **Admin**: all reviews in the system
 *
 *       Supports pagination and sorting.
 *     tags:
 *       - E-Learning Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number (default 1)
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of items per page (default 10)
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: sort
 *         required: false
 *         description: Sort by created date
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: desc
 *     responses:
 *       200:
 *         description: Successfully retrieved reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     meta:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 50
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           rating:
 *                             type: number
 *                             example: 4.5
 *                           comment:
 *                             type: string
 *                             nullable: true
 *                           isPublic:
 *                             type: boolean
 *                           isAnonymous:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               fullName:
 *                                 type: string
 *                           course:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get(
  "/reviews/me",
  authenticate,
  authorizeRoles("mentee", "admin"),
  validate(getMyReviewsSchema),
  getMyReviewsController
);

/**
 * @swagger
 * /api/elearningReview/reviews/{id}:
 *   delete:
 *     summary: Delete or unpublish review
 *     description: |
 *       Delete review based on user role:
 *
 *       - **Mentee**:
 *         - Can only unpublish their own review (`isPublic = false`)
 *         - Cannot permanently delete
 *
 *       - **Admin**:
 *         - Can choose to permanently delete or unpublish review
 *
 *     tags:
 *       - E-Learning Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Review ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: force
 *         required: false
 *         description: |
 *           Admin only.
 *           If true → permanent delete.
 *           If false or omitted → set isPublic to false.
 *         schema:
 *           type: boolean
 *           example: false
 *     responses:
 *       200:
 *         description: Review successfully updated or deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     action:
 *                       type: string
 *                       example: unpublished
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Review not found
 */
router.delete(
  "/reviews/:id",
  authenticate,
  authorizeRoles("mentee", "admin"),
  validate(deleteReviewSchema),
  deleteReviewController
);

/**
 * @swagger
 * /api/elearningReview/reviews/{id}:
 *   patch:
 *     summary: Update review course
 *     description: >
 *       Endpoint untuk mengubah review course.
 *       - **Admin** dapat mengedit review siapa pun kapan pun.
 *       - **Mentee** hanya dapat mengedit review miliknya sendiri
 *         dan maksimal **24 jam sejak review dibuat**.
 *     tags:
 *       - E-Learning Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID review
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4.5
 *               comment:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Materi bagus, penjelasan jelas
 *               isAnonymous:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Review berhasil diperbarui
 *       403:
 *         description: Tidak memiliki izin
 *       404:
 *         description: Review tidak ditemukan
 */
router.patch(
  "/reviews/:id",
  authenticate,
  authorizeRoles("mentee", "admin"),
  validate(updateReviewSchema),
  updateReviewController
);

/**
 * @swagger
 * /api/elearningReview/courses/{id}/reviews/summary:
 *   get:
 *     summary: Summary review course
 *     description: Statistik rating course (admin only)
 *     tags:
 *       - E-Learning Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID course
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Summary review course
 */
router.get(
  "/courses/:id/reviews/summary",
  authenticate,
  authorizeRoles("admin"),
  validate(getReviewSummarySchema),
  getReviewSummaryController
);

/**
 * @swagger
 * /api/elearningReview/reviews/stats:
 *   get:
 *     summary: Statistik semua review
 *     description: Statistik seluruh review di sistem (admin only)
 *     tags:
 *       - E-Learning Reviews
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistik semua review
 */
router.get(
  "/reviews/stats",
  authenticate,
  authorizeRoles("admin"),
  getAllReviewStatsController
);

export default router;
