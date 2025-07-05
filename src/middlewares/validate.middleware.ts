import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

const validate = (schema: AnyZodObject) => 
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query
      });
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
        return; // Explicit return after sending response
      }
      next(err);
    }
  };

export default validate;