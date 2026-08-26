import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index.ts";
import { users, children, dailyGradings, attendances, monthlyReports } from "./src/db/schema.ts";
import { eq } from "drizzle-orm";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initial base users (Leaders with default PINs)
  const defaultBaseUsers = [
    { id: "user_dev_1", name: "Justin (Dev)", role: "Dev", color_group: null, pinCode: "1926" },
    { id: "user_admin_1", name: "Pasteur Admin", role: "Admin", color_group: null, pinCode: "0000" },
    { id: "user_pilote_red", name: "Sarah (Pilote)", role: "Pilote", color_group: "Red", pinCode: "1001" },
    { id: "user_pilote_green", name: "David (Pilote)", role: "Pilote", color_group: "Green", pinCode: "1002" },
    { id: "user_pilote_yellow", name: "Esther (Pilote)", role: "Pilote", color_group: "Yellow", pinCode: "1003" },
    { id: "user_pilote_blue", name: "Samuel (Pilote)", role: "Pilote", color_group: "Blue", pinCode: "1004" },
    { id: "user_copilote_red", name: "Marc (Co-Pilote)", role: "Co-Pilote", color_group: "Red", pinCode: "2001" },
    { id: "user_copilote_green", name: "Léa (Co-Pilote)", role: "Co-Pilote", color_group: "Green", pinCode: "2002" },
    { id: "user_copilote_yellow", name: "Daniel (Co-Pilote)", role: "Co-Pilote", color_group: "Yellow", pinCode: "2003" },
    { id: "user_copilote_blue", name: "Ruth (Co-Pilote)", role: "Co-Pilote", color_group: "Blue", pinCode: "2004" },
  ];

  // Seed default admin/pilote user accounts if users table is empty
  try {
    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      for (const u of defaultBaseUsers) {
        await db.insert(users).values(u);
      }
    }
  } catch (err) {
    console.error("Error checking/seeding default users:", err);
  }

  // --- API Routes ---

  // Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", database: "connected" });
  });

  // USERS API
  app.get("/api/users", async (_req: Request, res: Response) => {
    try {
      const allUsers = await db.select().from(users);
      res.json(allUsers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const user = req.body;
      const inserted = await db.insert(users).values(user).returning();
      res.json(inserted[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/users/:id/pin", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { pinCode } = req.body;
      const updated = await db.update(users).set({ pinCode }).where(eq(users.id, id)).returning();
      res.json(updated[0]);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(users).where(eq(users.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // CHILDREN API (Fresh, real data)
  app.get("/api/children", async (_req: Request, res: Response) => {
    try {
      const allKids = await db.select().from(children);
      const mapped = allKids.map(k => ({
        id: k.id,
        first_name: k.firstName,
        last_name: k.lastName,
        color_group: k.colorGroup,
        status: k.status,
        qualification_progress: k.qualificationProgress,
        current_rank: k.currentRank,
        total_accumulated_points: k.totalAccumulatedPoints,
      }));
      res.json(mapped);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/children", async (req: Request, res: Response) => {
    try {
      const child = req.body;
      const inserted = await db.insert(children).values({
        id: child.id,
        firstName: child.first_name,
        lastName: child.last_name,
        colorGroup: child.color_group,
        status: child.status || "Recruit",
        qualificationProgress: child.qualification_progress || {
          consecutive_weeks: 0,
          recited_astronaut_verse: false,
          recited_motto: false,
          recited_nt_books: false,
        },
        currentRank: child.current_rank || "Recruit",
        totalAccumulatedPoints: child.total_accumulated_points || 0,
      }).returning();
      
      const k = inserted[0];
      res.json({
        id: k.id,
        first_name: k.firstName,
        last_name: k.lastName,
        color_group: k.colorGroup,
        status: k.status,
        qualification_progress: k.qualificationProgress,
        current_rank: k.currentRank,
        total_accumulated_points: k.totalAccumulatedPoints,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/children/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const child = req.body;
      const updateData: any = {};
      if (child.first_name !== undefined) updateData.firstName = child.first_name;
      if (child.last_name !== undefined) updateData.lastName = child.last_name;
      if (child.color_group !== undefined) updateData.colorGroup = child.color_group;
      if (child.status !== undefined) updateData.status = child.status;
      if (child.qualification_progress !== undefined) updateData.qualificationProgress = child.qualification_progress;
      if (child.current_rank !== undefined) updateData.currentRank = child.current_rank;
      if (child.total_accumulated_points !== undefined) updateData.totalAccumulatedPoints = child.total_accumulated_points;

      const updated = await db.update(children).set(updateData).where(eq(children.id, id)).returning();
      const k = updated[0];
      res.json({
        id: k.id,
        first_name: k.firstName,
        last_name: k.lastName,
        color_group: k.colorGroup,
        status: k.status,
        qualification_progress: k.qualificationProgress,
        current_rank: k.currentRank,
        total_accumulated_points: k.totalAccumulatedPoints,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/children/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(children).where(eq(children.id, id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DAILY GRADINGS API
  app.get("/api/gradings", async (_req: Request, res: Response) => {
    try {
      const allGradings = await db.select().from(dailyGradings);
      const mapped = allGradings.map(g => ({
        id: g.id,
        child_id: g.childId,
        date: g.date,
        recorded_by: g.recordedBy,
        presence: g.presence,
        punctuality: g.punctuality,
        good_behavior: g.goodBehavior,
        verse_of_the_day: g.verseOfTheDay,
        bible: g.bible,
        cleanliness: g.cleanliness,
        scarf: g.scarf,
        visitors_count: g.visitorsCount,
        total_day_points: g.totalDayPoints,
      }));
      res.json(mapped);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/gradings", async (req: Request, res: Response) => {
    try {
      const g = req.body;
      const existing = await db.select().from(dailyGradings).where(eq(dailyGradings.id, g.id));
      if (existing.length > 0) {
        const updated = await db.update(dailyGradings).set({
          presence: g.presence,
          punctuality: g.punctuality,
          goodBehavior: g.good_behavior,
          verseOfTheDay: g.verse_of_the_day,
          bible: g.bible,
          cleanliness: g.cleanliness,
          scarf: g.scarf,
          visitorsCount: g.visitors_count || 0,
          totalDayPoints: g.total_day_points || 0,
        }).where(eq(dailyGradings.id, g.id)).returning();
        const r = updated[0];
        res.json({
          id: r.id,
          child_id: r.childId,
          date: r.date,
          recorded_by: r.recordedBy,
          presence: r.presence,
          punctuality: r.punctuality,
          good_behavior: r.goodBehavior,
          verse_of_the_day: r.verseOfTheDay,
          bible: r.bible,
          cleanliness: r.cleanliness,
          scarf: r.scarf,
          visitors_count: r.visitorsCount,
          total_day_points: r.totalDayPoints,
        });
      } else {
        const inserted = await db.insert(dailyGradings).values({
          id: g.id,
          childId: g.child_id,
          date: g.date,
          recordedBy: g.recorded_by,
          presence: g.presence,
          punctuality: g.punctuality,
          goodBehavior: g.good_behavior,
          verseOfTheDay: g.verse_of_the_day,
          bible: g.bible,
          cleanliness: g.cleanliness,
          scarf: g.scarf,
          visitorsCount: g.visitors_count || 0,
          totalDayPoints: g.total_day_points || 0,
        }).returning();
        const r = inserted[0];
        res.json({
          id: r.id,
          child_id: r.childId,
          date: r.date,
          recorded_by: r.recordedBy,
          presence: r.presence,
          punctuality: r.punctuality,
          good_behavior: r.goodBehavior,
          verse_of_the_day: r.verseOfTheDay,
          bible: r.bible,
          cleanliness: r.cleanliness,
          scarf: r.scarf,
          visitors_count: r.visitorsCount,
          total_day_points: r.totalDayPoints,
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ATTENDANCES API
  app.get("/api/attendances", async (_req: Request, res: Response) => {
    try {
      const all = await db.select().from(attendances);
      res.json(all.map(a => ({
        id: a.id,
        child_id: a.childId,
        date: a.date,
        status: a.status,
        recorded_by_user_id: a.recordedByUserId,
      })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/attendances", async (req: Request, res: Response) => {
    try {
      const a = req.body;
      const inserted = await db.insert(attendances).values({
        id: a.id,
        childId: a.child_id,
        date: a.date,
        status: a.status,
        recordedByUserId: a.recorded_by_user_id,
      }).returning();
      const r = inserted[0];
      res.json({
        id: r.id,
        child_id: r.childId,
        date: r.date,
        status: r.status,
        recorded_by_user_id: r.recordedByUserId,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // MONTHLY REPORTS API
  app.get("/api/reports", async (_req: Request, res: Response) => {
    try {
      const all = await db.select().from(monthlyReports);
      res.json(all.map(r => ({
        id: r.id,
        color_group: r.colorGroup,
        month_year: r.monthYear,
        content: r.content,
        status: r.status,
      })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/reports", async (req: Request, res: Response) => {
    try {
      const r = req.body;
      const existing = await db.select().from(monthlyReports).where(eq(monthlyReports.id, r.id));
      if (existing.length > 0) {
        const updated = await db.update(monthlyReports).set({
          content: r.content,
          status: r.status,
        }).where(eq(monthlyReports.id, r.id)).returning();
        const rep = updated[0];
        res.json({
          id: rep.id,
          color_group: rep.colorGroup,
          month_year: rep.monthYear,
          content: rep.content,
          status: rep.status,
        });
      } else {
        const inserted = await db.insert(monthlyReports).values({
          id: r.id,
          colorGroup: r.color_group,
          monthYear: r.month_year,
          content: r.content || "",
          status: r.status || "Draft",
        }).returning();
        const rep = inserted[0];
        res.json({
          id: rep.id,
          color_group: rep.colorGroup,
          month_year: rep.monthYear,
          content: rep.content,
          status: rep.status,
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // RESET / PURGE DATABASE ACTION (Dev only)
  app.post("/api/reset", async (_req: Request, res: Response) => {
    try {
      await db.delete(dailyGradings);
      await db.delete(attendances);
      await db.delete(children);
      await db.delete(monthlyReports);
      await db.delete(users);

      for (const u of defaultBaseUsers) {
        await db.insert(users).values(u);
      }
      res.json({ success: true, message: "Database reset to clean state with default leader accounts." });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
