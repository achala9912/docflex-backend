import User from "../models/user.model";
import Role from "../models/role.model";
import mongoose, { Types } from "mongoose";
import { IUser, IUserInput } from "../interfaces/user.interface";
import { ITokenData } from "../interfaces/token.interface";

class UserService {
  async createUser(userData: IUserInput): Promise<IUser> {
    console.log(`🧾 Creating user: ${userData.userName}`);

    const roleExists = await Role.findOne({ roleId: userData.role });
    if (!roleExists) {
      console.warn(`❌ Role not found for roleId: ${userData.role}`);
      throw new Error("Role not found");
    }

    const lastUser = await User.findOne().sort({ userId: -1 }).limit(1);
    const lastId = lastUser ? parseInt(lastUser.userId.substring(1)) : 0;
    const userId = `E${(lastId + 1).toString().padStart(4, "0")}`;

    const user = new User({
      ...userData,
      role: roleExists._id,
      centerId: userData.centerId
        ? new mongoose.Types.ObjectId(userData.centerId)
        : undefined,
      userId,
    });

    const saved = await user.save();

    console.log(`✅ User created: ${saved.name} (userId: ${saved.userId})`);
    return saved;
  }

  async getAllUsers(params: any, tokenData: ITokenData): Promise<any> {
    const { page = 1, limit = 10, name, email, userName } = params;
    const skip = (page - 1) * limit;
    const query: any = { isDeleted: false };

    if (name) query.name = new RegExp(name, "i");
    if (email) query.email = new RegExp(email, "i");
    if (userName) query.userName = new RegExp(userName, "i");

    if (tokenData.role !== "SystemAdmin") {
      query.centerId = tokenData.centerId;
    }

    const users = await User.find(query)
      .select("-password")
      .populate("role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    return {
      data: users,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: parseInt(page),
    };
  }

  async getUserById(userId: string): Promise<IUser | null> {
    console.log(`🔍 Fetching user with ID: ${userId}`);
    const user = await User.findOne({ userId }).populate("role");

    if (user) {
      console.log(`✅ Found user: ${user.name} (${user.userName})`);
    } else {
      console.warn(`❌ User not found for ID: ${userId}`);
    }

    return user;
  }

  async updateUser(
    userId: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    console.log(`✏️ Updating user ${userId}`);

    if (updateData.role) {
      const roleExists = await Role.findOne({ roleId: updateData.role });
      if (!roleExists) {
        console.warn(`❌ Role not found for roleId: ${updateData.role}`);
        throw new Error("Role not found");
      }
      updateData.role = roleExists._id as Types.ObjectId;
    }

    if (updateData.centerId) {
      updateData.centerId = new mongoose.Types.ObjectId(updateData.centerId);
    }

    const updatedUser = await User.findOneAndUpdate({ userId }, updateData, {
      new: true,
    }).populate("role");

    if (updatedUser) {
      console.log(`✅ Updated user ${userId}`);
    } else {
      console.warn(`⚠️ User ${userId} not found for update`);
    }

    return updatedUser;
  }

  async deleteUser(userId: string): Promise<void> {
    console.log(`🗑️ Deleting user with ID: ${userId}`);
    const deleted = await User.findOneAndDelete({ userId });

    if (deleted) {
      console.log(`✅ User ${userId} deleted`);
    } else {
      console.warn(`⚠️ User ${userId} not found for deletion`);
    }
  }

  async checkUsernameAvailability(userName: string): Promise<boolean> {
    console.log(`🔍 Checking availability for username: ${userName}`);
    const user = await User.findOne({ userName });
    const isAvailable = !user;
    console.log(
      `ℹ️ Username "${userName}" is ${isAvailable ? "available" : "taken"}`
    );
    return isAvailable;
  }

  async getRolePermissions(roleId: string): Promise<string[]> {
    const role = await Role.findOne({ roleId });
    if (!role) {
      console.warn(`⚠️ Role not found for ID: ${roleId}`);
      return [];
    }
    return role.permissions;
  }
}

export default new UserService();
