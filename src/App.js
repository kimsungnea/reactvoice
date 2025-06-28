// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import MainPage from './Pages/Main/MainPage';
import MapPage from './Pages/Map/MapPage';
import NavigationPage from './Pages/Navigation/NavigationPage';
import InfoPage from './Pages/Info/InfoPage';
import SettingsPage from './Pages/Settings/SettingsPage';

function App() {
  return (
    <Router>

      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/main" element={<MainPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/nav" element={<NavigationPage />} />
          <Route path="/info" element={<InfoPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<MainPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
