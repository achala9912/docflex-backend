import { Request, Response, NextFunction } from "express";
import * as patientService from "../services/patient.service";

export const createPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const createdBy = req.tokenData?.userId || "system";
    const patient = await patientService.createPatient(req.body, createdBy);
    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const modifiedBy = req.tokenData?.userId || "system";
    const updatedPatient = await patientService.updatePatient(
      req.params.patientId,
      req.body,
      modifiedBy
    );

    if (!updatedPatient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }

    res.json(updatedPatient);
  } catch (error) {
    next(error);
  }
};

export const deletePatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deletedBy = req.tokenData?.userId || "system";
    const result = await patientService.deletePatient(
      req.params.patientId,
      deletedBy
    );

    if (!result) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getAllPatients = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, search = "", centerId } = req.query;
    const includeDeleted = req.query.includeDeleted === "true";

    const result = await patientService.getAllPatients(
      {
        page: Number(page),
        limit: Number(limit),
        search: String(search),
        centerId: centerId?.toString(),
      },
      includeDeleted
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getPatient = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patient = await patientService.getPatientById(req.params.patientId);

    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }

    res.json(patient);
  } catch (error) {
    next(error);
  }
};
