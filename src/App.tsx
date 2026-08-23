/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppProvider, useAppContext } from './AppContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MobileNavBar from './components/MobileNavBar';
import DevView from './components/views/DevView';
import AdminView from './components/views/AdminView';
import TeamView from './components/views/TeamView';
import LeaderboardView from './components/views/LeaderboardView';
import ToastContainer from './components/ToastContainer';
import AiAssistantDrawer from './components/AiAssistantDrawer';
import PinLockScreen from './components/PinLockScreen';

function AppContent() {
  const { currentUser, activeTab, isLocked } = useAppContext();

  if (isLocked) {
    return (
      <>
        <PinLockScreen />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-16 md:pb-0">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-[calc(100vh-60px)] overflow-y-auto">
          {activeTab === 'Leaderboard' ? (
            <LeaderboardView />
          ) : (
            <>
              {currentUser.role === 'Dev' && <DevView />}
              {currentUser.role === 'Admin' && <AdminView />}
              {['Pilote', 'Co-Pilote', 'Helper'].includes(currentUser.role) && <TeamView />}
            </>
          )}
        </main>
      </div>
      <MobileNavBar />
      <AiAssistantDrawer />
      <ToastContainer />
    </div>
  );
}


export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
