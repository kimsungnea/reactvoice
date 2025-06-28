import React, { useState, useEffect } from 'react';
import VoiceRecorder from '../../Components/VoiceRecorder';
import axios from 'axios';
import MapPage from '../Map/MapPage';

const API_BASE_URL = 'http://localhost:8080/api';

const MainPage = () => {
  const [symptom, setSymptom] = useState('');
  const [department, setDepartment] = useState('');
  const [recommendedHospitals, setRecommendedHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState(null);  // ⭐️ 변경
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ⭐️ 페이지 진입 시 내 위치 우선
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (error) => {
          console.warn("위치 권한 거부, fallback", error);
          setUserLocation({
            lat: 37.5665,
            lng: 126.9780
          });
        }
      );
    } else {
      console.warn("geolocation 미지원, fallback");
      setUserLocation({
        lat: 37.5665,
        lng: 126.9780
      });
    }
  }, []);

  const analyzeSymptom = async (symptomText) => {
    try {
      setLoading(true);
      setSymptom(symptomText);

      const res = await axios.post(`${API_BASE_URL}/analyze-symptom`, { symptom: symptomText });
      const recommendedDepartment = res.data.department;
      setDepartment(recommendedDepartment);

      if (userLocation) {
        const response = await axios.get(`${API_BASE_URL}/search-hospitals`, {
          params: {
            department: recommendedDepartment,
            lat: userLocation.lat,
            lng: userLocation.lng
          }
        });
        setRecommendedHospitals(response.data);
      } else {
        console.warn("아직 userLocation을 알 수 없어 병원 검색 못함");
      }
    } catch (e) {
      console.error(e);
      setError('분석 또는 병원 검색 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>🎤 증상 말하고 병원 찾기</h1>
      <VoiceRecorder onTranscript={analyzeSymptom} />
      {loading && <p>⏳ 증상 분석 중...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {department && <h3>추천 진료과: {department}</h3>}

      {userLocation && (
        <MapPage
          recommendedHospitals={recommendedHospitals}
          userLocation={userLocation}
        />
      )}
    </div>
  );
};

export default MainPage;
