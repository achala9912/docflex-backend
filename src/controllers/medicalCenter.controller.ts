import { Request, Response } from "express";
import medicalCenterService from "../services/medicalCenter.service";

class MedicalCenterController {
  async createMedicalCenter(req: Request, res: Response): Promise<void> {
    try {
      const createdBy = req.tokenData?.userId || "system";
      const center = await medicalCenterService.createCenter(
        req.body,
        createdBy
      );
      res.status(201).json(center);
    } catch (error) {
      console.error("❌ Failed to create medical center:", error);
      res
        .status(400)
        .json({ error: (error as Error).message || "Creation failed" });
    }
  }

  async getAllMedicalCenters(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;

      const result = await medicalCenterService.getAllCenters({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
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
      res.status(500).json({ error: "Failed to retrieve centers" });
    }
  }
  async getMedicalCenterById(req: Request, res: Response): Promise<void> {
    try {
      const centerId = req.params.centerId;
      const center = await medicalCenterService.getCenterById(centerId);

      if (!center) {
        res.status(404).json({ error: "Medical center not found" });
        return;
      }

      res.status(200).json(center);
    } catch (error) {
      console.error("❌ Failed to fetch medical center:", error);
      res.status(500).json({ error: "Failed to retrieve medical center" });
    }
  }

  async updateMedicalCenter(req: Request, res: Response): Promise<void> {
    try {
      const centerId = req.params.centerId;
      const modifiedBy = req.tokenData?.userId || "system";

      const updated = await medicalCenterService.updateCenter(
        centerId,
        req.body,
        modifiedBy
      );

      if (!updated) {
        res.status(404).json({ error: "Medical center not found" });
        return;
      }

      res.json(updated);
    } catch (error) {
      console.error("❌ Failed to update medical center:", error);
      res.status(400).json({ error: "Update failed" });
    }
  }

  async deleteMedicalCenter(req: Request, res: Response): Promise<void> {
    try {
      const centerId = req.params.centerId;
      const deletedBy = req.tokenData?.userId || "system";

      await medicalCenterService.deleteCenter(centerId, deletedBy);
      res.status(204).send();
    } catch (error) {
      console.error("❌ Failed to delete medical center:", error);
      res.status(500).json({ error: "Delete failed" });
    }
  }
}

export default new MedicalCenterController();
