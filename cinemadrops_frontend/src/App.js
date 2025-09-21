import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { ApiProvider } from './services/Api';
import { SocketProvider } from './services/Socket';
import { ThemeProvider } from './services/Theme';
import TopNav from './components/TopNav';
import Home from './pages/Home';
import FilmDetails from './pages/FilmDetails';
import CreatorProfile from './pages/CreatorProfile';
import Forums from './pages/Forums';
import Challenges from './pages/Challenges';
import ChallengesHub from './pages/ChallengesHub';
import ChallengeDetails from './pages/ChallengeDetails';
import UserProfile from './pages/UserProfile';
import Curated from './pages/Curated';
import NotFound from './pages/NotFound';
import Upload from './pages/Upload';

// PUBLIC_INTERFACE
function App() {
  return (
    <BrowserRouter>
      <ApiProvider>
        <SocketProvider>
          <ThemeProvider>
            <div className="app-shell">
              <TopNav />
              <div className="main-grid container">
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/film/:id" element={<FilmDetails />} />
                    <Route path="/creator/:id" element={<CreatorProfile />} />
                    <Route path="/forums/*" element={<Forums />} />
                    <Route path="/challenges" element={<ChallengesHub />} />
                    <Route path="/challenges/:id" element={<ChallengeDetails />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/curated" element={<Curated />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </ThemeProvider>
        </SocketProvider>
      </ApiProvider>
    </BrowserRouter>
  );
}

export default App;
