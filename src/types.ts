export type Role = "Dev" | "Admin" | "Pilote" | "Co-Pilote" | "Helper";
export type ColorGroup = "Red" | "Green" | "Yellow" | "Blue";

export interface User {
  id: string;
  name: string;
  role: Role;
  color_group: ColorGroup | null;
  pinCode: string; // 4-digit security PIN (Dev master default: "1926")
  pin?: string; // alias for backwards-compatibility
}

export interface QualificationProgress {
  consecutive_weeks: number; // 0 to 3
  recited_astronaut_verse: boolean; // 2 Timothée 2:16
  recited_motto: boolean; // Devise des Astronautes
  recited_nt_books: boolean; // 27 Livres du Nouveau Testament
}

export interface Child {
  id: string;
  first_name: string;
  last_name: string;
  color_group: ColorGroup;
  status: "Recruit" | "Qualified Astronaute";
  qualification_progress: QualificationProgress;
  current_rank: string; // Default: "Recruit" or "Astronaute"
  total_accumulated_points: number;
}

export interface DailyGrading {
  id: string;
  child_id: string;
  date: string; // ISO Date YYYY-MM-DD
  recorded_by: string;
  presence: boolean; // 30 pts
  punctuality: boolean; // 40 pts
  good_behavior: boolean; // 40 pts
  verse_of_the_day: boolean; // 40 pts
  bible: boolean; // 50 pts
  cleanliness: boolean; // 30 pts
  scarf: boolean; // 20 pts
  visitors_count: number; // 25 pts each
  total_day_points: number; // Calculated automatically (max 250+ pts)
}

export interface Attendance {
  id: string;
  child_id: string;
  date: string;
  status: "Present" | "Absent";
  recorded_by_user_id: string;
}

export interface MonthlyReport {
  id: string;
  color_group: ColorGroup;
  month_year: string;
  content: string;
  status: "Draft" | "Submitted" | "Reviewed";
}

export interface RankDefinition {
  points: number;
  title: string;
  verse: string;
  verseDescription?: string;
}
