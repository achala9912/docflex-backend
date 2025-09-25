import { Request, Response, NextFunction } from "express";
import * as roleService from "../services/role.service";
import { Permission } from "../constants/permissions.constants";

type AsyncExpressMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;


export const checkPermission = (
  requiredPermission: Permission
): AsyncExpressMiddleware => {
  return async (req, res, next) => {
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
      if (!permissions) {
        res.status(404).json({
          success: false,
          message: "Role not found",
        });
        return; 
      }

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
  return async (req, res, next) => {
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
      if (!permissions) {
        res.status(404).json({
          success: false,
          message: "Role not found",
        });
        return;
      }

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
    async (req, res, next): Promise<void> => {
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
    async (req, res, next): Promise<void> => {
      try {
        await handler(req, res);
      } catch (error) {
        next(error);
      }
    },
  ];
};
