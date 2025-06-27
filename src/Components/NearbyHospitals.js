// src/Components/NearbyHospitals.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NearbyHospitals = ({ mapRef, onPlacesUpdate }) => {
  const radiusSteps = [1000, 2000, 5000, 10000];
  const [radius, setRadius] = useState(radiusSteps[0]);
  const [places, setPlaces] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
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

          searchNearbyHospitals(lat, lng, 0); // 첫 반경부터 검색
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
  const searchNearbyHospitals = (lat, lng, stepIndex) => {
    const kakao = window.kakao;
    const map = mapRef.current;
    const ps = new kakao.maps.services.Places();

    const currentRadius = radiusSteps[stepIndex];
    setRadius(currentRadius);

    const center = new kakao.maps.LatLng(lat, lng);
    const options = {
      location: center,
      radius: currentRadius,
      sort: kakao.maps.services.SortBy.DISTANCE,
    };

    ps.keywordSearch('병원', (data, status) => {
      if (status === kakao.maps.services.Status.OK && data.length > 0) {
        const bounds = new kakao.maps.LatLngBounds();

        data.forEach((place) => {
          const pos = new kakao.maps.LatLng(place.y, place.x);

          new kakao.maps.Marker({
            map,
            position: pos,
          });

          bounds.extend(pos);
        });

        map.setBounds(bounds);
        setPlaces(data);
        onPlacesUpdate(data);
      } else {
        // 결과 없으면 반경을 키워서 재검색
        const nextStep = stepIndex + 1;
        if (nextStep < radiusSteps.length) {
          console.log(`반경 ${currentRadius}m에 결과 없음 → ${radiusSteps[nextStep]}m로 재검색`);
          searchNearbyHospitals(lat, lng, nextStep);
        } else {
          console.log(`반경 ${currentRadius}m까지 검색했지만 결과 없음`);
          setPlaces([]);
          onPlacesUpdate([]);
        }
      }
    }, options);
  };

  // ✅ 병원 클릭 시 네비게이션 이동
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
        {radiusSteps.map((r) => (
          <option key={r} value={r}>{r / 1000}km</option>
        ))}
      </select>

      {/* ✅ 내 위치로 이동 버튼 (fresh geolocation) */}
      <button
        onClick={() => {
          if (navigator.geolocation && mapRef.current) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const moveLatLng = new window.kakao.maps.LatLng(lat, lng);
                mapRef.current.setCenter(moveLatLng);
              },
              (error) => {
                console.warn('위치 정보 다시 가져오기 실패:', error);
              }
            );
          }
        }}
        style={{ marginLeft: '10px' }}
      >
        📍 내 위치로 이동
      </button>

      {/* ✅ 병원 버튼 리스트 */}
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
