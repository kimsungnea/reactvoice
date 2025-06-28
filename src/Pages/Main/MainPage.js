import React, { useState } from 'react';
import VoiceRecorder from '../../Components/VoiceRecorder';
import axios from 'axios';
import MapPage from '../Map/MapPage';

const API_BASE_URL = 'http://localhost:8080/api';

const MainPage = () => {
  const [symptom, setSymptom] = useState('');
  const [department, setDepartment] = useState('');
  const [recommendedHospitals, setRecommendedHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState({ lat: 37.5665, lng: 126.9780 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeSymptom = async (symptomText) => {
    try {
      setLoading(true);
      setSymptom(symptomText);

      // GPT 분석
      const res = await axios.post(`${API_BASE_URL}/analyze-symptom`, { symptom: symptomText });
      const recommendedDepartment = res.data.department;
      setDepartment(recommendedDepartment);

      // Spring 검색
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setUserLocation({ lat, lng });

            const response = await axios.get(`${API_BASE_URL}/search-hospitals`, {
              params: { department: recommendedDepartment, lat, lng }
            });
            setRecommendedHospitals(response.data);
          },
          async () => {
            const response = await axios.get(`${API_BASE_URL}/search-hospitals`, {
              params: { department: recommendedDepartment, lat: userLocation.lat, lng: userLocation.lng }
            });
            setRecommendedHospitals(response.data);
          }
        );
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

      <MapPage
        recommendedHospitals={recommendedHospitals}
        userLocation={userLocation}
      />
    </div>
  );
};

export default MainPage;
