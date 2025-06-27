import React, { useState } from 'react';
import VoiceRecorder from '../../Components/VoiceRecorder';
import HospitalList from '../../Components/HospitalList';
import KakaoMap from '../../Components/KakaoMap';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api'; // 백엔드 Spring API 주소

const MainPage = () => {
  const [symptom, setSymptom] = useState('');
  const [department, setDepartment] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState({ lat: 37.5665, lng: 126.9780 });

  // 거리 계산 함수 (Haversine 공식)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // 텍스트 읽어주는 TTS
  const speakText = (text) => {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ko-KR';
    synth.speak(utter);
  };

  // 증상 분석 및 병원 검색
  const analyzeSymptom = async (symptomText) => {
    setLoading(true);
    setError('');
    setSymptom(symptomText);

    try {
      const analyzeResponse = await axios.post(`${API_BASE_URL}/analyze-symptom`, {
        symptom: symptomText
      });

      const recommendedDepartment = analyzeResponse.data.department;
      setDepartment(recommendedDepartment);
      speakText(`${recommendedDepartment} 진료과를 추천합니다.`);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setUserLocation({ lat, lng });
            await searchHospitals(recommendedDepartment, lat, lng);
          },
          async () => {
            await searchHospitals(recommendedDepartment, userLocation.lat, userLocation.lng);
          }
        );
      } else {
        await searchHospitals(recommendedDepartment, userLocation.lat, userLocation.lng);
      }
    } catch (err) {
      console.error('분석 오류:', err);
      setError('증상 분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 병원 검색 API 호출
  const searchHospitals = async (department, lat, lng) => {
    try {
      const searchResponse = await axios.get(`${API_BASE_URL}/search-hospitals`, {
        params: { department, lat, lng }
      });

      const sorted = searchResponse.data
        .map(h => ({
          ...h,
          distance: calculateDistance(lat, lng, h.lat, h.lng)
        }))
        .sort((a, b) => a.distance - b.distance);

      setHospitals(sorted);
      speakText(`${sorted.length}개의 병원을 찾았습니다. 가까운 순으로 정렬합니다.`);
    } catch (err) {
      console.error('병원 검색 오류:', err);
      setError('병원 검색 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="main-page">
      <h1>🎤 증상 말하고 병원 찾기</h1>

      <VoiceRecorder onTranscript={analyzeSymptom} />

      {loading && <p>⏳ 증상 분석 중입니다...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {symptom && !loading && (
        <div className="result-section">
          <h3>📝 입력한 증상:</h3>
          <p>{symptom}</p>
          {department && (
            <>
              <h3>🔍 추천 진료과:</h3>
              <p>{department}</p>
            </>
          )}
        </div>
      )}

      {hospitals.length > 0 && (
        <>
          <HospitalList hospitals={hospitals} userLocation={userLocation} />
          <KakaoMap hospitals={hospitals} userLocation={userLocation} />
        </>
      )}
    </div>
  );
};

export default MainPage;
