import { createContext, useContext, useState, ReactNode } from 'react';
import { User, Child, Attendance, MonthlyReport } from './types';
import { initialUsers, initialChildren, initialAttendances, initialReports } from './mockData';

interface AppState {
  users: User[];
  children: Child[];
  attendances: Attendance[];
  reports: MonthlyReport[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users] = useState<User[]>(initialUsers);
  const [kids] = useState<Child[]>(initialChildren);
  const [attendances] = useState<Attendance[]>(initialAttendances);
  const [reports] = useState<MonthlyReport[]>(initialReports);
  
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]);
  const [activeTab, setActiveTab] = useState<string>("Users");

  return (
    <AppContext.Provider value={{ 
      users, 
      children: kids, 
      attendances, 
      reports, 
      currentUser, 
      setCurrentUser,
      activeTab,
      setActiveTab
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
