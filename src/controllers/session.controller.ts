import { Request, Response, NextFunction } from "express";
import * as sessionService from "../services/session.service";

export const createSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const createdBy = req.tokenData?.userId || "system";
    const session = await sessionService.createSession(req.body, createdBy);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

export const getSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await sessionService.getSessionById(req.params.sessionId);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const getAllSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      centerId,
      isActive,
      includeDeleted,
    } = req.query;

    const result = await sessionService.getAllSessions({
      page: Number(page),
      limit: Number(limit),
      search: String(search),
      centerId: centerId?.toString(),
      isActive:
        isActive === "true" ? true : isActive === "false" ? false : undefined,
      includeDeleted: includeDeleted === "true",
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const modifiedBy = req.tokenData?.userId || "system";
    const updatedSession = await sessionService.updateSession(
      req.params.sessionId,
      req.body,
      modifiedBy
    );

    if (!updatedSession) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    res.json(updatedSession);
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deletedBy = req.tokenData?.userId || "system";
    const result = await sessionService.deleteSession(
      req.params.sessionId,
      deletedBy
    );

    if (!result) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const toggleSessionActive = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const modifiedBy = req.tokenData?.userId || "system";
    const { isActive } = req.body;
    const session = await sessionService.toggleSessionActive(
      req.params.sessionId,
      isActive,
      modifiedBy
    );

    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
};
