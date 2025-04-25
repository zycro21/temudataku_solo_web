import { Router } from "express";
import * as CertificateController from "../controllers/certificate.controller";
import {
  generateCertificateSchema,
  getAllCertificatesSchema,
  updateCertificateSchema,
  getMenteeCertificatesSchema,
  getCertificateDetailSchema,
  downloadCertificateSchema,
  exportCertificateSchema,
} from "../validations/certificate.validation";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { authorizeRoles } from "../middlewares/authorizeRole";

const router = Router();

router.post(
  "/admin/certificates/generate",
  authenticate,
  authorizeRoles("admin"),
  validate(generateCertificateSchema),
  CertificateController.generateCertificate
);

router.get(
  "/admin/certificates",
  authenticate,
  authorizeRoles("admin"),
  validate(getAllCertificatesSchema),
  CertificateController.getAllCertificates
);

router.patch(
  "/admin/certificates/:id",
  authenticate,
  authorizeRoles("admin"),
  validate(updateCertificateSchema),
  CertificateController.updateCertificate
);

router.get(
  "/certificates",
  authenticate,
  authorizeRoles("mentee"),
  validate(getMenteeCertificatesSchema),
  CertificateController.getMenteeCertificatesController
);

router.get(
  "/mentees/certificates/:id",
  authenticate,
  authorizeRoles("mentee", "admin"),
  validate(getCertificateDetailSchema),
  CertificateController.getCertificateDetailController
);

router.get(
  "/certificatesDownload/:id",
  authenticate,
  authorizeRoles("mentee", "admin"),
  validate(downloadCertificateSchema),
  CertificateController.downloadCertificateController
);

router.get(
  "/certificatesExport",
  authenticate,
  authorizeRoles("admin"),
  validate(exportCertificateSchema), // schema cek format: csv | excel
  CertificateController.exportCertificatesController
);

export default router;
