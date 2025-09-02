import express from "express";
import * as prescriptionController from "../../controllers/prescription.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import { checkPermission } from "../../middlewares/role.middleware";
import { PERMISSIONS } from "../../constants/permissions.constants";
import {
  PrescriptionSchema,
  UpdatePrescriptionSchema,
} from "../../schemas/prescription.schema";
import validate from "../../middlewares/validate.middleware";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  checkPermission(PERMISSIONS.PRESCRIPTION_CREATE),
  validate(PrescriptionSchema),
  prescriptionController.createPrescription
);

router.post(
  "/:prescriptionNo/send-email",
  checkPermission(PERMISSIONS.PRESCRIPTION_READ),
  prescriptionController.sendPrescriptionEmailHandler
);

router.get(
  "/",
  checkPermission(PERMISSIONS.PRESCRIPTION_READ),
  prescriptionController.getAllPrescriptions
);

// Change :id to :prescriptionNo
router.get(
  "/:prescriptionNo",
  checkPermission(PERMISSIONS.PRESCRIPTION_READ),
  prescriptionController.getPrescriptionById
);

// Change :id to :prescriptionNo
router.put(
  "/:prescriptionNo",
  checkPermission(PERMISSIONS.PRESCRIPTION_UPDATE),
  validate(UpdatePrescriptionSchema),
  prescriptionController.updatePrescription
);

// Change :id to :prescriptionNo
router.put(
  "/:prescriptionNo/cancel",
  checkPermission(PERMISSIONS.PRESCRIPTION_CANCEL),
  prescriptionController.cancelPrescription
);

export default router;
