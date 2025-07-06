import { z } from "zod";
import { PERMISSIONS } from "../constants/permissions.constants";

const permissionValues = Object.values(PERMISSIONS) as [string, ...string[]];

export const RoleSchema = z.object({
  roleName: z
    .string()
    .min(2, "Role name must be at least 2 characters")
    .max(50, "Role name too long"),
  permissions: z
    .array(z.enum(permissionValues))
    .nonempty({ message: "At least one permission is required" }),
});

export const UpdateRoleSchema = z.object({
  roleName: z.string().optional(),
  permissions: z
    .array(z.string())
    .refine(
      (permissions) => permissions.every((permission) => permissionValues.includes(permission)),
      { message: "Invalid permission(s) provided" }
    )
    .optional(),
});

// Type for TypeScript
export type IRoleInput = z.infer<typeof RoleSchema>;
