import { Request, Response, NextFunction } from "express";
import * as genericNameService from "../services/generic-name.service";

export const createGenericName = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const createdBy = req.tokenData?.userId || "system";
    const { genericName } = req.body;

    if (!genericName) {
      res.status(400).json({ message: "genericName is required" });
      return;
    }

    const newGenericName = await genericNameService.createGenericName(
      genericName,
      createdBy
    );

    res.status(201).json(newGenericName);
  } catch (error) {
    next(error);
  }
};

export const getAllGenericNames = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const result = await genericNameService.getAllGenericNames({
      page: Number(page),
      limit: Number(limit),
      search: String(search),
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getGenericById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const generic = await genericNameService.getGenericById(req.params.id);
    res.json(generic);
  } catch (error) {
    next(error);
  }
};

export const deleteGenericById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deletedBy = req.tokenData?.userId || "system";
    const result = await genericNameService.deleteGenericById(
      req.params.id,
      deletedBy
    );
    res.json({ message: "Deleted successfully", data: result });
  } catch (error) {
    next(error);
  }
};

export const updateGenericById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const modifiedBy = req.tokenData?.userId || "system";
    const result = await genericNameService.updateGenericById(
      req.params.id,
      req.body,
      modifiedBy
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};
