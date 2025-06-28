// src/Pages/Navigation/NavigationPage.js

import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NavigationPage = () => {
  const location = useLocation();
  const { hospital, userLocation } = location.state || {};

  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const userMarkerRef = useRef(null);
  const [eta, setEta] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!hospital || !userLocation || !window.kakao) return;

    const kakao = window.kakao;

    const container = document.getElementById('nav-map');
    const map = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(userLocation.lat, userLocation.lng),
      level: 3,
    });
    mapRef.current = map;

    const destPos = new kakao.maps.LatLng(hospital.lat, hospital.lng);

    // 병원 마커
    new kakao.maps.Marker({
      map,
      position: destPos,
      title: hospital.name,
    });

    new kakao.maps.InfoWindow({
      map,
      position: destPos,
      content: `<div style="padding:5px;font-size:12px;">🚑 ${hospital.name}</div>`,
    });

    // 실시간 위치 추적
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const userPos = new kakao.maps.LatLng(userLat, userLng);

        // 내 위치 마커
        if (!userMarkerRef.current) {
          userMarkerRef.current = new kakao.maps.Marker({
            map,
            position: userPos,
            title: '내 위치',
          });
        } else {
          userMarkerRef.current.setPosition(userPos);
        }

        try {
          // 카카오 모빌리티 길찾기 요청
          const response = await fetch(
            `https://apis-navi.kakaomobility.com/v1/directions?origin=${userLng},${userLat}&destination=${hospital.lng},${hospital.lat}`,
            {
              headers: {
                Authorization: `KakaoAK ${process.env.REACT_APP_KAKAO_REST_API_KEY}`,
              },
            }
          );
          const data = await response.json();

          if (data.routes && data.routes[0]) {
            const section = data.routes[0].sections[0];
            const roads = section.roads;

            // 도로망 경로 좌표
            const linePath = [];
            roads.forEach((road) => {
              for (let i = 0; i < road.vertexes.length; i += 2) {
                const lng = road.vertexes[i];
                const lat = road.vertexes[i + 1];
                linePath.push(new kakao.maps.LatLng(lat, lng));
              }
            });

            if (!polylineRef.current) {
              polylineRef.current = new kakao.maps.Polyline({
                map,
                path: linePath,
                strokeWeight: 5,
                strokeColor: '#007bff',
                strokeOpacity: 0.7,
                strokeStyle: 'solid',
              });
            } else {
              polylineRef.current.setPath(linePath);
            }

            // ETA
            setEta({
              distance: (section.distance / 1000).toFixed(2), // km
              duration: Math.ceil(section.duration / 60), // 분
            });
          }
        } catch (err) {
          console.warn('길찾기 요청 실패', err);
        }

        // 지도 bounds 맞추기
        const bounds = new kakao.maps.LatLngBounds();
        bounds.extend(userPos);
        bounds.extend(destPos);
        map.setBounds(bounds);
      },
      (err) => {
        console.warn('실시간 위치 추적 실패:', err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [hospital, userLocation]);

  if (!hospital || !userLocation) {
    return <p> 병원 또는 위치 정보가 없습니다.</p>;
  }

  return (
    <div>
      <h2> {hospital.name} 길찾기</h2>
      <div
        id="nav-map"
        style={{
          width: '100%',
          height: '400px',
          marginTop: '10px',
          border: '1px solid #ccc',
        }}
      ></div>
      {eta && (
<div style={{ marginTop: '15px', fontSize: '14px' }}>
  <strong>예상 거리:</strong> {eta.distance} km<br />
  <strong>예상 소요 시간:</strong> {eta.duration} 분
  <button
    style={{
      marginTop: '10px',
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      cursor: 'pointer',
      backgroundColor: '#f0f0f0',
    }}
    onClick={() => navigate('/')}
  >
    처음으로 돌아가기
  </button>
</div>
      )}
    </div>
  );
};

export default NavigationPage;
