import cron from "node-cron";
import Session from "../models/session.model";
import { ACTIONS } from "../constants/modification-history.constant";

// Runs every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  try {
    const now = new Date();

    const expiredSessions = await Session.find({
      endTime: { $lt: now },
      isSessionActive: true,
    });

    for (const session of expiredSessions) {
      session.isSessionActive = false;
      session.modificationHistory.push({
        action: ACTIONS.DEACTIVATE,
        modifiedBy: "system", 
        date: new Date(),
      });
      await session.save();
      console.log(`Session ${session.sessionId} automatically deactivated`);
    }

    if (expiredSessions.length === 0) {
      console.log("No sessions to deactivate at this time");
    }
  } catch (error) {
    console.error("Error deactivating expired sessions:", error);
  }
});
