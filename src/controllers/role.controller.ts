import { Request, Response } from 'express';
import roleService from '../services/role.service';

class RoleController {
  async createRole(req: Request, res: Response) {
    try {
      const role = await roleService.createRole(req.body);
      res.status(201).send(role);
    } catch (error: any) {
      res.status(400).send({ error: error.message });
    }
  }

  async getAllRoles(req: Request, res: Response) {
    try {
      const roles = await roleService.getAllRoles();
      res.send(roles);
    } catch (error: any) {
      res.status(400).send({ error: error.message });
    }
  }

  async getRoleById(req: Request, res: Response) {
    try {
      const role = await roleService.getRoleById(req.params.roleId);
      if (!role) return res.status(404).send({ error: 'Role not found' });
      res.send(role);
    } catch (error: any) {
      res.status(400).send({ error: error.message });
    }
  }

  async updateRole(req: Request, res: Response) {
    try {
      const role = await roleService.updateRole(req.params.roleId, req.body);
      if (!role) return res.status(404).send({ error: 'Role not found' });
      res.send(role);
    } catch (error: any) {
      res.status(400).send({ error: error.message });
    }
  }

  async deleteRole(req: Request, res: Response) {
    try {
      await roleService.deleteRole(req.params.roleId);
      res.send({ message: 'Role deleted successfully' });
    } catch (error: any) {
      res.status(400).send({ error: error.message });
    }
  }
}

export default new RoleController();