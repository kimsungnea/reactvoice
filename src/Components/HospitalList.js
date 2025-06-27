import React from 'react';
import './HospitalList.css';

const HospitalList = ({ hospitals, userLocation }) => {
  // 병원 클릭 시 카카오맵 길찾기 열기
  const openNavigation = (hospital) => {
    const { lat, lng, name } = hospital;
    const url = `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="hospital-list">
      <h2>🏥 추천 병원 목록 (클릭하면 길찾기)</h2>
      <ul>
        {hospitals.map((hospital, index) => (
          <li
            key={index}
            onClick={() => openNavigation(hospital)}
            className="hospital-item"
            style={{ cursor: 'pointer' }}
          >
            <strong>{hospital.name}</strong><br />
            {hospital.address}<br />
            📞 {hospital.phone}<br />
            📏 거리: {hospital.distance?.toFixed(2)}km
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HospitalList;
