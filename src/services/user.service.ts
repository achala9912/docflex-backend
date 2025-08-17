import User from "../models/user.model";
import Role from "../models/role.model";
import mongoose, { Types } from "mongoose";
import { IUser, IUserInput } from "../interfaces/user.interface";
import { ITokenData } from "../interfaces/token.interface";
import { DEFAULT_ROLES } from "../constants/permissions.constants";
import crypto from "crypto";

import nodemailer from "nodemailer";
import { temporaryPasswordTemplate } from "../utils/otpEmailTemplates";

// export const createUser = async (userData: IUserInput): Promise<IUser> => {
//   console.log(`🧾 Creating user: ${userData.userName}`);

//   const roleExists = await Role.findOne({ roleId: userData.role });
//   if (!roleExists) throw new Error("Role not found");

//   const lastUser = await User.findOne().sort({ userId: -1 }).limit(1);
//   const lastId = lastUser ? parseInt(lastUser.userId.substring(1)) : 0;
//   const userId = `E${(lastId + 1).toString().padStart(4, "0")}`;

//   // Generate temporary password
//   const tempPassword = crypto.randomBytes(4).toString("hex"); // 8 chars
//   console.log(`Temporary password for ${userData.userName}: ${tempPassword}`);

//   const user = new User({
//     ...userData,
//     role: roleExists._id,
//     centerId: userData.centerId
//       ? new mongoose.Types.ObjectId(userData.centerId)
//       : undefined,
//     userId,
//     password: tempPassword,
//   });

//   const savedUser = await user.save();

//   // Send temporary password via email
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASSWORD,
//     },
//   });

//   const emailContent = temporaryPasswordTemplate(
//     tempPassword,
//     user.name,
//     user.userName
//   );

//   await transporter.sendMail({
//     from: '"DocFlex Pro" <no-reply@docflexpro.com>',
//     to: user.email,
//     subject: "Your Temporary Password",
//     text: emailContent.text,
//     html: emailContent.html,
//   });

//   console.log(`✅ User created and temp password sent: ${savedUser.userId}`);
//   return savedUser;
// };

export const createUser = async (userData: IUserInput): Promise<IUser> => {
  console.log(`🧾 Creating user: ${userData.userName}`);

  const roleExists = await Role.findOne({ roleId: userData.role });
  if (!roleExists) throw new Error("Role not found");

  // 🔍 Check if userName OR email already exists in the same center
  const existingUser = await User.findOne({
    centerId: userData.centerId,
    isDeleted: { $ne: true },
    $or: [{ userName: userData.userName }, { email: userData.email }],
  });

  if (existingUser) {
    if (existingUser.userName === userData.userName) {
      throw new Error(
        `The username "${userData.userName}" already exists in this medical center.`
      );
    }
    if (existingUser.email === userData.email) {
      throw new Error(
        `The email "${userData.email}" is already registered in this medical center.`
      );
    }
  }

  const lastUser = await User.findOne().sort({ userId: -1 }).limit(1);
  const lastId = lastUser ? parseInt(lastUser.userId.substring(1)) : 0;
  const userId = `E${(lastId + 1).toString().padStart(4, "0")}`;

  // Generate temporary password
  const tempPassword = crypto.randomBytes(4).toString("hex"); // 8 chars
  console.log(`Temporary password for ${userData.userName}: ${tempPassword}`);

  const user = new User({
    ...userData,
    role: roleExists._id,
    centerId: userData.centerId
      ? new mongoose.Types.ObjectId(userData.centerId)
      : undefined,
    userId,
    password: tempPassword,
  });

  const savedUser = await user.save();

  // Send temporary password via email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const emailContent = temporaryPasswordTemplate(
    tempPassword,
    user.name,
    user.userName
  );

  await transporter.sendMail({
    from: '"DocFlex Pro" <no-reply@docflexpro.com>',
    to: user.email,
    subject: "Your Temporary Password",
    text: emailContent.text,
    html: emailContent.html,
  });

  console.log(`✅ User created and temp password sent: ${savedUser.userId}`);
  return savedUser;
};

export const getAllUsers = async (
  params: {
    page?: number;
    limit?: number;
    name?: string;
    email?: string;
    userName?: string;
    roleId?: string;
  },
  tokenData: ITokenData
): Promise<{
  data: IUser[];
  total: number;
  totalPages: number;
  currentPage: number;
}> => {
  const { page = 1, limit = 10, name, email, userName, roleId } = params;
  const skip = (page - 1) * limit;

  const query: any = {
    $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
  };

  if (name) query.name = new RegExp(name, "i");
  if (email) query.email = new RegExp(email, "i");
  if (userName) query.userName = new RegExp(userName, "i");

  if (roleId) {
    const role = await Role.findOne({ roleId }).lean();
    if (role) query.role = role._id;
  }

  const isSystemAdmin = tokenData.role === "R001"; 
  if (!isSystemAdmin) {
    query.centerId = tokenData.centerId;
  }

  const users = await User.find(query)
    .select("-password")
    .populate("role")
    .populate("centerId", "centerName")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await User.countDocuments(query);

  return {
    data: users as IUser[],
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
  };
};

// Get User By ID (with centerName flattened)
export const getUserById = async (userId: string): Promise<IUser | null> => {
  console.log(`🔍 Fetching user with ID: ${userId}`);

  if (!mongoose.isValidObjectId(userId) && !userId.startsWith("E")) {
    console.warn(`⚠️ Invalid user ID format: ${userId}`);
    return null;
  }

  const user = await User.findOne({ userId })
    .populate("role")
    .populate("centerId", "centerName")
    .lean();

  if (user) {
    console.log(`✅ Found user: ${user.name} (${user.userName})`);
  } else {
    console.warn(`❌ User not found for ID: ${userId}`);
  }

  return user as IUser | null;
};

// Update User
export const updateUser = async (
  userId: string,
  updateData: Partial<IUser>
): Promise<IUser | null> => {
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
  })
    .populate("role")
    .populate("centerId", "centerName")
    .lean();

  if (updatedUser) {
    console.log(`✅ Updated user ${userId}`);
  } else {
    console.warn(`⚠️ User ${userId} not found for update`);
  }

  return updatedUser as IUser | null;
};

// Delete User (soft delete)
export const deleteUser = async (userId: string): Promise<IUser | null> => {
  console.log(`🗑️ Deleting user with ID: ${userId}`);

  // Consider soft delete instead of hard delete
  const deletedUser = await User.findOneAndUpdate(
    { userId },
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );

  if (deletedUser) {
    console.log(`✅ User ${userId} marked as deleted`);
    return deletedUser;
  }

  console.warn(`⚠️ User ${userId} not found for deletion`);
  return null;
};

// Username Availability Check
export const checkUsernameAvailability = async (
  userName: string
): Promise<{ available: boolean; message?: string }> => {
  console.log(`🔍 Checking availability for username: ${userName}`);

  if (!userName || userName.length < 3) {
    return {
      available: false,
      message: "Username must be at least 3 characters long",
    };
  }

  const user = await User.findOne({ userName });
  const isAvailable = !user;

  console.log(
    `ℹ️ Username "${userName}" is ${isAvailable ? "available" : "taken"}`
  );

  return {
    available: isAvailable,
    message: isAvailable ? undefined : "Username is already taken",
  };
};

// Get Permissions for Role
export const getRolePermissions = async (roleId: string): Promise<string[]> => {
  const role = await Role.findOne({ roleId }).lean();
  if (!role) {
    console.warn(`⚠️ Role not found for ID: ${roleId}`);
    return [];
  }
  return role.permissions || [];
};

// export const getUsersForSuggestion = async (params: any) => {
//   try {
//     const { search } = params;
//     const query: any = { isDeleted: false };

//     if (search) {
//       query.$or = [
//         { name: new RegExp(search, "i") },
//         { userName: new RegExp(search, "i") },
//       ];
//     }

//     const systemAdminRole = await Role.findOne({
//       roleName: /systemadmin/i,
//     }).lean();
//     if (systemAdminRole) {
//       query.role = { $ne: systemAdminRole._id };
//     }

//     return await User.find(query, "name email contactNo employeeId _id");
//   } catch (error: any) {
//     console.error("❌ Error in getUsersForSuggestion:", error.message);
//     throw new Error("Failed to fetch users for suggestion");
//   }
// };

export const getUsersForSuggestion = async (params: any) => {
  try {
    const { search } = params;
    const query: any = { isDeleted: false };

    const defaultRoles = DEFAULT_ROLES.map(
      (r) => new RegExp(`^${r.roleName}$`, "i")
    );
    const rolesToExclude = await Role.find({ roleName: { $in: defaultRoles } })
      .select("_id")
      .lean();

    if (rolesToExclude.length > 0) {
      query.role = { $nin: rolesToExclude.map((r) => r._id) };
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ name: searchRegex }, { userName: searchRegex }];
    }

    return await User.find(query, "name email contactNo employeeId _id");
  } catch (error: any) {
    console.error("❌ Error in getUsersForSuggestion:", error.message);
    throw new Error("Failed to fetch users for suggestion");
  }
};
