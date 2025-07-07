import express from "express";
import * as genericNameController from "../../controllers/generic-name.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import { checkPermission } from "../../middlewares/role.middleware";
import { PERMISSIONS } from "../../constants/permissions.constants";
import { GenericNameSchema } from "../../schemas/generic-name.schema";
import validate from "../../middlewares/validate.middleware";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  checkPermission(PERMISSIONS.GENERICNAME_MANAGEMENT),
  validate(GenericNameSchema),
  genericNameController.createGenericName
);

router.get(
  "/",
  checkPermission(PERMISSIONS.GENERICNAME_MANAGEMENT),
  genericNameController.getAllGenericNames
);

router.get(
  "/:id",
  checkPermission(PERMISSIONS.GENERICNAME_MANAGEMENT),
  genericNameController.getGenericById
);

router.delete(
  "/:id",
  checkPermission(PERMISSIONS.GENERICNAME_MANAGEMENT),
  genericNameController.deleteGenericById
);

router.put(
  "/:id",
  checkPermission(PERMISSIONS.GENERICNAME_MANAGEMENT),
  validate(GenericNameSchema), 
  genericNameController.updateGenericById
);

export default router;
