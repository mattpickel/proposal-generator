/**
 * VoiceMemoButton Component
 *
 * A reusable button that records voice and transcribes it using the Web Speech API.
 * Provides visual feedback during recording and handles browser compatibility.
 */

import { useState, useRef, useEffect } from 'react';

// Check for browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function VoiceMemoButton({ onTranscript, disabled = false }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported] = useState(!!SpeechRecognition);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startRecording = () => {
    if (!isSupported || disabled) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);

      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access to use voice input.');
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (finalTranscript.trim()) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (!isSupported) {
    return (
      <button
        className="voice-memo-btn unsupported"
        disabled
        title="Voice input not supported in this browser"
      >
        🎤
      </button>
    );
  }

  return (
    <button
      className={`voice-memo-btn ${isRecording ? 'recording' : ''}`}
      onClick={handleClick}
      disabled={disabled}
      title={isRecording ? 'Click to stop recording' : 'Click to record voice memo'}
      type="button"
    >
      {isRecording ? '⏹️' : '🎤'}
    </button>
  );
}
