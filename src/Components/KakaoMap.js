import React, { useEffect } from 'react';

const KakaoMap = ({ keyword, mapRef, onPlacesUpdate }) => {
  useEffect(() => {
    const loadMap = () => {
      const kakao = window.kakao;
      const container = document.getElementById('map');
      const options = {
        center: new kakao.maps.LatLng(37.5665, 126.9780),
        level: 3,
      };
      const map = new kakao.maps.Map(container, options);
      mapRef.current = map;

      // ✅ 현재 위치 가져오기
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const userPosition = new kakao.maps.LatLng(lat, lng);

            // 지도 중심 이동
            map.setCenter(userPosition);

            // ✅ 파란색 마커 추가
            const marker = new kakao.maps.Marker({
              map,
              position: userPosition,
              title: '현재 위치',
              image: new kakao.maps.MarkerImage(
                'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                new kakao.maps.Size(24, 35), // 마커 이미지 크기
              ),
            });

            // ✅ 말풍선(인포윈도우) 표시
            const infowindow = new kakao.maps.InfoWindow({
              content: '<div style="padding:5px;font-size:12px;">📍 현재 위치</div>',
              position: userPosition,
              removable: false,
            });
            infowindow.open(map, marker);
          },
          (error) => {
            console.warn('위치 접근 실패:', error);
          }
        );
      } else {
        console.warn('이 브라우저는 위치 정보를 지원하지 않습니다.');
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

  useEffect(() => {
    if (!window.kakao || !mapRef.current || !keyword) return;

    const kakao = window.kakao;
    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(keyword, (data, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const bounds = new kakao.maps.LatLngBounds();

        data.forEach((place) => {
          const pos = new kakao.maps.LatLng(place.y, place.x);
          new kakao.maps.Marker({
            map: mapRef.current,
            position: pos,
          });
          bounds.extend(pos);
        });

        mapRef.current.setBounds(bounds);
        onPlacesUpdate(data);
      } else {
        console.warn('검색 실패:', status);
        onPlacesUpdate([]);
      }
    });
  }, [keyword]);

  return <div id="map" style={{ width: '100%', height: '400px', marginTop: '20px' }} />;
};

export default KakaoMap;
