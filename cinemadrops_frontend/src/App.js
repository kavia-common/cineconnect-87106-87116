import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { ApiProvider } from './services/Api';
import { SocketProvider } from './services/Socket';
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
import Upload from './pages/Upload';

// PUBLIC_INTERFACE
function App() {
  return (
    <BrowserRouter>
      <ApiProvider>
        <SocketProvider>
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
                  <Route path="/upload" element={<Upload />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <aside className="rightbar">
                <RightSidebar />
              </aside>
            </div>
          </div>
        </SocketProvider>
      </ApiProvider>
    </BrowserRouter>
  );
}

export default App;
