import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './NavigationPage.css';

const NavigationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hospital, userLocation } = location.state || {};

  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const userMarkerRef = useRef(null);
  const watchIdRef = useRef(null);
  
  const [eta, setEta] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(userLocation);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!hospital || !userLocation) {
      setError('병원 또는 위치 정보가 없습니다.');
      return;
    }

    if (!window.kakao || !window.kakao.maps) {
      setError('카카오 지도를 불러올 수 없습니다.');
      return;
    }

    const kakao = window.kakao;
    const container = document.getElementById('nav-map');
    
    if (!container) {
      setError('지도 컨테이너를 찾을 수 없습니다.');
      return;
    }

    const map = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(userLocation.lat, userLocation.lng),
      level: 3,
    });
    
    mapRef.current = map;
    setMapLoaded(true);

    const destPos = new kakao.maps.LatLng(hospital.lat, hospital.lng);

    // 병원 마커
    const hospitalMarker = new kakao.maps.Marker({
      map,
      position: destPos,
      title: hospital.name,
      image: new kakao.maps.MarkerImage(
        'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
        new kakao.maps.Size(40, 42)
      ),
    });

    // 병원 정보창
    const hospitalInfoWindow = new kakao.maps.InfoWindow({
      map,
      position: destPos,
      content: `
        <div style="padding:15px;font-size:14px;min-width:200px;">
          <strong style="color:#e53e3e;">🏥 ${hospital.name}</strong><br>
          <div style="margin-top:8px;color:#666;">
            📍 ${hospital.address}<br>
            ${hospital.phone ? `📞 ${hospital.phone}` : ''}
          </div>
        </div>
      `,
      removable: false,
    });

    // 실시간 위치 추적 시작
    startLocationTracking();

    return () => {
      stopLocationTracking();
    };
  }, [hospital, userLocation]);

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      setError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    setIsTracking(true);
    setError('');

    const options = {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000,
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      updateLocation,
      handleLocationError,
      options
    );
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  const updateLocation = async (position) => {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    const accuracy = position.coords.accuracy;
    
    const newUserLocation = { lat: userLat, lng: userLng };
    setCurrentLocation(newUserLocation);

    if (!mapRef.current || !window.kakao) return;

    const kakao = window.kakao;
    const userPos = new kakao.maps.LatLng(userLat, userLng);

    // 내 위치 마커 업데이트
    if (!userMarkerRef.current) {
      userMarkerRef.current = new kakao.maps.Marker({
        map: mapRef.current,
        position: userPos,
        title: '내 위치',
        image: new kakao.maps.MarkerImage(
          'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
          new kakao.maps.Size(30, 35)
        ),
      });

      // 내 위치 정보창
      new kakao.maps.InfoWindow({
        map: mapRef.current,
        position: userPos,
        content: `
          <div style="padding:8px;font-size:12px;">
            📍 내 위치 (정확도: ${Math.round(accuracy)}m)
          </div>
        `,
        removable: false,
      });
    } else {
      userMarkerRef.current.setPosition(userPos);
    }

    // 경로 업데이트
    await updateRoute(newUserLocation);
  };

  const handleLocationError = (error) => {
    console.error('위치 추적 오류:', error);
    let errorMessage = '위치를 가져올 수 없습니다.';
    
    switch(error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = '위치 정보를 사용할 수 없습니다.';
        break;
      case error.TIMEOUT:
        errorMessage = '위치 요청 시간이 초과되었습니다.';
        break;
    }
    
    setError(errorMessage);
    setIsTracking(false);
  };

  const updateRoute = async (currentPos) => {
    if (!process.env.REACT_APP_KAKAO_REST_API_KEY) {
      console.warn('카카오 REST API 키가 설정되지 않았습니다.');
      return;
    }

    try {
      const response = await fetch(
        `https://apis-navi.kakaomobility.com/v1/directions?origin=${currentPos.lng},${currentPos.lat}&destination=${hospital.lng},${hospital.lat}&summary=true`,
        {
          headers: {
            Authorization: `KakaoAK ${process.env.REACT_APP_KAKAO_REST_API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('길찾기 API 요청 실패');
      }

      const data = await response.json();

      if (data.routes && data.routes[0]) {
        const section = data.routes[0].sections[0];
        
        // 경로 그리기
        if (section.roads) {
          const linePath = [];
          section.roads.forEach((road) => {
            for (let i = 0; i < road.vertexes.length; i += 2) {
              const lng = road.vertexes[i];
              const lat = road.vertexes[i + 1];
              linePath.push(new window.kakao.maps.LatLng(lat, lng));
            }
          });

          if (polylineRef.current) {
            polylineRef.current.setMap(null);
          }

          polylineRef.current = new window.kakao.maps.Polyline({
            map: mapRef.current,
            path: linePath,
            strokeWeight: 6,
            strokeColor: '#007bff',
            strokeOpacity: 0.8,
            strokeStyle: 'solid',
          });
        }

        // ETA 정보 업데이트
        setEta({
          distance: (section.distance / 1000).toFixed(1),
          duration: Math.ceil(section.duration / 60),
          roadName: section.roads?.[0]?.name || '경로',
        });

        // 지도 범위 조정
        const bounds = new window.kakao.maps.LatLngBounds();
        bounds.extend(new window.kakao.maps.LatLng(currentPos.lat, currentPos.lng));
        bounds.extend(new window.kakao.maps.LatLng(hospital.lat, hospital.lng));
        mapRef.current.setBounds(bounds);
      }
    } catch (err) {
      console.warn('길찾기 요청 실패:', err);
      setError('경로를 가져올 수 없습니다. 네트워크 연결을 확인해주세요.');
    }
  };

  const handleCall = () => {
    if (hospital.phone) {
      window.location.href = `tel:${hospital.phone}`;
    } else {
      alert('전화번호가 등록되지 않은 병원입니다.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${hospital.name} 길찾기`,
          text: `${hospital.name}으로 가는 중입니다.`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('공유 취소됨');
      }
    } else {
      // 폴백: 클립보드에 복사
      try {
        await navigator.clipboard.writeText(
          `${hospital.name} - ${hospital.address} ${hospital.phone ? `(${hospital.phone})` : ''}`
        );
        alert('병원 정보가 클립보드에 복사되었습니다.');
      } catch (err) {
        alert('공유 기능을 사용할 수 없습니다.');
      }
    }
  };

  if (!hospital || !userLocation) {
    return (
      <div className="navigation-container">
        <div className="error-screen">
          <div className="error-icon">⚠️</div>
          <h2>정보가 부족합니다</h2>
          <p>병원 또는 위치 정보가 없습니다.</p>
          <button onClick={() => navigate('/')} className="back-btn">
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="navigation-container">
      {/* 헤더 */}
      <header className="navigation-header">
        <button 
          onClick={() => navigate(-1)} 
          className="back-button"
        >
          ← 뒤로
        </button>
        <h1>🧭 길안내</h1>
        <button 
          onClick={handleShare}
          className="share-button"
        >
          📤
        </button>
      </header>

      {/* 병원 정보 카드 */}
      <div className="hospital-info-card">
        <div className="hospital-details">
          <h2>🏥 {hospital.name}</h2>
          <p>📍 {hospital.address}</p>
          {hospital.phone && (
            <p>📞 {hospital.phone}</p>
          )}
        </div>
        <button onClick={handleCall} className="call-button">
          📞 전화
        </button>
      </div>

      {/* ETA 정보 */}
      {eta && (
        <div className="eta-card">
          <div className="eta-info">
            <div className="eta-item">
              <span className="eta-label">거리</span>
              <span className="eta-value">{eta.distance}km</span>
            </div>
            <div className="eta-item">
              <span className="eta-label">예상시간</span>
              <span className="eta-value">{eta.duration}분</span>
            </div>
            <div className="eta-item">
              <span className="eta-label">경로</span>
              <span className="eta-value">{eta.roadName}</span>
            </div>
          </div>
          <div className="tracking-status">
            {isTracking ? (
              <span className="tracking-active">🟢 추적 중</span>
            ) : (
              <span className="tracking-inactive">🔴 추적 정지</span>
            )}
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button 
            onClick={startLocationTracking}
            className="retry-location-btn"
          >
            재시도
          </button>
        </div>
      )}

      {/* 지도 */}
      <div className="map-container">
        <div
          id="nav-map"
          className={`navigation-map ${mapLoaded ? 'loaded' : 'loading'}`}
        />
        {!mapLoaded && (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <p>지도를 불러오는 중...</p>
          </div>
        )}
      </div>

      {/* 컨트롤 버튼들 */}
      <div className="navigation-controls">
        <button 
          onClick={isTracking ? stopLocationTracking : startLocationTracking}
          className={`control-btn ${isTracking ? 'active' : ''}`}
        >
          {isTracking ? '📍 추적 중지' : '📍 추적 시작'}
        </button>
        <button 
          onClick={() => updateRoute(currentLocation)}
          className="control-btn"
        >
          🔄 경로 새로고침
        </button>
        <button 
          onClick={() => mapRef.current?.setLevel(3)}
          className="control-btn"
        >
          🎯 중심으로
        </button>
      </div>

      {/* 응급 연락 */}
      <div className="emergency-footer">
        <button 
          onClick={() => window.location.href = 'tel:119'}
          className="emergency-call-btn"
        >
          🚨 응급상황 119 신고
        </button>
      </div>
    </div>
  );
};

export default NavigationPage;