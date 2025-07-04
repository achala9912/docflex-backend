// 

import express from 'express';
import roleController from '../../controllers/role.controller';
import { checkPermission } from '../../middlewares/role.middleware';
import { PERMISSIONS } from '../../constants/permissions.constants';

const router = express.Router();

// All role routes require ROLE_READ permission
router.use(checkPermission(PERMISSIONS.ROLE_READ));

router.post('/', 
  checkPermission(PERMISSIONS.ROLE_CREATE),
  roleController.createRole
);

router.get('/', roleController.getAllRoles);
router.get('/:roleId', roleController.getRoleById);

router.put('/:roleId',
  checkPermission(PERMISSIONS.ROLE_UPDATE),
  roleController.updateRole
);

router.delete('/:roleId',
  checkPermission(PERMISSIONS.ROLE_DELETE),
  roleController.deleteRole
);

export default router;