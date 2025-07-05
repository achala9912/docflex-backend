import "express";

declare module "express" {
  interface Request {
    tokenData?: {
      userId: string;
      role: string;
    };
  }
}
