import React, { useState, useEffect, useRef } from 'react';
import './VoiceRecorder.css';

const VoiceRecorder = ({ onTranscript }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    // 브라우저 호환성 체크
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR'; // 한국어
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      onTranscript(result); // 부모 컴포넌트에 전달
    };

    recognition.onerror = (event) => {
      console.error('음성 인식 오류:', event.error);
    };

    recognitionRef.current = recognition;
  }, [onTranscript]);

  const startRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="voice-recorder">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={isRecording ? 'recording' : ''}
      >
        {isRecording ? '🎙️ 녹음 중... 클릭하여 정지' : '🎤 클릭하여 증상 말하기'}
      </button>
      {transcript && (
        <p className="transcript">🗣 인식된 텍스트: <strong>{transcript}</strong></p>
      )}
    </div>
  );
};

export default VoiceRecorder;
