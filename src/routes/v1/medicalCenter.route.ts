import express from "express";
import medicalCenterController from "../../controllers/medicalCenter.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import { checkPermission } from "../../middlewares/role.middleware";
import validate from "../../middlewares/validate.middleware";
import { MedicalCenterSchema, UpdateMedicalCenterSchema } from "../../schemas/medicalCenter.schema";
import { PERMISSIONS } from "../../constants/permissions.constants";

const router = express.Router();


router.use(authMiddleware);


router.use(checkPermission(PERMISSIONS.CENTER_READ));


router.post(
  "/",
  checkPermission(PERMISSIONS.CENTER_CREATE),
  validate(MedicalCenterSchema),
  medicalCenterController.createMedicalCenter
);

router.get("/", medicalCenterController.getAllMedicalCenters);


router.put(
  "/:centerId",
  checkPermission(PERMISSIONS.CENTER_UPDATE),
  validate(UpdateMedicalCenterSchema),
  medicalCenterController.updateMedicalCenter
);


router.delete(
  "/:centerId",
  checkPermission(PERMISSIONS.CENTER_DELETE),
  medicalCenterController.deleteMedicalCenter
);

export default router;
