import { pgTable, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'Dev' | 'Admin' | 'Pilote' | 'Co-Pilote' | 'Helper'
  color_group: text("color_group"), // 'Red' | 'Green' | 'Yellow' | 'Blue' | null
  pinCode: text("pin_code").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const children = pgTable("children", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  colorGroup: text("color_group").notNull(),
  status: text("status").notNull().default("Recruit"), // 'Recruit' | 'Qualified Astronaute'
  qualificationProgress: jsonb("qualification_progress").notNull().default({
    consecutive_weeks: 0,
    recited_astronaut_verse: false,
    recited_motto: false,
    recited_nt_books: false,
  }),
  currentRank: text("current_rank").notNull().default("Recruit"),
  totalAccumulatedPoints: integer("total_accumulated_points").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailyGradings = pgTable("daily_gradings", {
  id: text("id").primaryKey(),
  childId: text("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD
  recordedBy: text("recorded_by").notNull(),
  presence: boolean("presence").notNull().default(false),
  punctuality: boolean("punctuality").notNull().default(false),
  goodBehavior: boolean("good_behavior").notNull().default(false),
  verseOfTheDay: boolean("verse_of_the_day").notNull().default(false),
  bible: boolean("bible").notNull().default(false),
  cleanliness: boolean("cleanliness").notNull().default(false),
  scarf: boolean("scarf").notNull().default(false),
  visitorsCount: integer("visitors_count").notNull().default(0),
  totalDayPoints: integer("total_day_points").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attendances = pgTable("attendances", {
  id: text("id").primaryKey(),
  childId: text("child_id").notNull().references(() => children.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  status: text("status").notNull(), // 'Present' | 'Absent'
  recordedByUserId: text("recorded_by_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const monthlyReports = pgTable("monthly_reports", {
  id: text("id").primaryKey(),
  colorGroup: text("color_group").notNull(),
  monthYear: text("month_year").notNull(), // YYYY-MM
  content: text("content").notNull().default(""),
  status: text("status").notNull().default("Draft"), // 'Draft' | 'Submitted' | 'Reviewed'
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
