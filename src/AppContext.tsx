import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User, Child, Attendance, MonthlyReport, DailyGrading, QualificationProgress } from './types';
import { initialUsers, initialChildren, initialAttendances, initialReports, initialGradings } from './mockData';
import { calculateDailyPoints, isRecruitFullyQualified } from './constants/ranks';
import { getColorGroupLabel, getRoleLabel, getStatusLabel } from './utils';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppState {
  users: User[];
  children: Child[];
  attendances: Attendance[];
  reports: MonthlyReport[];
  gradings: DailyGrading[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toasts: Toast[];
  addToast: (type: 'success' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;
  
  // Gemini AI Assistant State
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  isAiAssistantOpen: boolean;
  setIsAiAssistantOpen: (open: boolean) => void;

  // PIN Security & Session State
  isLocked: boolean;
  lockSession: (reason?: string) => void;
  unlockSession: (userId: string, pin: string) => { success: boolean; error?: string };
  updateUserPin: (userId: string, newPin: string) => boolean;
  generateRandomPin: () => string;
  
  // Astronaut Operations
  saveDailyGrading: (grading: Partial<DailyGrading> & { child_id: string; date: string }) => void;
  updateRecruitProgress: (childId: string, progressUpdates: Partial<QualificationProgress>) => void;
  promoteChildRank: (childId: string, newRank: string) => void;
  addChild: (childData: Omit<Child, 'id'>) => void;
  addUser: (userData: Omit<User, 'id'>) => void;
  updateReportStatus: (reportId: string, status: "Draft" | "Submitted" | "Reviewed") => void;
  saveMonthlyReport: (report: Partial<MonthlyReport> & { color_group: any; month_year: string; content: string }) => void;
  resetDatabase: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes of inactivity auto-lock

export function AppProvider({ children: reactChildren }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [kids, setKids] = useState<Child[]>(initialChildren);
  const [attendances, setAttendances] = useState<Attendance[]>(initialAttendances);
  const [reports, setReports] = useState<MonthlyReport[]>(initialReports);
  const [gradings, setGradings] = useState<DailyGrading[]>(initialGradings);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[2]); // Default to Pilote Peter for immediate testing
  const [activeTab, setActiveTab] = useState<string>("Daily Grading");

  // PIN Lock & Security
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>(() => {
    try {
      return localStorage.getItem('astronautes_gemini_api_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
    } catch {
      return '';
    }
  });

  const setGeminiApiKey = (key: string) => {
    const trimmed = key.trim();
    setGeminiApiKeyState(trimmed);
    try {
      if (trimmed) {
        localStorage.setItem('astronautes_gemini_api_key', trimmed);
      } else {
        localStorage.removeItem('astronautes_gemini_api_key');
      }
    } catch (e) {
      console.warn('Failed to save api key to localStorage:', e);
    }
  };

  const addToast = (type: 'success' | 'info' | 'warning', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 15-minute Inactivity Tracking
  const lockSession = (reason?: string) => {
    setIsLocked(true);
    if (reason === 'inactivity') {
      addToast('info', 'Session Verrouillée', 'Verrouillage automatique après 15 minutes d\'inactivité.');
    }
  };

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    // Only arm inactivity timer if not already locked
    if (!isLocked) {
      inactivityTimerRef.current = setTimeout(() => {
        lockSession('inactivity');
      }, INACTIVITY_TIMEOUT_MS);
    }
  };

  useEffect(() => {
    resetInactivityTimer();

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    activityEvents.forEach(evt => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      activityEvents.forEach(evt => {
        window.removeEventListener(evt, handleUserActivity);
      });
    };
  }, [isLocked]);

  // Unlocks session using 4-digit PIN
  const unlockSession = (userId: string, pin: string): { success: boolean; error?: string } => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      return { success: false, error: "Utilisateur non trouvé." };
    }

    // Dev master PIN is always accepted for Dev or as master override
    const isMasterDevPin = pin === '1926';
    const isCorrectUserPin = targetUser.pin === pin;

    if (isCorrectUserPin || (targetUser.role === 'Dev' && isMasterDevPin)) {
      setCurrentUser(targetUser);
      setIsLocked(false);
      
      // Navigate to corresponding tab if not set
      if (targetUser.role === 'Dev' && activeTab !== 'Users' && activeTab !== 'Logs' && activeTab !== 'Leaderboard') {
        setActiveTab('Users');
      } else if (targetUser.role === 'Admin' && activeTab !== 'Overview' && activeTab !== 'Reports' && activeTab !== 'Roster' && activeTab !== 'Leaderboard') {
        setActiveTab('Overview');
      }

      addToast('success', 'Session Déverrouillée', `Bienvenue, ${targetUser.name} (${getRoleLabel(targetUser.role)}) !`);
      return { success: true };
    }

    return { success: false, error: "Code PIN incorrect." };
  };

  // Developer-exclusive PIN Update / Reset
  const updateUserPin = (userId: string, newPin: string): boolean => {
    if (!/^\d{4}$/.test(newPin)) {
      addToast('warning', 'Format PIN Invalide', 'Le code PIN doit comporter exactement 4 chiffres.');
      return false;
    }

    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return false;

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, pin: newPin } : u));
    addToast('success', 'Code PIN Mis à Jour', `Nouveau PIN (${newPin}) enregistré pour ${targetUser.name}.`);
    return true;
  };

  const generateRandomPin = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const saveDailyGrading = (gradingInput: Partial<DailyGrading> & { child_id: string; date: string }) => {
    const calculatedPoints = calculateDailyPoints(gradingInput);
    const gradingRecord: DailyGrading = {
      id: gradingInput.id || `g-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      child_id: gradingInput.child_id,
      date: gradingInput.date,
      recorded_by: currentUser.name,
      presence: Boolean(gradingInput.presence),
      punctuality: Boolean(gradingInput.punctuality),
      good_behavior: Boolean(gradingInput.good_behavior),
      verse_of_the_day: Boolean(gradingInput.verse_of_the_day),
      bible: Boolean(gradingInput.bible),
      cleanliness: Boolean(gradingInput.cleanliness),
      scarf: Boolean(gradingInput.scarf),
      visitors_count: Number(gradingInput.visitors_count || 0),
      total_day_points: calculatedPoints,
    };

    // 1. Update gradings list
    setGradings(prev => {
      const existingIdx = prev.findIndex(g => g.child_id === gradingRecord.child_id && g.date === gradingRecord.date);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = gradingRecord;
        return next;
      }
      return [gradingRecord, ...prev];
    });

    // 2. Update attendance record accordingly
    setAttendances(prev => {
      const existingIdx = prev.findIndex(a => a.child_id === gradingRecord.child_id && a.date === gradingRecord.date);
      const newAttendanceStatus = gradingRecord.presence ? 'Present' : 'Absent';
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = {
          ...next[existingIdx],
          status: newAttendanceStatus,
          recorded_by_user_id: currentUser.id,
        };
        return next;
      }
      return [
        {
          id: `a-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          child_id: gradingRecord.child_id,
          date: gradingRecord.date,
          status: newAttendanceStatus,
          recorded_by_user_id: currentUser.id,
        },
        ...prev,
      ];
    });

    // 3. Update Child points
    setKids(prevKids => {
      return prevKids.map(child => {
        if (child.id !== gradingRecord.child_id) return child;

        // Recalculate total points by summing all gradings for this child
        // including this new/updated grading
        const otherGradings = gradings.filter(g => g.child_id === child.id && g.date !== gradingRecord.date);
        const allChildGradings = [gradingRecord, ...otherGradings];
        const newTotalPoints = allChildGradings.reduce((sum, g) => sum + g.total_day_points, 0);

        // If recruit and present, we can also advance attendance progress
        let newProgress = { ...child.qualification_progress };
        if (child.status === 'Recruit' && gradingRecord.presence) {
          // If consecutively present, ensure at least 1 week recorded
          if (newProgress.consecutive_weeks < 3) {
            newProgress.consecutive_weeks = Math.min(3, newProgress.consecutive_weeks + 1);
          }
        }

        const isNowQualified = child.status === 'Recruit' && isRecruitFullyQualified(newProgress);

        return {
          ...child,
          total_accumulated_points: newTotalPoints,
          qualification_progress: newProgress,
          status: isNowQualified ? 'Qualified Astronaute' : child.status,
          current_rank: (isNowQualified && child.current_rank === 'Recruit') ? 'Astronaute' : child.current_rank,
        };
      });
    });

    const targetChild = kids.find(k => k.id === gradingRecord.child_id);
    addToast('success', 'Évaluation Enregistrée', `${calculatedPoints} pts enregistrés pour ${targetChild ? targetChild.first_name : 'l\'enfant'}.`);
  };

  const updateRecruitProgress = (childId: string, progressUpdates: Partial<QualificationProgress>) => {
    setKids(prevKids => {
      return prevKids.map(child => {
        if (child.id !== childId) return child;

        const updatedProgress = {
          ...child.qualification_progress,
          ...progressUpdates,
        };

        const isQualified = isRecruitFullyQualified(updatedProgress);
        const newStatus = isQualified ? 'Qualified Astronaute' : child.status;
        const newRank = (isQualified && child.current_rank === 'Recruit') ? 'Astronaute' : child.current_rank;

        return {
          ...child,
          qualification_progress: updatedProgress,
          status: newStatus,
          current_rank: newRank,
        };
      });
    });

    const targetChild = kids.find(k => k.id === childId);
    addToast('info', 'Progression Mise à Jour', `Progression de qualification mise à jour pour ${targetChild?.first_name}.`);
  };

  const promoteChildRank = (childId: string, newRank: string) => {
    setKids(prevKids => {
      return prevKids.map(child => {
        if (child.id !== childId) return child;
        return {
          ...child,
          current_rank: newRank,
          status: child.status === 'Recruit' ? 'Qualified Astronaute' : child.status,
        };
      });
    });

    const targetChild = kids.find(k => k.id === childId);
    addToast('success', 'Promotion Confirmée ! 🚀', `${targetChild?.first_name} ${targetChild?.last_name} a officiellement été promu au rang "${newRank}" !`);
  };

  const addChild = (childData: Omit<Child, 'id'>) => {
    const newChild: Child = {
      ...childData,
      id: `c-${Date.now()}`,
    };
    setKids(prev => [...prev, newChild]);
    addToast('success', 'Enfant Inscrit', `${newChild.first_name} ${newChild.last_name} a été ajouté au Groupe ${getColorGroupLabel(newChild.color_group)}.`);
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
      pin: userData.pin || generateRandomPin(),
    };
    setUsers(prev => [...prev, newUser]);
    addToast('success', 'Utilisateur Créé', `${newUser.name} ajouté avec le rôle ${getRoleLabel(newUser.role)} (PIN: ${newUser.pin}).`);
  };

  const updateReportStatus = (reportId: string, status: "Draft" | "Submitted" | "Reviewed") => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
    addToast('info', 'Rapport Mis à Jour', `Le statut du rapport est passé à "${getStatusLabel(status)}".`);
  };

  const saveMonthlyReport = (report: Partial<MonthlyReport> & { color_group: any; month_year: string; content: string }) => {
    setReports(prev => {
      const idx = prev.findIndex(r => r.color_group === report.color_group && r.month_year === report.month_year);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...report, status: report.status || 'Submitted' };
        return updated;
      }
      return [
        {
          id: `r-${Date.now()}`,
          color_group: report.color_group,
          month_year: report.month_year,
          content: report.content,
          status: report.status || 'Submitted',
        },
        ...prev,
      ];
    });
    addToast('success', 'Rapport Enregistré', `Rapport mensuel pour le Groupe ${getColorGroupLabel(report.color_group)} soumis avec succès.`);
  };

  const resetDatabase = () => {
    setUsers(initialUsers);
    setKids(initialChildren);
    setAttendances(initialAttendances);
    setReports(initialReports);
    setGradings(initialGradings);
    setIsLocked(false);
    addToast('info', 'Base de Données Réinitialisée', 'Système rechargé avec les données et schémas mock par défaut.');
  };

  return (
    <AppContext.Provider value={{ 
      users, 
      children: kids, 
      attendances, 
      reports, 
      gradings,
      currentUser, 
      setCurrentUser,
      activeTab,
      setActiveTab,
      toasts,
      addToast,
      removeToast,
      geminiApiKey,
      setGeminiApiKey,
      isAiAssistantOpen,
      setIsAiAssistantOpen,
      isLocked,
      lockSession,
      unlockSession,
      updateUserPin,
      generateRandomPin,
      saveDailyGrading,
      updateRecruitProgress,
      promoteChildRank,
      addChild,
      addUser,
      updateReportStatus,
      saveMonthlyReport,
      resetDatabase,
    }}>
      {reactChildren}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
