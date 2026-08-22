export type Role = "Dev" | "Admin" | "Pilote" | "Co-Pilote" | "Helper";
export type ColorGroup = "Red" | "Green" | "Yellow" | "Blue";

export interface User {
  id: string;
  name: string;
  role: Role;
  color_group: ColorGroup | null;
}

export interface Child {
  id: string;
  first_name: string;
  last_name: string;
  color_group: ColorGroup;
  status: "Active" | "Inactive";
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
