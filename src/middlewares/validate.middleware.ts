import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";

const validate = (schema: ZodType<any, any, any>) => 
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          errors: err.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
        return;
      }
      next(err);
    }
  };

export default validate;
