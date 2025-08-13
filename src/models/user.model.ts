import mongoose, { Schema, model } from "mongoose";
import { IUserDocument } from "../interfaces/user.interface";
import bcrypt from "bcryptjs";
import { GENDERS } from "../constants/gender.constants";
import { ACTIONS } from "../constants/modification-history.constant";

const userSchema = new Schema<IUserDocument>(
  {
    userId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    name: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    centerId: { type: mongoose.Schema.Types.ObjectId, ref: "MedicalCenter" },
    gender: {
      type: String,
      enum: Object.values(GENDERS),
      default: GENDERS.MALE,
    },
    slmcNo: { type: String },
    specialization: { type: String },
    email: { type: String, required: true, unique: true },
    contactNo: { type: String, required: true },
    password: { type: String, required: true, select: false },
    remarks: { type: String },
    digitalSignature: { type: String },
    isActive: { type: Boolean, default: true },
    isNewUser: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    isAdminUser: { type: Boolean, default: false },
    modificationHistory: [
      {
        action: { type: String, enum: Object.values(ACTIONS) },
        modifiedBy: { type: String },
        date: { type: Date, default: Date.now },
      },
    ],
    // Add for OTP
    resetOtp: { type: String },
    resetOtpExpiry: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.resetOtp;
        delete ret.resetOtpExpiry;
      },
    },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default model<IUserDocument>("User", userSchema);