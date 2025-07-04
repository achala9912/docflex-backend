// import User from '../models/user.model';
// import Role from '../models/role.model';
// import { IUser, IUserInput } from '../interfaces/user.interface';

// class UserService {
//   async createUser(userData: IUserInput): Promise<IUser> {
//     // Check if role exists
//     const roleExists = await Role.findOne({ roleId: userData.role });
//     if (!roleExists) throw new Error('Role not found');

//     // Generate userId if not provided
//     const lastUser = await User.findOne().sort({ userId: -1 }).limit(1);
//     const lastId = lastUser ? parseInt(lastUser.userId.substring(1)) : 0;
//     const userId = `E${(lastId + 1).toString().padStart(4, '0')}`;

//     const user = new User({ ...userData, userId });
//     return await user.save();
//   }

//   async getAllUsers(): Promise<IUser[]> {
//     return await User.find().populate('role');
//   }

//   async getUserById(userId: string): Promise<IUser | null> {
//     return await User.findOne({ userId }).populate('role');
//   }

//   async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
//     if (updateData.role) {
//       const roleExists = await Role.findOne({ roleId: updateData.role });
//       if (!roleExists) throw new Error('Role not found');
//     }

//     return await User.findOneAndUpdate({ userId }, updateData, { new: true }).populate('role');
//   }

//   async deleteUser(userId: string): Promise<void> {
//     await User.findOneAndDelete({ userId });
//   }

//   async checkUsernameAvailability(userName: string): Promise<boolean> {
//     const user = await User.findOne({ userName });
//     return !user;
//   }
// }

// export default new UserService();

import User from "../models/user.model";
import Role from "../models/role.model";
import { IUser, IUserInput } from "../interfaces/user.interface";

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

    const user = new User({ ...userData, userId });
    const saved = await user.save();

    console.log(`✅ User created: ${saved.name} (userId: ${saved.userId})`);
    return saved;
  }

  async getAllUsers(): Promise<IUser[]> {
    console.log(`📥 Fetching all users`);
    return await User.find().populate("role");
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
}

export default new UserService();
