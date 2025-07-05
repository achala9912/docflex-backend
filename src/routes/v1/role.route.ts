import express from "express";
import roleController from "../../controllers/role.controller";
import { checkPermission } from "../../middlewares/role.middleware";
import { PERMISSIONS } from "../../constants/permissions.constants";
import { RoleSchema, UpdateRoleSchema } from "../../schemas/role.schema";
import validate from "../../middlewares/validate.middleware";
import authMiddleware from "../../middlewares/auth.middleware";

const router = express.Router();

router.use(authMiddleware);
router.use(checkPermission(PERMISSIONS.ROLE_READ));

// Create Role
router.post(
  "/",
  checkPermission(PERMISSIONS.ROLE_CREATE),
  validate(RoleSchema),
  roleController.createRole
);

// Get All Roles
router.get("/", roleController.getAllRoles);

// Get Single Role
router.get("/:roleId", roleController.getRoleById);

// Update Role
router.put(
  "/:roleId",
  checkPermission(PERMISSIONS.ROLE_UPDATE),
  validate(UpdateRoleSchema),
  roleController.updateRole
);

// Delete Role
router.delete(
  "/:roleId",
  checkPermission(PERMISSIONS.ROLE_DELETE),
  roleController.deleteRole
);

export default router;
