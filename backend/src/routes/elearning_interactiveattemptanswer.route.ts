import express from "express";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRole.js";
import {
  startAndSubmitInteractiveAttemptSchema,
  getInteractiveAttemptsSchema,
  getInteractiveAttemptDetailSchema,
  getLatestInteractiveAttemptSchema,
  saveInteractiveAnswersSchema,
  submitAttemptSchema,
  getInteractiveAttemptAnswersSchema,
  canAttemptInteractiveSchema,
  exportInteractiveAttemptQuerySchema,
} from "../validations/elearning_interactiveattemptanswer.validation.js";
import { ELearningInteractiveAttemptController } from "../controllers/elearning_interactiveattemptanswer.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: E-Learning Mentee Attempt and Answer for Interactive
 *     description: Manajemen hasil percobaan dan jawaban mentee untuk interaktif
 */

/**
 * @swagger
 * /api/elearningInteractivesAttempt/elearningInteractives/{interactiveId}/attempts/start:
 *   post:
 *     summary: Submit Interactive Attempt (Auto Retry Supported)
 *     description: >
 *       Endpoint untuk mentee mengerjakan interactive dan langsung submit.
 *       Endpoint ini juga digunakan untuk retry jika attempt sebelumnya belum passed.
 *
 *       Aturan:
 *       - Subscription harus aktif
 *       - Jika attempt terakhir sudah passed → retry DITOLAK
 *       - Setiap request SELALU membuat attempt & answer BARU
 *       - Attempt lama dibiarkan sebagai history
 *
 *       Format answers tergantung interactive type:
 *       - MULTIPLE_CHOICE: ["optionId"]
 *       - MATCHING: { "leftId": "rightId" }
 *       - TRUE_FALSE: true / false
 *       - FILL_BLANK: "jawaban"
 *
 *     tags: [E-Learning Interactive Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interactiveId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answers]
 *             properties:
 *               answers:
 *                 oneOf:
 *                   - type: array
 *                   - type: object
 *                   - type: string
 *                   - type: boolean
 *     responses:
 *       201:
 *         description: Attempt berhasil disubmit
 *       403:
 *         description: Subscription tidak aktif
 *       404:
 *         description: Interactive tidak ditemukan
 *       409:
 *         description: Interactive sudah lulus
 */
router.post(
  "/elearningInteractives/:interactiveId/attempts/start",
  authenticate,
  authorizeRoles("mentee"),
  validate(startAndSubmitInteractiveAttemptSchema),
  ELearningInteractiveAttemptController.startAndSubmit
);

/**
 * @swagger
 * /api/elearningInteractivesAttempt/elearningInteractives/{interactiveId}/attempts:
 *   get:
 *     summary: Get Interactive Attempt History
 *     description: >
 *       Mengambil riwayat attempt user pada interactive tertentu.
 *
 *       Akses:
 *       - Admin: semua attempt
 *       - Mentor: hanya course miliknya
 *       - Mentee: hanya attempt milik sendiri + subscription aktif
 *
 *     tags: [E-Learning Interactive Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interactiveId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [startedAt, submittedAt, attemptNumber]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: isPassed
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List attempt berhasil diambil
 *       403:
 *         description: Forbidden / subscription tidak aktif
 *       404:
 *         description: Interactive tidak ditemukan
 */
router.get(
  "/elearningInteractives/:interactiveId/attempts",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getInteractiveAttemptsSchema),
  ELearningInteractiveAttemptController.getAttempts
);

/**
 * @swagger
 * /api/elearningInteractivesAttempt/elearningInteractives/attempts/{attemptId}:
 *   get:
 *     summary: Get Interactive Attempt Detail
 *     description: >
 *       Mengambil detail attempt interactive tertentu.
 *
 *       Akses:
 *       - Admin: semua attempt
 *       - Mentor: hanya attempt dari course miliknya
 *       - Mentee: hanya attempt miliknya sendiri + subscription aktif
 *
 *     tags: [E-Learning Interactive Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail attempt berhasil diambil
 *       403:
 *         description: Forbidden / subscription tidak aktif
 *       404:
 *         description: Attempt tidak ditemukan
 */
router.get(
  "/elearningInteractives/attempts/:attemptId",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getInteractiveAttemptDetailSchema),
  ELearningInteractiveAttemptController.getAttemptDetail
);

/**
 * @swagger
 * /api/elearningInteractivesAttempt/elearningInteractives/{interactiveId}/attempts/latest:
 *   get:
 *     summary: Get Latest Interactive Attempt
 *     description: >
 *       Mengambil attempt TERAKHIR dari user untuk interactive tertentu.
 *
 *       Akses:
 *       - Admin: semua attempt
 *       - Mentor: hanya course miliknya
 *       - Mentee: subscription aktif & hanya attempt miliknya
 *
 *     tags: [E-Learning Interactive Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interactiveId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Latest attempt berhasil diambil
 *       403:
 *         description: Forbidden / subscription tidak aktif
 *       404:
 *         description: Interactive atau attempt tidak ditemukan
 */
router.get(
  "/elearningInteractives/:interactiveId/attempts/latest",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getLatestInteractiveAttemptSchema),
  ELearningInteractiveAttemptController.getLatestAttempt
);

/**
 * @swagger
 * /api/elearningInteractivesAttempt/elearning/attempts/{attemptId}/answers:
 *   patch:
 *     summary: Save / Update Interactive Answers (Mentee)
 *     description: >
 *       Endpoint untuk menyimpan atau memperbarui jawaban interactive
 *       pada attempt yang SUDAH ADA (autosave / step-by-step).
 *
 *       Aturan:
 *       - Hanya mentee
 *       - Subscription harus aktif
 *       - Attempt belum disubmit
 *       - Tidak menambah attemptNumber
 *
 *       Format answers tergantung interactive type:
 *       - MULTIPLE_CHOICE: ["optionId1"]
 *       - MATCHING: { "leftId": "rightId" }
 *       - TRUE_FALSE: true / false
 *       - FILL_BLANK: "jawaban"
 *
 *     tags: [E-Learning Interactive Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answers]
 *             properties:
 *               answers:
 *                 oneOf:
 *                   - type: array
 *                   - type: object
 *                   - type: string
 *                   - type: boolean
 *     responses:
 *       200:
 *         description: Jawaban berhasil disimpan
 *       403:
 *         description: Subscription tidak aktif / bukan pemilik attempt
 *       404:
 *         description: Attempt atau interactive tidak ditemukan
 *       409:
 *         description: Attempt sudah disubmit
 */
router.patch(
  "/elearning/attempts/:attemptId/answers",
  authenticate,
  authorizeRoles("mentee"),
  validate(saveInteractiveAnswersSchema),
  ELearningInteractiveAttemptController.saveAnswers
);

/**
 * @swagger
 * /api/elearningInteractivesAttempt/elearning/attempts/{attemptId}/submit:
 *   post:
 *     summary: Submit Interactive Attempt (Mentee)
 *     description: >
 *       Endpoint untuk mentee MENYERAHKAN jawaban dari attempt yang sudah dibuat.
 *
 *       Alur:
 *       - Validasi attempt
 *       - Ownership check
 *       - Validasi subscription aktif
 *       - Cegah submit ulang
 *       - Auto-correct berdasarkan tipe interactive
 *       - Simpan jawaban & score
 *       - Update attempt (submittedAt, totalScore, isPassed)
 *
 *       Format answers:
 *       - MULTIPLE_CHOICE: ["optionId"]
 *       - MATCHING: { "leftId": "rightId" }
 *
 *     tags: [E-Learning Interactive Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [answers]
 *             properties:
 *               answers:
 *                 oneOf:
 *                   - type: array
 *                   - type: object
 *     responses:
 *       200:
 *         description: Attempt berhasil disubmit
 *       403:
 *         description: Subscription tidak aktif / bukan owner
 *       404:
 *         description: Attempt tidak ditemukan
 *       409:
 *         description: Attempt sudah disubmit
 */
router.post(
  "/elearning/attempts/:attemptId/submit",
  authenticate,
  authorizeRoles("mentee"),
  validate(submitAttemptSchema),
  ELearningInteractiveAttemptController.submitAttempt
);

/**
 * @swagger
 * /api/elearningInteractivesAttempt/elearning/attempts/{attemptId}/answers:
 *   get:
 *     summary: Get Interactive Attempt Answers (History)
 *     description: >
 *       Mengambil history jawaban dari sebuah interactive attempt.
 *
 *       Akses:
 *       - Admin: semua attempt
 *       - Mentor: hanya course miliknya
 *       - Mentee: hanya attempt milik sendiri + subscription aktif
 *
 *     tags: [E-Learning Interactive Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: History jawaban berhasil diambil
 *       403:
 *         description: Tidak memiliki akses
 *       404:
 *         description: Attempt tidak ditemukan
 */
router.get(
  "/elearning/attempts/:attemptId/answers",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(getInteractiveAttemptAnswersSchema),
  ELearningInteractiveAttemptController.getAttemptAnswers
);

/**
 * @swagger
 * /api/elearningInteractivesAttempt/elearningInteractives/{interactiveId}/can-attempt:
 *   get:
 *     summary: Check Can Attempt Interactive
 *     description: >
 *       Mengecek apakah user boleh mencoba interactive tertentu.
 *
 *       Akses:
 *       - Admin: selalu boleh
 *       - Mentor: hanya mentor pemilik course
 *       - Mentee: hanya jika subscription aktif & interactive belum passed
 *
 *     tags: [E-Learning Interactive Attempts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: interactiveId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status boleh / tidak boleh attempt
 *       403:
 *         description: Tidak memiliki akses
 *       404:
 *         description: Interactive tidak ditemukan
 */
router.get(
  "/elearningInteractives/:interactiveId/can-attempt",
  authenticate,
  authorizeRoles("admin", "mentor", "mentee"),
  validate(canAttemptInteractiveSchema),
  ELearningInteractiveAttemptController.canAttempt
);

/**
 * @swagger
 * /api/elearningInteractivesAttempt/elearninginteractives/exportv/attempt:
 *   get:
 *     summary: Export Interactive Attempt History (Admin)
 *     description: >
 *       Endpoint untuk mengekspor riwayat pengerjaan interactive oleh mentee
 *       ke dalam format CSV atau Excel. Hanya dapat diakses oleh admin.
 *     tags:
 *       - E-Learning Interactive Attempts
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: false
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *         description: Format file ekspor (csv atau excel)
 *     responses:
 *       200:
 *         description: File export interactive attempts
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Format file tidak valid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (bukan admin)
 *       500:
 *         description: Internal server error
 */
router.get(
  "/elearninginteractives/exportv/attempt",
  authenticate,
  authorizeRoles("admin"),
  validate(exportInteractiveAttemptQuerySchema),
  ELearningInteractiveAttemptController.exportAttempts
);

export default router;
