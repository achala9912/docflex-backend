// import Role from '../models/role.model';
// import { DEFAULT_ROLES } from '../constants/permissions.constants';
// import { Permission } from '../constants/permissions.constants';

// class RoleService {
//   async initializeDefaultRoles(): Promise<void> {
//     for (const defaultRole of DEFAULT_ROLES) {
//       const existingRole = await Role.findOne({ roleName: defaultRole.roleName });
//       if (!existingRole) {
//         await Role.create({
//           roleName: defaultRole.roleName,
//           permissions: defaultRole.permissions,
//           roleId: `R${(await Role.countDocuments() + 1).toString().padStart(3, '0')}`
//         });
//       }
//     }
//   }

//   async getRolePermissions(roleId: string): Promise<Permission[]> {
//     const role = await Role.findOne({ roleId });
//     return role?.permissions?.map(p => p as Permission) || [];
//   }

//   async createRole(roleData: {
//     roleName: string;
//     permissions: Permission[];
//   }): Promise<any> {
//     return Role.create({
//       ...roleData,
//       roleId: `R${(await Role.countDocuments() + 1).toString().padStart(3, '0')}`
//     });
//   }

//   async getAllRoles(): Promise<any[]> {
//     return Role.find();
//   }
// }

// export default new RoleService();

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

  async getAllRoles(): Promise<any[]> {
    console.log(`📥 Fetching all roles`);
    return Role.find();
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
      const existingRole = await Role.findOne({ roleName: defaultRole.roleName });
      if (!existingRole) {
        const roleCount = await Role.countDocuments();
        const roleId = `R${(roleCount + 1).toString().padStart(3, '0')}`;

        await Role.create({
          roleName: defaultRole.roleName,
          permissions: defaultRole.permissions,
          roleId,
        });

        console.log(`✅ Created default role: ${defaultRole.roleName} (ID: ${roleId})`);
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