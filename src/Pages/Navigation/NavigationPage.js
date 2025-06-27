// src/Pages/Navigation/NavigationPage.js
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const NavigationPage = () => {
  const location = useLocation();
  const { hospital, userLocation } = location.state || {};

  useEffect(() => {
    if (!hospital || !userLocation || !window.kakao) return;

    const container = document.getElementById('nav-map');
    const options = {
      center: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
      level: 3,
    };

    const map = new window.kakao.maps.Map(container, options);
    const linePath = [
      new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
      new window.kakao.maps.LatLng(hospital.lat, hospital.lng),
    ];

    // 경로 폴리라인
    new window.kakao.maps.Polyline({
      map,
      path: linePath,
      strokeWeight: 5,
      strokeColor: '#007bff',
      strokeOpacity: 0.7,
      strokeStyle: 'solid',
    });

    // 사용자 위치 마커
    new window.kakao.maps.Marker({
      map,
      position: linePath[0],
      title: '내 위치',
    });

    // 병원 위치 마커
    new window.kakao.maps.Marker({
      map,
      position: linePath[1],
      title: hospital.name,
    });

    // 인포윈도우
    new window.kakao.maps.InfoWindow({
      map,
      position: linePath[1],
      content: `<div style="padding:5px;font-size:12px;">🚑 ${hospital.name}</div>`,
    });

    map.setBounds(new window.kakao.maps.LatLngBounds(...linePath));
  }, [hospital, userLocation]);

  if (!hospital || !userLocation) {
    return <p>병원 또는 위치 정보가 없습니다.</p>;
  }

  return (
    <div>
      <h2>🧭 {hospital.name} 길찾기</h2>
      <div
        id="nav-map"
        style={{ width: '100%', height: '400px', marginTop: '10px', border: '1px solid #ccc' }}
      ></div>
    </div>
  );
};

export default NavigationPage;
