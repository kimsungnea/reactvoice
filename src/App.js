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
      <nav style={{ padding: '10px', background: '#eee', display: 'flex', gap: '10px' }}>
        <Link to="/main"><button>메인 페이지(음성)</button></Link>
        <Link to="/map"><button>지도 검색</button></Link>
        <Link to="/nav"><button>길찾기</button></Link>
        <Link to="/info"><button>병원 정보</button></Link>
        <Link to="/settings"><button>설정</button></Link>
      </nav>

      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/main" element={<MainPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/nav" element={<NavigationPage />} />
          <Route path="/info" element={<InfoPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<MapPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
