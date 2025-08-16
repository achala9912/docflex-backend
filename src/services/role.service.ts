import Role from "../models/role.model";
import User from "../models/user.model";
import PERMISSIONS, { DEFAULT_ROLES } from "../constants/permissions.constants";
import { Permission } from "../constants/permissions.constants";
import { ACTIONS } from "../constants/modification-history.constant";

interface PermissionItem {
  label: string;
  value: string;
}

interface PermissionsJson {
  [key: string]: PermissionItem[];
}

export const createRole = async (
  roleData: any,
  createdBy: string
): Promise<any> => {
  console.log(`🎯 Creating new role: ${roleData.roleName}`);

  // Check for existing role
  const existingRole = await Role.findOne({
    roleName: roleData.roleName,
    isDeleted: false,
  });

  if (existingRole) {
    throw new Error(`Role with name "${roleData.roleName}" already exists`);
  }

  const roleCount = await Role.countDocuments();
  const roleId = `R${(roleCount + 1).toString().padStart(3, "0")}`;

  const role = new Role({
    ...roleData,
    roleId,
    modificationHistory: [
      {
        action: ACTIONS.CREATE,
        modifiedBy: createdBy,
        date: new Date(),
      },
    ],
  });

  const saved = await role.save();
  console.log(`✅ Role created: ${saved.roleName} (ID: ${saved.roleId})`);
  return saved;
};

export const getAllRoles = async (
  params?: any
): Promise<{
  data: any[];
  total: number;
  totalPages: number;
  currentPage: number;
}> => {
  console.log(`📥 Fetching roles with filters:`, params);

  const {
    page = 1,
    limit = 10,
    roleName,
    roleId,
    includeDeleted = false,
  } = params || {};
  const skip = (page - 1) * limit;
  const query: any = {};

  if (roleName) query.roleName = new RegExp(roleName, "i");
  if (roleId) query.roleId = new RegExp(roleId, "i");
  if (!includeDeleted) query.isDeleted = false;

  const [data, total] = await Promise.all([
    Role.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Role.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / Number(limit));
  return { data, total, totalPages, currentPage: Number(page) };
};

export const getRoleById = async (roleId: string): Promise<any> => {
  console.log(`🔍 Looking for role with ID: ${roleId}`);
  return Role.findOne({ roleId, isDeleted: false });
};

export const updateRole = async (
  roleId: string,
  updateData: any,
  modifiedBy: string
): Promise<any> => {
  console.log(`✏️ Updating role ${roleId} with data:`, updateData);

  if (updateData.roleName) {
    const existingRole = await Role.findOne({
      roleName: updateData.roleName,
      roleId: { $ne: roleId },
      isDeleted: false,
    });
    if (existingRole) {
      throw new Error(`Role with name "${updateData.roleName}" already exists`);
    }
  }

  const updated = await Role.findOneAndUpdate(
    { roleId, isDeleted: false },
    {
      ...updateData,
      $push: {
        modificationHistory: {
          action: ACTIONS.UPDATE,
          modifiedBy: modifiedBy,
          date: new Date(),
        },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updated) {
    throw new Error(`Role with ID ${roleId} not found or is deleted`);
  }

  console.log(`✅ Role ${roleId} updated successfully`);
  return updated;
};

export const deleteRole = async (
  roleId: string,
  deletedBy: string
): Promise<void> => {
  console.log(`🗑️ Attempting to delete role with ID: ${roleId}`);

  const usersWithRole = await User.countDocuments({ roleId });
  if (usersWithRole > 0) {
    throw new Error(
      `Cannot delete role. There are ${usersWithRole} user(s) assigned to this role.`
    );
  }

  const deleted = await Role.findOneAndUpdate(
    { roleId, isDeleted: false },
    {
      isDeleted: true,
      $push: {
        modificationHistory: {
          action: ACTIONS.DELETE,
          modifiedBy: deletedBy,
          date: new Date(),
        },
      },
    },
    { new: true }
  );

  if (!deleted) {
    throw new Error(`Role with ID ${roleId} not found or is already deleted`);
  }

  console.log(`✅ Role ${roleId} marked as deleted successfully`);
};

export const getUsersByRole = async (roleId: string): Promise<any[]> => {
  return User.find({ roleId }).select("-password");
};

export const initializeDefaultRoles = async (
  createdBy: string
): Promise<void> => {
  console.log(`🚀 Initializing default roles`);
  for (const defaultRole of DEFAULT_ROLES) {
    const existingRole = await Role.findOne({ roleName: defaultRole.roleName });
    if (!existingRole) {
      const roleCount = await Role.countDocuments();
      const roleId = `R${(roleCount + 1).toString().padStart(3, "0")}`;

      await Role.create({
        roleName: defaultRole.roleName,
        permissions: defaultRole.permissions,
        roleId,
        modificationHistory: [
          {
            action: ACTIONS.CREATE,
            modifiedBy: createdBy,
            date: new Date(),
          },
        ],
      });

      console.log(
        `✅ Created default role: ${defaultRole.roleName} (ID: ${roleId})`
      );
    } else {
      console.log(`ℹ️ Role already exists: ${defaultRole.roleName}`);
    }
  }
};

export const getRolePermissions = async (
  roleId: string
): Promise<Permission[]> => {
  const role = await Role.findOne({ roleId, isDeleted: false });
  if (!role) {
    throw new Error(`Role with ID ${roleId} not found or is deleted`);
  }
  return role.permissions.map((p) => p as Permission);
};

export const getPermissionsJson = (): PermissionsJson => {
  const mapping: PermissionsJson = {};

  Object.entries(PERMISSIONS).forEach(([key, value]) => {
    const parts = key.split("_");
    if (parts.length < 2) return;

    const moduleRaw = parts[0];
    const actionRaw = parts.slice(1).join("_");
    const module = moduleRaw.toLowerCase();

    let label = "";
    if (actionRaw === "MANAGEMENT") {
      label = `Management ${module.charAt(0).toUpperCase() + module.slice(1)}`;
    } else {
      const action =
        actionRaw.charAt(0).toUpperCase() + actionRaw.slice(1).toLowerCase();
      label = `${action} ${module.charAt(0).toUpperCase() + module.slice(1)}`;
    }

    mapping[module] = mapping[module] || [];
    mapping[module].push({ label, value });
  });

  return mapping;
};
