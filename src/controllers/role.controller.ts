// import { NextFunction, Request, Response } from "express";
// import * as roleService from "../services/role.service";

// class RoleController {
//   async getAllRoles(req: Request, res: Response): Promise<void> {
//     try {
//       const roles = await roleService.getAllRoles(req.query);
//       res.status(200).json(roles);
//     } catch (error) {
//       res.status(500).json({ error: "Failed to fetch roles" });
//     }
//   }

//   async getRoleById(req: Request, res: Response): Promise<void> {
//     try {
//       const role = await roleService.getRoleById(req.params.roleId);
//       if (!role) {
//         res.status(404).json({ error: "Role not found" });
//         return;
//       }
//       res.json(role);
//     } catch (error) {
//       this.handleError(res, error, 500, "Failed to fetch role");
//     }
//   }

//   // Add the createRole method
//   async createRole(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> {
//     try {
//       const newRole = await roleService.createRole(req.body);
//       res.status(201).json(newRole);
//     } catch (error) {
//       next(error);
//     }
//   }

//   async updateRole(req: Request, res: Response): Promise<void> {
//     try {
//       const updatedRole = await roleService.updateRole(
//         req.params.roleId,
//         req.body
//       );
//       if (!updatedRole) {
//         res.status(404).json({ error: "Role not found" });
//         return;
//       }
//       res.json(updatedRole);
//     } catch (error) {
//       this.handleError(res, error, 400, "Failed to update role");
//     }
//   }

//   async deleteRole(req: Request, res: Response): Promise<void> {
//     try {
//       const role = await roleService.getRoleById(req.params.roleId);
//       if (!role) {
//         res.status(404).json({ error: "Role not found" });
//         return;
//       }
//       await roleService.deleteRole(req.params.roleId);
//       res.status(204).send();
//     } catch (error) {
//       this.handleError(res, error, 500, "Failed to delete role");
//     }
//   }

//   private handleError(
//     res: Response,
//     error: unknown,
//     statusCode: number,
//     defaultMessage: string
//   ): void {
//     const errorMessage =
//       error instanceof Error ? error.message : defaultMessage;
//     res.status(statusCode).json({ error: errorMessage });
//   }
// }

// export default new RoleController();

import { NextFunction, Request, Response } from "express";
import * as roleService from "../services/role.service";

export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await roleService.getAllRoles(req.query);
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch roles",
    });
  }
};

export const getRoleById = async (req: Request, res: Response) => {
  try {
    const role = await roleService.getRoleById(req.params.roleId);
    if (!role) {
      res.status(404).json({ error: "Role not found" });
      return;
    }
    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch role",
    });
  }
};

export const createRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const newRole = await roleService.createRole(req.body);
    res.status(201).json(newRole);
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const updatedRole = await roleService.updateRole(
      req.params.roleId,
      req.body
    );
    if (!updatedRole) {
      res.status(404).json({ error: "Role not found" });
      return;
    }
    res.status(200).json(updatedRole);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Failed to update role",
    });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const role = await roleService.getRoleById(req.params.roleId);
    if (!role) {
      res.status(404).json({ error: "Role not found" });
      return;
    }
    await roleService.deleteRole(req.params.roleId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to delete role",
    });
  }
};

export const getRolePermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await roleService.getRolePermissions(req.params.roleId);
    res.status(200).json(permissions);
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to fetch permissions",
    });
  }
};

export const getPermissionsConstant = (req: Request, res: Response): void => {
  try {
    const permissions = roleService.getPermissionsJson();
    res.status(200).json(permissions);
  } catch (error) {
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to fetch permissions",
    });
  }
};
