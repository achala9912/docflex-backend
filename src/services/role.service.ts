import Role from '../models/role.model';
import { IRole } from '../interfaces/role.interface';

class RoleService {
  async createRole(roleData: Partial<IRole>): Promise<IRole> {
    // Generate roleId if not provided
    if (!roleData.roleId) {
      const lastRole = await Role.findOne().sort({ roleId: -1 }).limit(1);
      const lastId = lastRole ? parseInt(lastRole.roleId.substring(1)) : 0;
      roleData.roleId = `R${(lastId + 1).toString().padStart(3, '0')}`;
    }

    const role = new Role(roleData);
    return await role.save();
  }

  async getAllRoles(): Promise<IRole[]> {
    return await Role.find();
  }

  async getRoleById(roleId: string): Promise<IRole | null> {
    return await Role.findOne({ roleId });
  }

  async updateRole(roleId: string, updateData: Partial<IRole>): Promise<IRole | null> {
    return await Role.findOneAndUpdate({ roleId }, updateData, { new: true });
  }

  async deleteRole(roleId: string): Promise<void> {
    await Role.findOneAndDelete({ roleId });
  }
}

export default new RoleService();