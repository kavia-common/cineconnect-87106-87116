import React, { useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { ApiProvider } from './services/Api';
import { SocketProvider } from './services/Socket';
import { AuthProvider } from './services/Auth';
import TopNav from './components/TopNav';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import Home from './pages/Home';
import FilmDetails from './pages/FilmDetails';
import CreatorProfile from './pages/CreatorProfile';
import Forums from './pages/Forums';
import Challenges from './pages/Challenges';
import Curated from './pages/Curated';
import NotFound from './pages/NotFound';
import ChatDrawer from './drawers/ChatDrawer';
import NotificationsDrawer from './drawers/NotificationsDrawer';
import QuickActionsDrawer from './drawers/QuickActionsDrawer';
import Profile from './pages/Profile';

// PUBLIC_INTERFACE
function App() {
  /** Root state for drawers */
  const [openDrawer, setOpenDrawer] = useState(null); // 'chat' | 'notif' | 'quick' | null

  const drawerApi = useMemo(() => ({
    open: (name) => setOpenDrawer(name),
    close: () => setOpenDrawer(null),
    isOpen: (name) => openDrawer === name
  }), [openDrawer]);

  return (
    <BrowserRouter>
      <ApiProvider>
        <AuthProvider>
          <SocketProvider>
            <div className="app-shell">
            <TopNav onOpenChat={() => setOpenDrawer('chat')}
                    onOpenNotifications={() => setOpenDrawer('notif')}
                    onOpenQuick={() => setOpenDrawer('quick')} />
            <div className="main-grid container">
              <aside className="sidebar">
                <LeftSidebar />
              </aside>
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/film/:id" element={<FilmDetails />} />
                  <Route path="/creator/:id" element={<CreatorProfile />} />
                  <Route path="/forums/*" element={<Forums />} />
                  <Route path="/challenges" element={<Challenges />} />
                  <Route path="/curated" element={<Curated />} />
                  <Route path="/perfil" element={<Profile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <aside className="rightbar">
                <RightSidebar />
              </aside>
            </div>

            <ChatDrawer open={drawerApi.isOpen('chat')} onClose={drawerApi.close} />
            <NotificationsDrawer open={drawerApi.isOpen('notif')} onClose={drawerApi.close} />
            <QuickActionsDrawer open={drawerApi.isOpen('quick')} onClose={drawerApi.close} />
          </div>
          </SocketProvider>
        </AuthProvider>
      </ApiProvider>
    </BrowserRouter>
  );
}

export default App;
