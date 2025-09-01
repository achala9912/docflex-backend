import express from "express";
import * as patientController from "../../controllers/patient.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import { checkPermission } from "../../middlewares/role.middleware";
import { PERMISSIONS } from "../../constants/permissions.constants";
import {
  PatientSchema,
  UpdatePatientSchema,
} from "../../schemas/patient.schema";
import validate from "../../middlewares/validate.middleware";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  checkPermission(PERMISSIONS.PATIENT_MANAGEMENT),
  validate(PatientSchema),
  patientController.createPatient
);

router.put(
  "/:patientId",
  checkPermission(PERMISSIONS.PATIENT_MANAGEMENT),
  validate(UpdatePatientSchema),
  patientController.updatePatient
);

router.delete(
  "/:patientId",
  checkPermission(PERMISSIONS.PATIENT_MANAGEMENT),
  patientController.deletePatient
);

router.get(
  "/",
  checkPermission(PERMISSIONS.PATIENT_MANAGEMENT),
  patientController.getAllPatients
);

router.get(
  "/suggestions",
  patientController.getPatientSuggestions
);

router.get(
  "/:patientId",
  checkPermission(PERMISSIONS.PATIENT_MANAGEMENT),
  patientController.getPatient
);
export default router;
