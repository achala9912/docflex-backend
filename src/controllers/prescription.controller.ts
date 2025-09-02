import { Request, Response } from "express";
import * as prescriptionService from "../services/prescription.service";

export const createPrescription = async (req: Request, res: Response) => {
  try {
    const createdBy = req.tokenData?.userId || "system";

    const prescription = await prescriptionService.createPrescriptionService(
      req.body,
      createdBy
    );

    res.status(201).json(prescription);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPrescriptions = async (req: Request, res: Response) => {
  try {
    const prescriptions = await prescriptionService.getAllPrescriptionsService(
      req.query
    );
    res.json(prescriptions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPrescriptionById = async (req: Request, res: Response) => {
  try {
    const { prescriptionNo } = req.params;
    const prescription = await prescriptionService.getPrescriptionByIdService(
      prescriptionNo
    );

    if (!prescription) {
      res.status(404).json({ message: "Prescription not found" });
      return;
    }
    res.json(prescription);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePrescription = async (req: Request, res: Response) => {
  try {
    const { prescriptionNo } = req.params;
    const updated = await prescriptionService.updatePrescriptionService(
      prescriptionNo,
      req.body,
      req.tokenData?.userId || "system"
    );
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelPrescription = async (req: Request, res: Response) => {
  try {
    const { prescriptionNo } = req.params;
    const cancelled = await prescriptionService.cancelPrescriptionService(
      prescriptionNo,
      req.tokenData?.userId || "system"
    );
    res.json(cancelled);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const sendPrescriptionEmailHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { prescriptionNo } = req.params;
    const userId = req.tokenData?.userId || "system";

    // Use the imported service
    const result = await prescriptionService.sendPrescriptionEmailService(
      prescriptionNo,
      userId
    );

    res.json({
      success: true,
      message: "Prescription sent successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
