import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { User, Child, Attendance, MonthlyReport, DailyGrading, QualificationProgress } from './types';
import { calculateDailyPoints, isRecruitFullyQualified, RANK_SYSTEM } from './constants/ranks';
import { getColorGroupLabel, getRoleLabel, getStatusLabel } from './utils';
import { api } from './services/api';

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
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  isAiAssistantOpen: boolean;
  setIsAiAssistantOpen: (open: boolean) => void;
  
  // PIN Lock & Authentication
  isLocked: boolean;
  targetLockUserId: string | null;
  lockReason: string | null;
  lockSession: (targetUserIdOrReason?: string, explicitReason?: string) => void;
  unlockSession: (userId: string, enteredPin: string) => Promise<{ success: boolean; error?: string }>;
  updateUserPin: (userId: string, newPin: string) => Promise<boolean>;
  generateRandomPin: () => string;

  // Business Logic
  saveDailyGrading: (grading: Partial<DailyGrading> & { child_id: string; date: string }) => Promise<void>;
  updateRecruitProgress: (childId: string, progressUpdates: Partial<QualificationProgress>) => Promise<void>;
  promoteChildRank: (childId: string, newRank: string) => Promise<void>;
  addChild: (child: Omit<Child, 'id'>) => Promise<void>;
  deleteChild: (childId: string) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateReportStatus: (reportId: string, status: "Draft" | "Submitted" | "Reviewed") => Promise<void>;
  saveMonthlyReport: (report: Partial<MonthlyReport> & { color_group: any; month_year: string; content: string }) => Promise<void>;
  resetDatabase: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes of inactivity auto-lock

const initialDefaultUsers: User[] = [
  { id: "user_dev_1", name: "Justin (Dev)", role: "Dev", color_group: null },
  { id: "user_admin_1", name: "Pasteur Admin", role: "Admin", color_group: null },
  { id: "user_pilote_red", name: "Sarah (Pilote)", role: "Pilote", color_group: "Red" },
  { id: "user_pilote_green", name: "David (Pilote)", role: "Pilote", color_group: "Green" },
  { id: "user_pilote_yellow", name: "Esther (Pilote)", role: "Pilote", color_group: "Yellow" },
  { id: "user_pilote_blue", name: "Samuel (Pilote)", role: "Pilote", color_group: "Blue" },
];

export function AppProvider({ children: reactChildren }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialDefaultUsers);
  const [kids, setKids] = useState<Child[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [gradings, setGradings] = useState<DailyGrading[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User>(initialDefaultUsers[2]);
  const [activeTab, setActiveTab] = useState<string>("Daily Grading");

  // Fetch initial real data from Cloud SQL / Backend API
  const refreshData = async () => {
    try {
      const [fetchedUsers, fetchedKids, fetchedGradings, fetchedAttendances, fetchedReports] = await Promise.all([
        api.getUsers().catch(() => initialDefaultUsers),
        api.getChildren().catch(() => []),
        api.getGradings().catch(() => []),
        api.getAttendances().catch(() => []),
        api.getReports().catch(() => []),
      ]);

      if (fetchedUsers.length > 0) {
        setUsers(fetchedUsers);
        // Sync currentUser if existing
        setCurrentUser(prev => fetchedUsers.find(u => u.id === prev.id) || fetchedUsers[2] || fetchedUsers[0]);
      }
      setKids(fetchedKids);
      setGradings(fetchedGradings);
      setAttendances(fetchedAttendances);
      setReports(fetchedReports);
    } catch (e) {
      console.error('Error fetching database state:', e);
    }
  };

  useEffect(() => {
    refreshData();
    api.getLoginUsers().then(loginUsers => {
      if (loginUsers.length > 0) setUsers(loginUsers);
    }).catch(() => {
      addToast('warning', 'Serveur indisponible', 'Impossible de charger les profils de connexion.');
    });
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      setIsLocked(true);
      setLockReason('Votre session a expiré. Veuillez vous reconnecter.');
      addToast('warning', 'Session expirée', 'Reconnectez-vous pour continuer.');
    };
    window.addEventListener('astronautes:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('astronautes:auth-expired', handleAuthExpired);
  }, []);

  // PIN Lock & Security (Always land on PIN lock screen on app reload/entry)
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [targetLockUserId, setTargetLockUserId] = useState<string | null>(null);
  const [lockReason, setLockReason] = useState<string | null>(null);
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

  // Secure Role-Guarded Tab Navigation
  const handleSetActiveTab = (tab: string) => {
    if (['Users', 'PINs', 'Logs'].includes(tab) && currentUser.role !== 'Dev') {
      lockSession(undefined, "Accès non autorisé. Le portail Développeur requiert les identifiants Dev.");
      addToast('warning', 'Accès Refusé', 'Portail réservé au Développeur.');
      return;
    }
    if (['Overview', 'Reports', 'Roster'].includes(tab) && currentUser.role !== 'Admin' && currentUser.role !== 'Dev') {
      lockSession(undefined, "Accès non autorisé. La console Administration requiert un compte Administrateur.");
      addToast('warning', 'Accès Refusé', 'Section réservée aux Administrateurs.');
      return;
    }
    setActiveTab(tab);
  };

  // 15-minute Inactivity Tracking & Session Locking
  const lockSession = (targetUserIdOrReason?: string, explicitReason?: string) => {
    setIsLocked(true);
    
    let targetId: string | null = null;
    let reasonText: string | null = null;

    if (explicitReason !== undefined) {
      targetId = targetUserIdOrReason || null;
      reasonText = explicitReason || null;
    } else if (targetUserIdOrReason) {
      const userExists = users.some(u => u.id === targetUserIdOrReason);
      if (userExists) {
        targetId = targetUserIdOrReason;
      } else {
        reasonText = targetUserIdOrReason;
      }
    }

    setTargetLockUserId(targetId);
    setLockReason(reasonText);

    if (reasonText === 'inactivity') {
      addToast('info', 'Session Verrouillée', 'Verrouillage automatique après 15 minutes d\'inactivité.');
    }
  };

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
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
  const unlockSession = async (userId: string, enteredPin: string): Promise<{ success: boolean; error?: string }> => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return { success: false, error: "Utilisateur non trouvé." };
    try {
      const authenticatedUser = await api.login(userId, enteredPin);
      setCurrentUser(authenticatedUser);
      setIsLocked(false);
      setTargetLockUserId(null);
      setLockReason(null);
      
      if (authenticatedUser.role === 'Dev') {
        if (!['Users', 'PINs', 'Logs', 'Leaderboard'].includes(activeTab)) {
          setActiveTab('Users');
        }
      } else if (authenticatedUser.role === 'Admin') {
        if (!['Overview', 'Reports', 'Roster', 'Leaderboard'].includes(activeTab)) {
          setActiveTab('Overview');
        }
      } else {
        if (!['Daily Grading', 'Group Roster', 'Report Form', 'Leaderboard'].includes(activeTab)) {
          setActiveTab('Daily Grading');
        }
      }

      addToast('success', 'Session Déverrouillée', `Bienvenue, ${authenticatedUser.name} (${getRoleLabel(authenticatedUser.role)}) !`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Code PIN incorrect." };
    }
  };

  // Developer-exclusive PIN Update / Reset
  const updateUserPin = async (userId: string, newPin: string): Promise<boolean> => {
    const sanitizedPin = newPin.trim();
    if (!/^\d{4}$/.test(sanitizedPin)) {
      addToast('warning', 'Format PIN Invalide', 'Le code PIN doit comporter exactement 4 chiffres (0-9).');
      return false;
    }

    try {
      await api.updateUserPin(userId, sanitizedPin);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, pinCode: undefined, pin: undefined } : u));
      if (currentUser.id === userId) {
        setCurrentUser(prev => ({ ...prev, pinCode: undefined, pin: undefined }));
      }
      const targetUser = users.find(u => u.id === userId);
      addToast('success', 'Code PIN Mis à Jour', `Nouveau PIN enregistré en base pour ${targetUser?.name}.`);
      return true;
    } catch (e: any) {
      addToast('warning', 'Erreur de mise à jour', e.message || 'Impossible de mettre à jour le code PIN.');
      return false;
    }
  };

  const generateRandomPin = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const saveDailyGrading = async (gradingInput: Partial<DailyGrading> & { child_id: string; date: string }) => {
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

    try {
      // 1. Save grading to Cloud SQL
      await api.saveGrading(gradingRecord);

      // 2. Save attendance to Cloud SQL
      const newAttendance: Attendance = {
        id: `a-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        child_id: gradingRecord.child_id,
        date: gradingRecord.date,
        status: gradingRecord.presence ? 'Present' : 'Absent',
        recorded_by_user_id: currentUser.id,
      };
      await api.saveAttendance(newAttendance);

      // 3. Update Child points & progress in Cloud SQL
      const child = kids.find(k => k.id === gradingRecord.child_id);
      if (child) {
        const otherGradings = gradings.filter(g => g.child_id === child.id && g.date !== gradingRecord.date);
        const allChildGradings = [gradingRecord, ...otherGradings];
        const newTotalPoints = allChildGradings.reduce((sum, g) => sum + g.total_day_points, 0);

        let newProgress = { ...child.qualification_progress };
        if (child.status === 'Recruit' && gradingRecord.presence) {
          // Qualification is based on distinct Sunday attendance dates, not grading saves.
          const presentDates = new Set(attendances
            .filter(a => a.child_id === child.id && a.status === 'Present')
            .map(a => a.date));
          presentDates.add(gradingRecord.date);
          const sundays = [...presentDates]
            .filter(date => new Date(`${date}T00:00:00Z`).getUTCDay() === 0)
            .sort()
            .reverse();
          let consecutive = 0;
          for (let i = 0; i < sundays.length; i += 1) {
            const current = new Date(`${sundays[i]}T00:00:00Z`);
            const previous = sundays[i + 1] ? new Date(`${sundays[i + 1]}T00:00:00Z`) : null;
            if (i === 0 || (previous && (current.getTime() - previous.getTime()) === 7 * 24 * 60 * 60 * 1000)) consecutive += 1;
            else break;
          }
          newProgress.consecutive_weeks = Math.min(3, consecutive);
        }

        const isNowQualified = child.status === 'Recruit' && isRecruitFullyQualified(newProgress);
        const updatedChild: Partial<Child> = {
          total_accumulated_points: newTotalPoints,
          qualification_progress: newProgress,
          status: isNowQualified ? 'Qualified Astronaute' : child.status,
          current_rank: (isNowQualified && child.current_rank === 'Recruit') ? 'Astronaute' : child.current_rank,
        };

        await api.updateChild(child.id, updatedChild);
      }

      await refreshData();
      addToast('success', 'Évaluation Enregistrée', `${calculatedPoints} pts enregistrés dans la base de données.`);
    } catch (e: any) {
      addToast('warning', 'Erreur d\'enregistrement', e.message || 'Impossible d\'enregistrer en base.');
    }
  };

  const updateRecruitProgress = async (childId: string, progressUpdates: Partial<QualificationProgress>) => {
    const targetChild = kids.find(k => k.id === childId);
    if (!targetChild) return;

    const updatedProgress = {
      ...targetChild.qualification_progress,
      ...progressUpdates,
    };

    const isQualified = isRecruitFullyQualified(updatedProgress);
    const newStatus = isQualified ? 'Qualified Astronaute' : targetChild.status;
    const newRank = (isQualified && targetChild.current_rank === 'Recruit') ? 'Astronaute' : targetChild.current_rank;

    try {
      await api.updateChild(childId, {
        qualification_progress: updatedProgress,
        status: newStatus,
        current_rank: newRank,
      });
      await refreshData();
      addToast('info', 'Progression Mise à Jour', `Progression sauvegardée pour ${targetChild.first_name}.`);
    } catch (e: any) {
      addToast('warning', 'Erreur', e.message || 'Échec de mise à jour.');
    }
  };

  const promoteChildRank = async (childId: string, newRank: string) => {
    if (!RANK_SYSTEM.some(rank => rank.title === newRank)) {
      addToast('warning', 'Promotion invalide', 'Le rang sélectionné ne fait pas partie de la matrice officielle.');
      return;
    }

    const targetChild = kids.find(k => k.id === childId);
    if (!targetChild) return;

    try {
      await api.updateChild(childId, {
        current_rank: newRank,
        status: targetChild.status === 'Recruit' ? 'Qualified Astronaute' : targetChild.status,
      });
      await refreshData();
      addToast('success', 'Promotion Confirmée ! 🚀', `${targetChild.first_name} ${targetChild.last_name} promu au rang "${newRank}" !`);
    } catch (e: any) {
      addToast('warning', 'Erreur', e.message || 'Échec de la promotion.');
    }
  };

  const addChild = async (childData: Omit<Child, 'id'>) => {
    const newChild: Child = {
      ...childData,
      id: `c-${Date.now()}`,
    };
    try {
      await api.createChild(newChild);
      await refreshData();
      addToast('success', 'Enfant Inscrit', `${newChild.first_name} ${newChild.last_name} a été ajouté dans la base Cloud SQL.`);
    } catch (e: any) {
      addToast('warning', 'Erreur d\'inscription', e.message || 'Échec de l\'ajout de l\'enfant.');
    }
  };

  const deleteChild = async (childId: string) => {
    try {
      await api.deleteChild(childId);
      await refreshData();
      addToast('info', 'Enfant Supprimé', 'Le dossier de l\'enfant a été retiré de la base de données.');
    } catch (e: any) {
      addToast('warning', 'Erreur', e.message || 'Échec de la suppression.');
    }
  };

  const addUser = async (userData: Omit<User, 'id'>) => {
    const isGlobal = userData.role === 'Dev' || userData.role === 'Admin';
    const assignedPin = (userData.pinCode || userData.pin || generateRandomPin()).trim();
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
      color_group: isGlobal ? null : (userData.color_group || 'Red'),
      pinCode: assignedPin,
      pin: assignedPin,
    };
    try {
      await api.createUser(newUser);
      await refreshData();
      addToast('success', 'Utilisateur Créé', `${newUser.name} ajouté en base avec le rôle ${getRoleLabel(newUser.role)} (PIN: ${newUser.pinCode}).`);
    } catch (e: any) {
      addToast('warning', 'Erreur', e.message || 'Échec de la création.');
    }
  };

  const deleteUser = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    if (currentUser.id === userId) {
      addToast('warning', 'Action impossible', 'Vous ne pouvez pas supprimer le compte actuellement connecté.');
      return;
    }

    try {
      await api.deleteUser(userId);
      await refreshData();
      addToast('info', 'Utilisateur Supprimé', `Le compte de ${targetUser.name} a été retiré de la base de données.`);
    } catch (e: any) {
      addToast('warning', 'Erreur', e.message || 'Échec de la suppression.');
    }
  };

  const updateReportStatus = async (reportId: string, status: "Draft" | "Submitted" | "Reviewed") => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    try {
      await api.saveReport({ ...report, status });
      await refreshData();
      addToast('info', 'Rapport Mis à Jour', `Le statut du rapport est passé à "${getStatusLabel(status)}".`);
    } catch (e: any) {
      addToast('warning', 'Erreur', e.message || 'Échec de la mise à jour du rapport.');
    }
  };

  const saveMonthlyReport = async (report: Partial<MonthlyReport> & { color_group: any; month_year: string; content: string }) => {
    const reportRecord: MonthlyReport = {
      id: report.id || `r-${Date.now()}`,
      color_group: report.color_group,
      month_year: report.month_year,
      content: report.content || '',
      status: report.status || 'Submitted',
    };
    try {
      await api.saveReport(reportRecord);
      await refreshData();
      addToast('success', 'Rapport Enregistré', `Rapport mensuel pour le Groupe ${getColorGroupLabel(report.color_group)} sauvegardé en base.`);
    } catch (e: any) {
      addToast('warning', 'Erreur', e.message || 'Échec de la sauvegarde du rapport.');
    }
  };

  const resetDatabase = async () => {
    try {
      await api.resetDatabase();
      await refreshData();
      setIsLocked(true);
      addToast('info', 'Base de Données Réinitialisée', 'Base Cloud SQL vidée : vous pouvez saisir des données réelles.');
    } catch (e: any) {
      addToast('warning', 'Erreur', e.message || 'Échec de la réinitialisation.');
    }
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
      setActiveTab: handleSetActiveTab,
      toasts,
      addToast,
      removeToast,
      geminiApiKey,
      setGeminiApiKey,
      isAiAssistantOpen,
      setIsAiAssistantOpen,
      isLocked,
      targetLockUserId,
      lockReason,
      lockSession,
      unlockSession,
      updateUserPin,
      generateRandomPin,
      saveDailyGrading,
      updateRecruitProgress,
      promoteChildRank,
      addChild,
      deleteChild,
      addUser,
      deleteUser,
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
