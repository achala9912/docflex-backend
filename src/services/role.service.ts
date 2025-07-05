

import Role from "../models/role.model";
import { DEFAULT_ROLES } from "../constants/permissions.constants";
import { Permission } from "../constants/permissions.constants";

class RoleService {
  async createRole(roleData: any): Promise<any> {
    console.log(`🎯 Creating new role: ${roleData.roleName}`);
    const role = new Role(roleData);
    const saved = await role.save();
    console.log(`✅ Role created: ${saved.roleName} (ID: ${saved.roleId})`);
    return saved;
  }


  async getAllRoles(params?: any): Promise<{
    data: any[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    console.log(`📥 Fetching roles with filters:`, params);

    const { page = 1, limit = 10, roleName, roleId } = params || {};

    const skip = (page - 1) * limit;
    const query: any = {};

    if (roleName) query.roleName = new RegExp(roleName, "i");
    if (roleId) query.roleId = new RegExp(roleId, "i");

    const [data, total] = await Promise.all([
      Role.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Role.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    return {
      data,
      total,
      totalPages,
      currentPage: Number(page),
    };
  }

  async getRoleById(roleId: string): Promise<any> {
    console.log(`🔍 Looking for role with ID: ${roleId}`);
    return Role.findOne({ roleId });
  }

  async updateRole(roleId: string, updateData: any): Promise<any> {
    console.log(`✏️ Updating role ${roleId} with data:`, updateData);
    const updated = await Role.findOneAndUpdate({ roleId }, updateData, {
      new: true,
      runValidators: true,
    });

    if (updated) {
      console.log(`✅ Role ${roleId} updated successfully`);
    } else {
      console.warn(`⚠️ Role ${roleId} not found for update`);
    }

    return updated;
  }

  async deleteRole(roleId: string): Promise<void> {
    console.log(`🗑️ Deleting role with ID: ${roleId}`);
    const deleted = await Role.findOneAndDelete({ roleId });

    if (deleted) {
      console.log(`✅ Role ${roleId} deleted successfully`);
    } else {
      console.warn(`⚠️ Role ${roleId} not found for deletion`);
    }
  }

  async initializeDefaultRoles(): Promise<void> {
    console.log(`🚀 Initializing default roles`);
    for (const defaultRole of DEFAULT_ROLES) {
      const existingRole = await Role.findOne({
        roleName: defaultRole.roleName,
      });
      if (!existingRole) {
        const roleCount = await Role.countDocuments();
        const roleId = `R${(roleCount + 1).toString().padStart(3, "0")}`;

        await Role.create({
          roleName: defaultRole.roleName,
          permissions: defaultRole.permissions,
          roleId,
        });

        console.log(
          `✅ Created default role: ${defaultRole.roleName} (ID: ${roleId})`
        );
      } else {
        console.log(`ℹ️ Role already exists: ${defaultRole.roleName}`);
      }
    }
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    console.log(`🔐 Fetching permissions for role ID: ${roleId}`);
    const role = await Role.findOne({ roleId });
    const permissions = role?.permissions?.map((p) => p as Permission) || [];
    console.log(`✅ Permissions for ${roleId}:`, permissions);
    return permissions;
  }
}

export default new RoleService();
