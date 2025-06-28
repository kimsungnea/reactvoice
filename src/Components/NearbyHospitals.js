import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NearbyHospitals = ({ recommendedHospitals = [], userLocation, mapRef }) => {
  const navigate = useNavigate();
  const [radius, setRadius] = useState(1000);
  const [nearby, setNearby] = useState([]);

  useEffect(() => {
    if (!mapRef.current || !window.kakao) return;

    const ps = new window.kakao.maps.services.Places();
    const center = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng);

    ps.keywordSearch('병원', (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setNearby(data);
      }
    }, { location: center, radius });

  }, [radius, mapRef, userLocation]);

  const handleNav = (h) => {
    navigate('/nav', {
      state: {
        hospital: {
          name: h.place_name || h.placeName,
          lat: parseFloat(h.y),
          lng: parseFloat(h.x),
        },
        userLocation,
      },
    });
  };

  return (
    <div style={{ marginTop: '10px' }}>
      {/* 추천 병원 버튼 */}
      {recommendedHospitals.length > 0 && (
        <>
          <h3> 추천 병원</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {recommendedHospitals.map((h, idx) => (
              <li key={idx} style={{ marginBottom: '10px' }}>
                <button
                  onClick={() => handleNav(h)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                  }}
                >
                  <strong>{h.placeName}</strong><br />
                  {h.addressName}<br />
                  {h.phone && <> {h.phone}</>}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* 반경 검색 병원 */}
      <h3>🏥 주변 병원(반경 {radius / 1000}km)</h3>
      <select onChange={(e) => setRadius(Number(e.target.value))} value={radius}>
        {[1000, 2000, 5000].map((r) => (
          <option key={r} value={r}>{r / 1000}km</option>
        ))}
      </select>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
        {nearby.map((h, idx) => (
          <li key={idx} style={{ marginBottom: '10px' }}>
            <button
              onClick={() => handleNav(h)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '8px',
              }}
            >
              <strong>{h.place_name}</strong><br />
              {h.address_name}<br />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NearbyHospitals;
