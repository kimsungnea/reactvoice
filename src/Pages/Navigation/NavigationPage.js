// src/Pages/Navigation/NavigationPage.js
import React, { useEffect, useRef, useState } from 'react';

const NavigationPage = () => {
  const mapRef = useRef(null);
  const [startCoords, setStartCoords] = useState(null); // 현재 위치
  const [end, setEnd] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);

  const REST_API_KEY = process.env.REACT_APP_KAKAO_REST_API_KEY;

  // ✅ 지도 초기화 및 현재 위치 설정
  useEffect(() => {
    const loadMap = () => {
      const container = document.getElementById('nav-map');
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 5,
      };
      const map = new window.kakao.maps.Map(container, options);
      mapRef.current = map;

      // ✅ 현재 위치 가져오기
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const userPos = new window.kakao.maps.LatLng(lat, lng);
            setStartCoords({ lat, lng });

            // 마커 표시
            new window.kakao.maps.Marker({
              map,
              position: userPos,
              title: '현재 위치',
            });

            map.setCenter(userPos);

            // 주변 병원 예시 마커 (클릭 시 목적지 자동 지정)
            const hospitalSearch = new window.kakao.maps.services.Places();
            hospitalSearch.keywordSearch('병원', (results, status) => {
              if (status === window.kakao.maps.services.Status.OK) {
                results.slice(0, 5).forEach((place) => {
                  const pos = new window.kakao.maps.LatLng(place.y, place.x);
                  const marker = new window.kakao.maps.Marker({
                    map,
                    position: pos,
                  });

                  const iw = new window.kakao.maps.InfoWindow({
                    content: `<div style="padding:5px;font-size:13px;">${place.place_name}</div>`,
                  });

                  iw.open(map, marker);

                  window.kakao.maps.event.addListener(marker, 'click', () => {
                    setEnd(place.place_name); // 도착지 자동 입력
                  });
                });
              }
            });
          },
          (err) => console.warn('위치 정보 가져오기 실패', err)
        );
      }
    };

    if (!window.kakao || !window.kakao.maps) {
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_KEY}&autoload=false&libraries=services`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(() => {
          loadMap();
        });
      };
      document.head.appendChild(script);
    } else {
      loadMap();
    }
  }, []);

  // ✅ 길찾기 요청
  const handleRouteSearch = () => {
    if (!startCoords || !end || !window.kakao) return;

    const kakao = window.kakao;
    const map = mapRef.current;
    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(end, (endData, status2) => {
      if (status2 !== kakao.maps.services.Status.OK || !endData.length) {
        alert('도착지를 찾을 수 없습니다.');
        return;
      }
      const ex = endData[0].x;
      const ey = endData[0].y;
      const endPos = new kakao.maps.LatLng(ey, ex);

      const { lng: sx, lat: sy } = startCoords;
      const startPos = new kakao.maps.LatLng(sy, sx);

      // 마커 표시
      new kakao.maps.Marker({ map, position: startPos, title: '출발지' });
      new kakao.maps.Marker({ map, position: endPos, title: '도착지' });

      // 길찾기 API 호출
      fetch(`https://apis-navi.kakaomobility.com/v1/directions?origin=${sx},${sy}&destination=${ex},${ey}`, {
        headers: {
          Authorization: `KakaoAK ${REST_API_KEY}`,
        },
      })
        .then((res) => res.json())
        .then((result) => {
          if (!result.routes || !result.routes.length) {
            alert('경로를 찾을 수 없습니다.');
            return;
          }

          const section = result.routes[0].sections[0];
          const roads = section.roads;

          // 🔹 경로 선 그리기
          const linePath = roads.flatMap((road) =>
            road.vertexes.reduce((acc, cur, idx) => {
              if (idx % 2 === 1) {
                acc.push(new kakao.maps.LatLng(road.vertexes[idx], road.vertexes[idx - 1]));
              }
              return acc;
            }, [])
          );

          new kakao.maps.Polyline({
            map,
            path: linePath,
            strokeWeight: 4,
            strokeColor: '#007bff',
            strokeOpacity: 0.7,
            strokeStyle: 'solid',
          });

          // 지도 중심 설정
          map.setBounds(new kakao.maps.LatLngBounds(startPos, endPos));

          // 🔹 경로 정보 저장 (시간, 거리)
          setRouteInfo({
            distance: section.distance, // meters
            duration: section.duration, // seconds
          });
        })
        .catch((err) => {
          console.error('길찾기 실패:', err);
          alert('길찾기 요청 실패');
        });
    });
  };

  return (
    <div>
      <h2>🧭 카카오 모빌리티 길찾기</h2>
      <div style={{ marginBottom: '10px' }}>
        <input
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          placeholder="도착지 입력 (또는 병원 마커 클릭)"
          style={{ width: '300px', marginRight: '10px' }}
        />
        <button onClick={handleRouteSearch}>길찾기</button>
      </div>
      <div id="nav-map" style={{ width: '100%', height: '400px' }} />

      {routeInfo && (
        <div style={{ marginTop: '15px', fontSize: '14px' }}>
          <strong>🚗 예상 거리:</strong> {(routeInfo.distance / 1000).toFixed(2)} km<br />
          <strong>🕒 예상 시간:</strong> {(routeInfo.duration / 60).toFixed(1)} 분
        </div>
      )}
    </div>
  );
};

export default NavigationPage;
