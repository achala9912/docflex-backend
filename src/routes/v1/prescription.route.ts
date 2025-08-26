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
  checkPermission(PERMISSIONS.PRESCRIPTION_MANAGEMENT),
  validate(PrescriptionSchema),
  prescriptionController.createPrescription
);

router.get(
  "/",
  checkPermission(PERMISSIONS.PRESCRIPTION_MANAGEMENT),
  prescriptionController.getAllPrescriptions
);


router.get(
  "/:id",
  checkPermission(PERMISSIONS.PRESCRIPTION_MANAGEMENT),
  prescriptionController.getPrescriptionById
);


router.put(
  "/:id",
  checkPermission(PERMISSIONS.PRESCRIPTION_MANAGEMENT),
  validate(UpdatePrescriptionSchema),
  prescriptionController.updatePrescription
);


router.delete(
  "/:id/cancel",
  checkPermission(PERMISSIONS.PRESCRIPTION_MANAGEMENT),
  prescriptionController.cancelPrescription
);

export default router;
