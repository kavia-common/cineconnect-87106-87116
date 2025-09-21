import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { ApiProvider } from './services/Api';
import { AuthProvider } from './services/Auth';
import { ThemeProvider } from './services/Theme';
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
import Profile from './pages/Profile';
import Upload from './pages/Upload';

// PUBLIC_INTERFACE
function App() {
  /** App sin chat/notifications/quick drawers */
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ApiProvider>
          <AuthProvider>
            <div className="app-shell">
              <TopNav />
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
                    <Route path="/subir" element={<Upload />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <aside className="rightbar">
                  <RightSidebar />
                </aside>
              </div>
            </div>
          </AuthProvider>
        </ApiProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
