// import express from 'express';
// import roleController from '../../controllers/role.controller';
// import { checkPermission } from '../../middlewares/role.middleware';
// import { PERMISSIONS } from '../../constants/permissions.constants';

// const router = express.Router();

// // All role routes require ROLE_READ permission
// router.use(checkPermission(PERMISSIONS.ROLE_READ));

// router.post('/',
//   checkPermission(PERMISSIONS.ROLE_CREATE),
//   roleController.createRole
// );

// router.get('/', roleController.getAllRoles);
// router.get('/:roleId', roleController.getRoleById);

// router.put('/:roleId',
//   checkPermission(PERMISSIONS.ROLE_UPDATE),
//   roleController.updateRole
// );

// router.delete('/:roleId',
//   checkPermission(PERMISSIONS.ROLE_DELETE),
//   roleController.deleteRole
// );

// export default router;

import express from "express";
import roleController from "../../controllers/role.controller";
import { checkPermission } from "../../middlewares/role.middleware";
import { PERMISSIONS } from "../../constants/permissions.constants";
import { RoleSchema, UpdateRoleSchema } from "../../schemas/role.schema";
import validate from "../../middlewares/validate.middleware";

const router = express.Router();

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
