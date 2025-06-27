// src/Components/KakaoMap.js
import React, { useEffect } from 'react';

const KakaoMap = ({ keyword, mapRef, onPlacesUpdate }) => {
  useEffect(() => {
    const loadMap = () => {
      const kakao = window.kakao;
      const container = document.getElementById('map');
      const defaultCenter = new kakao.maps.LatLng(37.5665, 126.9780); // 서울

      const options = {
        center: defaultCenter,
        level: 3,
      };
      const map = new kakao.maps.Map(container, options);
      mapRef.current = map;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const userPosition = new kakao.maps.LatLng(lat, lng);

            map.setCenter(userPosition);

            // ✅ 현재 위치 마커
            const marker = new kakao.maps.Marker({
              map,
              position: userPosition,
              title: '현재 위치',
              image: new kakao.maps.MarkerImage(
                'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                new kakao.maps.Size(24, 35)
              ),
            });

            // ✅ 인포윈도우
            const infowindow = new kakao.maps.InfoWindow({
              content: '<div style="padding:5px;font-size:12px;">📍 현재 위치</div>',
            });
            infowindow.open(map, marker);

            // ✅ 사용자 오버레이 버튼
            const overlayContent = `
              <div style="
                position:absolute;
                bottom:20px;
                right:10px;
                z-index:100;
                cursor:pointer;
                background:#fff;
                padding:5px 10px;
                border:1px solid #888;
                border-radius:4px;
                font-size:13px;
                box-shadow: 0px 2px 5px rgba(0,0,0,0.3);
              ">
                <span id="moveToCurrent">📍 현재 위치</span>
              </div>
            `;
            const customOverlay = new kakao.maps.CustomOverlay({
              position: userPosition,
              content: overlayContent,
              yAnchor: 1,
            });
            customOverlay.setMap(map);

            setTimeout(() => {
              const btn = document.getElementById('moveToCurrent');
              if (btn) {
                btn.onclick = () => {
                  map.setCenter(userPosition);
                };
              }
            }, 300);
          },
          (err) => {
            console.warn('위치 접근 실패:', err);
          }
        );
      } else {
        console.warn('이 브라우저는 위치 정보를 지원하지 않습니다.');
      }
    };

    // ✅ 스크립트 로드
    if (!window.kakao || !window.kakao.maps) {
      const script = document.createElement('script');
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_KEY}&autoload=false&libraries=services`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(loadMap);
      };
      document.head.appendChild(script);
    } else {
      window.kakao.maps.load(loadMap);
    }
  }, []);

  useEffect(() => {
    if (!window.kakao || !mapRef.current || !keyword) return;

    const kakao = window.kakao;
    const map = mapRef.current;
    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(keyword, (data, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const bounds = new kakao.maps.LatLngBounds();

        data.forEach((place) => {
          const pos = new kakao.maps.LatLng(place.y, place.x);

          // ✅ 병원 마커
          const marker = new kakao.maps.Marker({
            map,
            position: pos,
            title: place.place_name,
          });

          const infowindow = new kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:13px;"><strong>${place.place_name}</strong></div>`,
          });

          kakao.maps.event.addListener(marker, 'click', () => {
            infowindow.open(map, marker);
          });

          bounds.extend(pos);
        });

        map.setBounds(bounds);
        onPlacesUpdate(data);
      } else {
        console.warn('병원 검색 실패:', status);
        onPlacesUpdate([]);
      }
    });
  }, [keyword]);

  return (
    <div id="map" style={{ width: '100%', height: '400px', marginTop: '20px' }} />
  );
};

export default KakaoMap;
