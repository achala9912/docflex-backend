// import express from "express";
// import * as roleController from "../../controllers/role.controller";
// import { checkPermission } from "../../middlewares/role.middleware";
// import { PERMISSIONS } from "../../constants/permissions.constants";
// import { RoleSchema, UpdateRoleSchema } from "../../schemas/role.schema";
// import validate from "../../middlewares/validate.middleware";
// import authMiddleware from "../../middlewares/auth.middleware";

// const router = express.Router();

// router.use(authMiddleware);
// router.use(checkPermission(PERMISSIONS.ROLE_READ));

// // Create Role
// router.post(
//   "/",
//   checkPermission(PERMISSIONS.ROLE_CREATE),
//   validate(RoleSchema),
//   roleController.createRole
// );

// // Get All Roles
// router.get("/", roleController.getAllRoles);

// // Get Single Role
// router.get("/:roleId", roleController.getRoleById);

// // Get Permission constant
// router.get("/permission-constant", roleController.getPermissionsConstant);

// // Update Role
// router.put(
//   "/:roleId",
//   checkPermission(PERMISSIONS.ROLE_UPDATE),
//   validate(UpdateRoleSchema),
//   roleController.updateRole
// );

// // Delete Role
// router.delete(
//   "/:roleId",
//   checkPermission(PERMISSIONS.ROLE_DELETE),
//   roleController.deleteRole
// );

// export default router;

import express from "express";
import * as roleController from "../../controllers/role.controller";
import { checkPermission } from "../../middlewares/role.middleware";
import { PERMISSIONS } from "../../constants/permissions.constants";
import { RoleSchema, UpdateRoleSchema } from "../../schemas/role.schema";
import validate from "../../middlewares/validate.middleware";
import authMiddleware from "../../middlewares/auth.middleware";

const router = express.Router();

router.use(authMiddleware);

router.get("/constant", roleController.getRoleSuggestion);
router.get("/permission-constant", roleController.getPermissionsConstant);

router.post(
  "/",
  checkPermission(PERMISSIONS.ROLE_CREATE),
  validate(RoleSchema),
  roleController.createRole
);

router.get("/", checkPermission(PERMISSIONS.ROLE_READ), roleController.getAllRoles);
router.get("/:roleId", checkPermission(PERMISSIONS.ROLE_READ), roleController.getRoleById);

router.put(
  "/:roleId",
  checkPermission(PERMISSIONS.ROLE_UPDATE),
  validate(UpdateRoleSchema),
  roleController.updateRole
);

router.delete(
  "/:roleId",
  checkPermission(PERMISSIONS.ROLE_DELETE),
  roleController.deleteRole
);


export default router;
