export interface UserRecord {
  id: string;
  name: string;
  role: string;
  color_group: string | null;
  pinCode: string;
  createdAt: string;
}

export interface ChildRecord {
  id: string;
  firstName: string;
  lastName: string;
  colorGroup: string;
  status: string;
  qualificationProgress: Record<string, unknown>;
  currentRank: string;
  totalAccumulatedPoints: number;
  createdAt: string;
}

export interface DailyGradingRecord {
  id: string;
  childId: string;
  date: string;
  recordedBy: string;
  presence: boolean;
  punctuality: boolean;
  goodBehavior: boolean;
  verseOfTheDay: boolean;
  bible: boolean;
  cleanliness: boolean;
  scarf: boolean;
  visitorsCount: number;
  totalDayPoints: number;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  childId: string;
  date: string;
  status: string;
  recordedByUserId: string;
  createdAt: string;
}

export interface MonthlyReportRecord {
  id: string;
  colorGroup: string;
  monthYear: string;
  content: string;
  status: string;
  updatedAt: string;
}
