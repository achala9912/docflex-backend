import User from "../models/user.model";
import { IUserDocument } from "../interfaces/user.interface";
import { createToken } from "../utils/jwt";
import { ITokenData } from "../interfaces/token.interface";

import nodemailer from "nodemailer";

class AuthService {
  async login(
    userName: string,
    password: string
  ): Promise<{ user: IUserDocument; token: string }> {
    console.log(`🔐 Attempting login for userName: ${userName}`);

    const user = (await User.findOne({ userName })
      .select("+password")
      .exec()) as IUserDocument | null;
    if (!user) {
      console.warn(`❌ User not found for userName: ${userName}`);
      throw new Error("Invalid credentials");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.warn(`❌ Password mismatch for userName: ${userName}`);
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      console.warn(`🚫 Inactive account login attempt: ${userName}`);
      throw new Error("User account is inactive");
    }

    // ✅ Populate role
    await user.populate("role");
    const role = user.role as unknown as { roleId: string; roleName: string };

    const tokenData: ITokenData = {
      userId: user.userId,
      role: role.roleId,
      ...(role.roleName !== "SystemAdmin" &&
        user.centerId && { centerId: user.centerId.toString() }),
    };

    const token = createToken(tokenData).token;

    console.log(`✅ Login successful for userId: ${user.userId}`);

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return { user: user as IUserDocument, token };
  }

  async getCurrentUser(userId: string): Promise<IUserDocument> {
    console.log(`👤 Fetching current user with userId: ${userId}`);
    const user = (await User.findOne({ userId })
      .populate("role")
      .exec()) as IUserDocument | null;
    if (!user) {
      console.warn(`❌ User not found with userId: ${userId}`);
      throw new Error("User not found");
    }

    console.log(`✅ Found user: ${user.name} (${user.userName})`);
    return user;
  }

  async changePassword(
    userName: string,
    oldPassword: string,
    newPassword: string
  ) {
    const user = await User.findOne({ userName }).select("+password");
    if (!user) throw new Error("User not found.");

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) throw new Error("Old password is incorrect.");

    user.password = newPassword;
    await user.save();
    return true;
  }

  async sendForgotPasswordOtp(userName: string) {
    const user = await User.findOne({ userName });
    if (!user) throw new Error("User not found.");

    // Generate 4 digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Save OTP and expiry (5 min) to user
    user.resetOtp = otp;
    user.resetOtpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    // Send OTP to user email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    await transporter.sendMail({
      from: "Docflex Pro",
      to: user.email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
    });

    return true;
  }

  async verifyOtpAndResetPassword(
    userName: string,
    otp: string,
    newPassword: string
  ) {
    const user = await User.findOne({ userName });
    if (!user) throw new Error("User not found.");
    if (
      !user.resetOtp ||
      !user.resetOtpExpiry ||
      user.resetOtp !== otp ||
      user.resetOtpExpiry < new Date()
    ) {
      throw new Error("Invalid or expired OTP.");
    }
    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();
    return true;
  }
}

export default new AuthService();
