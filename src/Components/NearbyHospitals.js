// src/Components/NearbyHospitals.js
import React, { useEffect, useState } from 'react';

const NearbyHospitals = ({ mapRef, onPlacesUpdate }) => {
  const [radius, setRadius] = useState(1000); // 기본 반경: 1000m

  const searchNearbyHospitals = () => {
    if (!window.kakao || !mapRef.current) return;

    const kakao = window.kakao;
    const map = mapRef.current;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const userPosition = new kakao.maps.LatLng(lat, lng);

          const ps = new kakao.maps.services.Places();

          const options = {
            location: userPosition,
            radius: radius,
            sort: kakao.maps.services.SortBy.DISTANCE,
          };

          ps.keywordSearch('병원', (data, status) => {
            if (status === kakao.maps.services.Status.OK) {
              const bounds = new kakao.maps.LatLngBounds();

              data.forEach((place) => {
                const pos = new kakao.maps.LatLng(place.y, place.x);

                const marker = new kakao.maps.Marker({
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

                kakao.maps.event.addListener(marker, 'click', () => {
                  infoWindow.open(map, marker);
                });

                bounds.extend(pos);
              });

              map.setBounds(bounds);
              onPlacesUpdate(data);
            } else {
              console.warn('주변 병원 검색 실패:', status);
              onPlacesUpdate([]);
            }
          }, options);
        },
        (error) => {
          console.warn('위치 접근 실패:', error);
        }
      );
    } else {
      console.warn('이 브라우저는 위치 정보를 지원하지 않습니다.');
    }
  };

  useEffect(() => {
    searchNearbyHospitals();
  }, [radius]);

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
    </div>
  );
};

export default NearbyHospitals;
