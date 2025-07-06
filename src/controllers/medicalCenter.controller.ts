import { Request, Response } from "express";
import * as medicalCenterService from "../services/medicalCenter.service";

// Create new medical center
export const createMedicalCenter = async (req: Request, res: Response): Promise<void> => {
  try {
    const createdBy = req.tokenData?.userId || "system";
    const center = await medicalCenterService.createCenter(req.body, createdBy);
    res.status(201).json(center);
  } catch (error) {
    console.error("❌ Failed to create medical center:", error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : "Creation failed" 
    });
  }
};

// Get all medical centers with pagination
export const getAllMedicalCenters = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const result = await medicalCenterService.getAllCenters({
      page: Number(page),
      limit: Number(limit),
      search: String(search),
      tokenData: req.tokenData ? {
        role: req.tokenData.role,
        centerId: req.tokenData.centerId?.toString()
      } : { role: "SystemAdmin" }
    });

    res.json(result);
  } catch (error) {
    console.error("❌ Failed to fetch medical centers:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to retrieve centers" 
    });
  }
};

// Get single medical center by ID
export const getMedicalCenterById = async (req: Request, res: Response): Promise<void> => {
  try {
    const center = await medicalCenterService.getCenterById(req.params.centerId);

    if (!center) {
      res.status(404).json({ error: "Medical center not found" });
      return;
    }

    res.json(center);
  } catch (error) {
    console.error("❌ Failed to fetch medical center:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to retrieve medical center" 
    });
  }
};

// Update medical center
export const updateMedicalCenter = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await medicalCenterService.updateCenter(
      req.params.centerId,
      req.body,
      req.tokenData?.userId || "system"
    );

    if (!updated) {
      res.status(404).json({ error: "Medical center not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    console.error("❌ Failed to update medical center:", error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : "Update failed" 
    });
  }
};

// Delete medical center (soft delete)
export const deleteMedicalCenter = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await medicalCenterService.deleteCenter(
      req.params.centerId,
      req.tokenData?.userId || "system"
    );

    if (!deleted) {
      res.status(404).json({ error: "Medical center not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("❌ Failed to delete medical center:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Delete failed" 
    });
  }
};