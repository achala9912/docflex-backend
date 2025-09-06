import { Request, Response } from "express";
import * as medicalCenterService from "../services/medicalCenter.service";


export const createMedicalCenter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const createdBy = req.tokenData?.userId || "system";
    const center = await medicalCenterService.createCenter(req.body, createdBy);
    res.status(201).json(center);
  } catch (error) {
    console.error("❌ Failed to create medical center:", error);
    res.status(400).json({
      error: error instanceof Error ? error.message : "Creation failed",
    });
  }
};


export const getAllMedicalCenters = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const result = await medicalCenterService.getAllCenters({
      page: Number(page),
      limit: Number(limit),
      search: String(search),
      tokenData: req.tokenData
        ? {
            role: req.tokenData.role,
            centerId: req.tokenData.centerId?.toString(),
          }
        : { role: "SystemAdmin" },
    });

    res.json(result);
  } catch (error) {
    console.error("❌ Failed to fetch medical centers:", error);
    res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to retrieve centers",
    });
  }
};

export const getMedicalCenterById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const center = await medicalCenterService.getCenterById(
      req.params.centerId
    );

    if (!center) {
      res.status(404).json({ error: "Medical center not found" });
      return;
    }

    res.json(center);
  } catch (error) {
    console.error("❌ Failed to fetch medical center:", error);
    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to retrieve medical center",
    });
  }
};


export const updateMedicalCenter = async (
  req: Request,
  res: Response
): Promise<void> => {
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
      error: error instanceof Error ? error.message : "Update failed",
    });
  }
};


export const deleteMedicalCenter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { centerId } = req.params;
    const deletedBy = req.body.deletedBy || "system";

    const result = await medicalCenterService.deleteCenter(centerId, deletedBy);

    if (!result.success) {
      res.status(404).json({ error: "Medical center not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("❌ Failed to delete medical center:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Delete failed",
    });
  }
};

export const getCentersForSuggestionController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { search } = req.query;

    const centers = await medicalCenterService.getCentersForSuggestion({
      search: search as string,
    });

    // return only _id, centerId, centerName
    const formatted = centers.map((c) => ({
      _id: c._id,
      centerId: c.centerId,
      centerName: c.centerName,
    }));

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Error in getCentersForSuggestionController:", error);

    res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch center suggestions",
    });
  }
};
