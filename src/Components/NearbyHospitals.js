// src/Components/NearbyHospitals.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NearbyHospitals = ({ mapRef, onPlacesUpdate }) => {
  const [radius, setRadius] = useState(1000); // 기본 반경 1km
  const [places, setPlaces] = useState([]);   // 병원 리스트
  const [userLocation, setUserLocation] = useState(null); // 내 위치 저장
  const navigate = useNavigate();

  // ✅ 내 위치 받아서 지도 중심 설정 + 병원 검색
  useEffect(() => {
    if (!window.kakao || !mapRef.current) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const userPos = new window.kakao.maps.LatLng(lat, lng);
          setUserLocation({ lat, lng });

          mapRef.current.setCenter(userPos);

          new window.kakao.maps.Marker({
            map: mapRef.current,
            position: userPos,
            title: '현재 위치',
          });

          searchNearbyHospitals(lat, lng); // 내 위치 기준 병원 검색
        },
        (error) => {
          console.warn('위치 정보 가져오기 실패:', error);
        }
      );
    } else {
      console.warn('이 브라우저는 위치 정보를 지원하지 않습니다.');
    }
  }, [mapRef]);

  // ✅ 병원 검색 함수
  const searchNearbyHospitals = (lat, lng) => {
    const kakao = window.kakao;
    const map = mapRef.current;
    const ps = new kakao.maps.services.Places();

    const center = new kakao.maps.LatLng(lat, lng);
    const options = {
      location: center,
      radius: radius,
      sort: kakao.maps.services.SortBy.DISTANCE,
    };

    ps.keywordSearch('병원', (data, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const bounds = new kakao.maps.LatLngBounds();

        data.forEach((place) => {
          const pos = new kakao.maps.LatLng(place.y, place.x);

          new kakao.maps.Marker({
            map,
            position: pos,
          });

          const infoWindow = new kakao.maps.InfoWindow({
            content: `
              <div style="padding:5px;font-size:13px;">
                <strong>${place.place_name}</strong><br/>
                ${place.address_name}
              </div>
            `,
          });

          kakao.maps.event.addListener(map, 'click', () => {
            infoWindow.close();
          });

          bounds.extend(pos);
        });

        map.setBounds(bounds);
        setPlaces(data);
        onPlacesUpdate(data);
      } else {
        console.warn('병원 검색 실패:', status);
        setPlaces([]);
        onPlacesUpdate([]);
      }
    }, options);
  };

  // ✅ 병원 클릭 시 네비게이션 페이지로 이동
  const handleClickHospital = (hospital) => {
    if (!userLocation) return;

    navigate('/nav', {
      state: {
        hospital: {
          name: hospital.place_name,
          lat: parseFloat(hospital.y),
          lng: parseFloat(hospital.x),
        },
        userLocation: {
          lat: userLocation.lat,
          lng: userLocation.lng,
        },
      },
    });
  };

  return (
    <div style={{ marginTop: '10px', marginBottom: '10px' }}>
      <label htmlFor="radius">📏 반경 설정:&nbsp;</label>
      <select
        id="radius"
        value={radius}
        onChange={(e) => setRadius(Number(e.target.value))}
      >
        <option value={500}>500m</option>
        <option value={1000}>1km</option>
        <option value={2000}>2km</option>
      </select>

      {/* ✅ 내 위치로 지도 이동 버튼 */}
      <button
        onClick={() => {
          if (userLocation && mapRef.current) {
            const moveLatLng = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng);
            mapRef.current.setCenter(moveLatLng);
          }
        }}
        style={{ marginLeft: '10px' }}
      >
        📍 내 위치로 이동
      </button>

      {/* ✅ 병원 리스트 */}
      <ul style={{ marginTop: '20px', listStyle: 'none', paddingLeft: 0 }}>
        {places.map((place, idx) => (
          <li key={idx} style={{ marginBottom: '10px' }}>
            <button
              onClick={() => handleClickHospital(place)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                background: '#f9f9f9',
                cursor: 'pointer',
              }}
            >
              <strong>{place.place_name}</strong><br />
              <small>{place.address_name}</small>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NearbyHospitals;
