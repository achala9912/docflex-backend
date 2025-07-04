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
    const role = new Role(roleData);
    return await role.save();
  }
  async getAllRoles(): Promise<any[]> {
    return Role.find();
  }

  async getRoleById(roleId: string): Promise<any> {
    return Role.findOne({ roleId });
  }

  // Add these new methods:
  async updateRole(roleId: string, updateData: any): Promise<any> {
    return Role.findOneAndUpdate({ roleId }, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async deleteRole(roleId: string): Promise<void> {
    await Role.findOneAndDelete({ roleId });
  }

  async initializeDefaultRoles(): Promise<void> {
    for (const defaultRole of DEFAULT_ROLES) {
      const existingRole = await Role.findOne({
        roleName: defaultRole.roleName,
      });
      if (!existingRole) {
        await Role.create({
          roleName: defaultRole.roleName,
          permissions: defaultRole.permissions,
          roleId: `R${((await Role.countDocuments()) + 1)
            .toString()
            .padStart(3, "0")}`,
        });
      }
    }
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const role = await Role.findOne({ roleId });
    return role?.permissions?.map((p) => p as Permission) || [];
  }
}

export default new RoleService();
