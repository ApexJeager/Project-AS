/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppProvider, useAppContext } from './AppContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DevView from './components/views/DevView';
import AdminView from './components/views/AdminView';
import TeamView from './components/views/TeamView';

function AppContent() {
  const { currentUser } = useAppContext();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-[calc(100vh-73px)] bg-gray-50/30">
          {currentUser.role === 'Dev' && <DevView />}
          {currentUser.role === 'Admin' && <AdminView />}
          {['Pilote', 'Co-Pilote', 'Helper'].includes(currentUser.role) && <TeamView />}
        </main>
      </div>
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

