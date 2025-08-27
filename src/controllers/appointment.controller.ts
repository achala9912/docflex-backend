import { Request, Response } from "express";
import * as AppointmentService from "../services/appointment.service";
import { IAppointment } from "../interfaces/appointment.interface";
import { ACTIONS } from "../constants/modification-history.constant";
export const createAppointmentHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const createdBy = req.tokenData?.userId || "system";
    const appointment = await AppointmentService.createAppointment(
      req.body,
      createdBy
    );

    res.status(201).json({
      success: true,
      data: appointment,
      message: "Appointment created successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAppointmentHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const appointment = await AppointmentService.getAppointmentById(
      req.params.id // here, "id" is appointmentId, not Mongo _id
    );

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllAppointmentsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, search, centerId, isPatientvisited } = req.query;

    const result = await AppointmentService.getAllAppointments({
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
      search: search as string,
      centerId: centerId as string,
      isPatientvisited:
        typeof isPatientvisited !== "undefined"
          ? isPatientvisited === "true"
          : undefined,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      limit: result.limit,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelAppointmentHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const cancelledBy = req.tokenData?.userId || "system";
    const appointment = await AppointmentService.cancelAppointment(
      req.params.id,
      cancelledBy
    );

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: appointment,
      message: "Appointment cancelled successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateAppointmentStatusHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { isPatientvisited, isCancelled } = req.body;
    const modifiedBy = req.tokenData?.userId || "system";

    const appointment = await AppointmentService.updateAppointmentStatus(
      req.params.id,
      { isPatientvisited, isCancelled },
      modifiedBy
    );

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: appointment,
      message: "Appointment status updated successfully",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getActiveSessionAppointmentsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const centerId = req.params.centerId;
    const result = await AppointmentService.getActiveSessionAppointments(
      centerId
    );

    if (!result) {
      res.status(404).json({
        success: false,
        message: "No active session found for this center",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSessionAppointmentsHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sessionId = req.params.sessionId;
    const appointments = await AppointmentService.getCurrentSessionAppointments(
      sessionId
    );

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markAsVisitedHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const modifiedBy = req.tokenData?.userId || "system";
    const appointment = await AppointmentService.updateAppointmentStatus(
      req.params.id,
      { isPatientvisited: true },
      modifiedBy
    );

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: appointment,
      message: "Appointment marked as visited",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getActiveSessionPatientVisitedAppointmentHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { date, search, page, limit, centerId } = req.query;

    if (!centerId) {
      res.status(400).json({
        success: false,
        message: "centerId is required",
      });
      return;
    }

    const result =
      await AppointmentService.getActiveSessionPatientVisitedAppointment({
        date: date as string,
        centerId: centerId as string,
        search: search as string,
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 10,
      });

    // ✅ Always success, even if result.data = []
    res.status(200).json({
      success: true,
      data: result.data,
      total: result.total,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      limit: result.limit,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
