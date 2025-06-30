// middlewares/role.middleware.ts
import { Request, Response, NextFunction } from 'express';
import Role from '../models/role.model';

const checkRole = (requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roleId = req.tokenData?.role;
      if (!roleId) throw new Error('Role information missing');

      const role = await Role.findOne({ roleId });
      if (!role) throw new Error('Role not found');

      const hasPermission = requiredPermissions.every(permission => 
        role.permissions.includes(permission)
      );

      if (!hasPermission) {
        throw new Error('Insufficient permissions');
      }

      next();
    } catch (error) {
      res.status(403).send({ error: 'Access denied' });
    }
  };
};

export default checkRole;