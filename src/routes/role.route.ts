import express from 'express';
import roleController from '../controllers/role.controller';
import authMiddleware from '../middlewares/auth.middleware';
import checkRole from '../middlewares/role.middleware';

const router = express.Router();

// Protect all routes with authentication
router.use(authMiddleware);

// Only admin can manage roles
router.post('/', checkRole(['manage_roles']), (req, res, next) => {
  roleController.createRole(req, res).catch(next);
});

router.get('/', checkRole(['view_roles']), (req, res, next) => {
  roleController.getAllRoles(req, res).catch(next);
});

router.get('/:roleId', checkRole(['view_roles']), (req, res, next) => {
  roleController.getRoleById(req, res).catch(next);
});

router.put('/:roleId', checkRole(['manage_roles']), (req, res, next) => {
  roleController.updateRole(req, res).catch(next);
});

router.delete('/:roleId', checkRole(['manage_roles']), (req, res, next) => {
  roleController.deleteRole(req, res).catch(next);
});

export default router;