// // middlewares/role.middleware.ts
// import { Request, Response, NextFunction } from 'express';
// import Role from '../models/role.model';

// const checkRole = (requiredPermissions: string[]) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const roleId = req.tokenData?.role;
//       if (!roleId) throw new Error('Role information missing');

//       const role = await Role.findOne({ roleId });
//       if (!role) throw new Error('Role not found');

//       const hasPermission = requiredPermissions.every(permission =>
//         role.permissions.includes(permission)
//       );

//       if (!hasPermission) {
//         throw new Error('Insufficient permissions');
//       }

//       next();
//     } catch (error) {
//       res.status(403).send({ error: 'Access denied' });
//     }
//   };
// };

// export default checkRole;

import { Request, Response, NextFunction } from "express";
import roleService from "../services/role.service";
import { Permission } from "../constants/permissions.constants";

type AsyncExpressMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const checkPermission = (
  requiredPermission: Permission
): AsyncExpressMiddleware => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roleId = req.tokenData?.role;

      console.log("🛂 Token data:", req.tokenData);
      console.log("🔍 Checking permission:", requiredPermission);

      if (!roleId || typeof roleId !== "string") {
        res.status(401).json({
          success: false,
          message: "Authentication required: missing or invalid role",
        });
        return;
      }

      const permissions = await roleService.getRolePermissions(roleId);
      console.log(`🔐 Permissions for role ${roleId}:`, permissions);

      if (!permissions.includes(requiredPermission)) {
        res.status(403).json({
          success: false,
          message: "Insufficient permissions",
          requiredPermission,
          yourPermissions: permissions,
        });
        return;
      }

      next();
    } catch (error) {
      console.error("❌ Error in checkPermission middleware:", error);
      next(error);
    }
  };
};

export const checkAnyPermission = (
  ...requiredPermissions: Permission[]
): AsyncExpressMiddleware => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roleId = req.tokenData?.role;

      console.log("🛂 Token data:", req.tokenData);
      console.log("🔍 Checking any of permissions:", requiredPermissions);

      if (!roleId || typeof roleId !== "string") {
        res.status(401).json({
          success: false,
          message: "Authentication required: missing or invalid role",
        });
        return;
      }

      const permissions = await roleService.getRolePermissions(roleId);
      console.log(`🔐 Permissions for role ${roleId}:`, permissions);

      const hasPermission = requiredPermissions.some((perm) =>
        permissions.includes(perm)
      );

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          message: "Insufficient permissions",
          requiredPermissions,
          yourPermissions: permissions,
        });
        return;
      }

      next();
    } catch (error) {
      console.error("❌ Error in checkAnyPermission middleware:", error);
      next(error);
    }
  };
};

export const withPermissions = (
  permissions: Permission | Permission[],
  handler: (req: Request, res: Response) => Promise<void>
): AsyncExpressMiddleware[] => {
  const middleware = Array.isArray(permissions)
    ? checkAnyPermission(...permissions)
    : checkPermission(permissions);

  return [
    middleware,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await handler(req, res);
      } catch (error) {
        next(error);
      }
    },
  ];
};

export const protectedRoute = (
  permission: Permission | Permission[],
  handler: (req: Request, res: Response) => Promise<void>
): AsyncExpressMiddleware[] => {
  return [
    Array.isArray(permission)
      ? checkAnyPermission(...permission)
      : checkPermission(permission),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await handler(req, res);
      } catch (error) {
        next(error);
      }
    },
  ];
};
