// src/Components/HospitalList.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HospitalList.css';

const HospitalList = ({ hospitals, userLocation }) => {
  const navigate = useNavigate();

  const openNavigation = (hospital) => {
    navigate('/nav', {
      state: {
        hospital,
        userLocation,
      },
    });
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
