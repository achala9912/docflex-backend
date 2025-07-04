import { Document, Types } from "mongoose";
import { Permission } from "../constants/permissions.constants";
import { ACTIONS } from "../constants/modification-history.constant";

export interface IRole {
  roleId: string;
  roleName: string;
  permissions: Permission[];
  isDeleted?: boolean;
  modificationHistory?: {
    action: (typeof ACTIONS)[keyof typeof ACTIONS];
    modifiedBy: string;
    date: Date;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRoleInput
  extends Omit<IRole, "roleId" | "isDeleted" | "modificationHistory"> {}

export interface IRoleDocument extends IRole, Document {}
