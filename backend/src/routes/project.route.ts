import { Router } from "express";
import * as ProjectController from "../controllers/project.controller";
import {
  createProjectSchema,
  updateProjectSchema,
  deleteProjectSchema,
  getAllProjectsSchema,
  getProjectDetailSchema,
  getMentorProjectListSchema,
  getMentorProjectDetailSchema,
  getMenteeProjectListSchema,
  getMenteeProjectDetailSchema,
  exportProjectSchema,
  submitProjectSchema,
  reviewSubmissionSchema,
  getAdminSubmissionListSchema,
  getAdminSubmissionDetailSchema,
  exportSubmissionSchema,
  getMentorProjectSubmissionListSchema,
  getMentorSubmissionDetailSchema,
  getMenteeSubmissionsSchema,
  getMenteeSubmissionDetailSchema,
} from "../validations/project.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";
import { handleSubmissionUpload } from "../middlewares/uploadImage";

const router = Router();

router.post(
  "/admin/projects",
  authenticate,
  authorizeRoles("admin", "mentor"), // hanya admin dan mentor
  validate(createProjectSchema),
  ProjectController.createProjectHandler
);

router.put(
  "/admin/projects/:id",
  authenticate,
  authorizeRoles("admin", "mentor"),
  validate(updateProjectSchema),
  ProjectController.updateProjectHandler
);

router.delete(
  "/admin/projects/:id",
  authenticate,
  authorizeRoles("admin"), // hanya admin yang bisa
  validate(deleteProjectSchema),
  ProjectController.deleteProjectHandler
);

router.get(
  "/admin/projects",
  authenticate,
  authorizeRoles("admin"), // hanya admin
  validate(getAllProjectsSchema),
  ProjectController.getAllProjectsHandler
);

router.get(
  "/admin/projects/:id",
  authenticate,
  authorizeRoles("admin"), // hanya admin
  validate(getProjectDetailSchema),
  ProjectController.getProjectDetailHandler
);

router.get(
  "/mentor/projects",
  authenticate,
  authorizeRoles("mentor"),
  validate(getMentorProjectListSchema),
  ProjectController.getMentorProjectService
);

router.get(
  "/mentor/projects/:id",
  authenticate,
  authorizeRoles("mentor"),
  validate(getMentorProjectDetailSchema),
  ProjectController.getMentorProjectDetail
);

router.get(
  "/mentees/projects",
  authenticate,
  authorizeRoles("mentee"),
  validate(getMenteeProjectListSchema),
  ProjectController.getMenteeProjects
);

router.get(
  "/mentees/projects/:id",
  authenticate,
  authorizeRoles("mentee"),
  validate(getMenteeProjectDetailSchema),
  ProjectController.getMenteeProjectDetail
);

router.get(
  "/adminProjectsExport",
  authenticate,
  authorizeRoles("admin"),
  validate(exportProjectSchema),
  ProjectController.exportProjects
);

router.post(
  "/menteeSubmitProjects/:id/submissions",
  authenticate,
  authorizeRoles("mentee"),
  handleSubmissionUpload("submissionFile", true), // field name dari form-data
  validate(submitProjectSchema),
  ProjectController.submitProject
);

router.patch(
  "/mentors/submissions/:id",
  authenticate,
  authorizeRoles("mentor", "admin"),
  validate(reviewSubmissionSchema),
  ProjectController.reviewSubmission
);

router.get(
  "/admin/submissions",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminSubmissionListSchema),
  ProjectController.getAdminSubmissions
);

router.get(
  "/admin/submissions/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(getAdminSubmissionDetailSchema),
  ProjectController.getAdminSubmissionDetail
);

router.get(
  "/adminSubmissionsExport",
  authenticate,
  authorizeRoles("admin"),
  validate(exportSubmissionSchema),
  ProjectController.exportAdminSubmissions
);

router.get(
  "/mentorsProjects/:id/submissions",
  authenticate,
  authorizeRoles("mentor"),
  validate(getMentorProjectSubmissionListSchema),
  ProjectController.getMentorProjectSubmissions
);

router.get(
  "/mentorsSubmissions/:id",
  authenticate,
  authorizeRoles("mentor"),
  validate(getMentorSubmissionDetailSchema),
  ProjectController.getMentorSubmissionDetail
);

router.get(
  "/menteesSubmissions",
  authenticate,
  authorizeRoles("mentee"),
  validate(getMenteeSubmissionsSchema),
  ProjectController.getMenteeSubmissions
);

router.get(
  "/menteesSubmissions/:id",
  authenticate,
  authorizeRoles("mentee"),
  validate(getMenteeSubmissionDetailSchema),
  ProjectController.getMenteeSubmissionDetail
);

export default router;
