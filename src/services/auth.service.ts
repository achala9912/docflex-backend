import User from "../models/user.model";
import { IUserDocument } from "../interfaces/user.interface";
import { createToken } from "../utils/jwt";
import { ITokenData } from "../interfaces/token.interface";
import { passwordResetTemplate } from "../utils/otpEmailTemplates";
import nodemailer from "nodemailer";
class AuthService {
  // async login(
  //   userName: string,
  //   password: string
  // ): Promise<{
  //   user: IUserDocument;
  //   token?: string;
  //   mustResetPassword?: boolean;
  // }> {
  //   const user = (await User.findOne({ userName })
  //     .select("+password +isNewUser")
  //     .populate("role")
  //     .exec()) as IUserDocument | null;
  //   if (!user) throw new Error("Invalid credentials");

  //   const isMatch = await user.comparePassword(password);
  //   if (!isMatch) throw new Error("Invalid credentials");

  //   if (!user.isActive) throw new Error("User account is inactive");

  //   if (user.isNewUser) return { user, mustResetPassword: true };

  //   const role = user.role as unknown as { roleId: string; roleName: string };

  //   const tokenData: ITokenData = {
  //     userId: user.userId,
  //     role: role.roleId,
  //     ...(role.roleName !== "SystemAdmin" &&
  //       user.centerId && { centerId: user.centerId.toString() }),
  //   };

  //   const token = createToken(tokenData).token;

  //   return { user, token };
  // }

  async login(
    userName: string,
    password: string
  ): Promise<{
    user: IUserDocument;
    token?: string;
    mustResetPassword?: boolean;
  }> {
    const user = (await User.findOne({ userName })
      .select("+password +isNewUser")
      .populate("role")
      .exec()) as IUserDocument | null;

    if (!user) throw new Error("Invalid credentials");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error("Invalid credentials");

    if (!user.isActive) throw new Error("User account is inactive");

    const role = user.role as unknown as { roleId: string; roleName: string };

    const tokenData: ITokenData = {
      userId: user.userId,
      role: role.roleId,
      ...(role.roleName !== "SystemAdmin" &&
        user.centerId && { centerId: user.centerId.toString() }),
    };

    const token = createToken(tokenData).token;

    //Instead of blocking login, just return flag
    if (user.isNewUser) {
      return { user, token, mustResetPassword: true };
    }

    return { user, token, mustResetPassword: false };
  }

  async resetFirstLoginPassword(userName: string, newPassword: string) {
    const user = await User.findOne({ userName }).select(
      "+password +isNewUser"
    );
    if (!user) throw new Error("User not found");
    if (!user.isNewUser) throw new Error("Password reset not required");

    user.password = newPassword;
    user.isNewUser = false;
    await user.save();

    return true;
  }

  async changePassword(
    userName: string,
    oldPassword: string,
    newPassword: string
  ) {
    const user = await User.findOne({ userName }).select("+password");
    if (!user) throw new Error("User not found");

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) throw new Error("Old password is incorrect");

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
      from: '"DocFlex Pro" <no-reply@docflexpro.com>',
      to: user.email,
      subject: "Your Password Reset OTP",
      text: `Your OTP code is ${otp}. This code will expire in 5 minutes.`,
      html: passwordResetTemplate(otp, user.name || user.userName),
    });

    return true;
  }

  async verifyOtpAndResetPassword(
    userName: string,
    otp: string,
    newPassword: string
  ) {
    const user = await User.findOne({ userName });
    if (!user) throw new Error("User not found");

    if (
      !user.resetOtp ||
      user.resetOtp !== otp ||
      !user.resetOtpExpiry ||
      user.resetOtpExpiry < new Date()
    )
      throw new Error("Invalid or expired OTP");

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    return true;
  }

  async getCurrentUser(userId: string) {
    const user = await User.findOne({ userId }).populate("role").exec();
    if (!user) throw new Error("User not found");
    return user;
  }
}

export default new AuthService();
