import React, { useState, useEffect } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { Mic, Stop } from "@mui/icons-material";

import axios from "axios";

const App = () => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [audioSummarization, setAudioSummarization] = useState('');

  console.log(import.meta.env)

  useEffect(() => {
    // Check browser support for SpeechRecognition and initialize it
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = 'en-US'; // Set language
      recognitionInstance.continuous = true; // Keep listening until manually stopped
      recognitionInstance.interimResults = true; // Show interim results

      recognitionInstance.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        setText(transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
        setIsListening(false);
        console.log("Recognition ended. Ready to restart.");
      };

      setRecognition(recognitionInstance);
    } else {
      alert('Your browser does not support Web Speech API.');
    }
  }, []);

  // Start speech recognition
  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      setIsRecording(true);
      recognition.start();
    }
  };

  // Stop speech recognition
  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const getAudioSummarization = async () => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_SERVER_URL,
        { text },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      const data = response.data;
      console.log(data);
      setAudioSummarization(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(getAudioSummarization, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        m: "2rem",
        width: "100%",
        height: "50vh",
        minWidth: "320px",
        minHeight: "97vh",
      }}
    >
      <h1>Audio Recorder</h1>
      <Box>
        {!isRecording ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <IconButton color="primary" onClick={startListening} disabled={isListening}>
              <Mic />
            </IconButton>
            <Typography>Start Recording</Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <IconButton color="secondary" onClick={stopListening} disabled={!isListening}>
              <Stop />
            </IconButton>
            <Typography>Stop Recording</Typography>
          </Box>
        )}
      </Box>
      {audioSummarization && (
        <>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <h3>Translation:</h3>
          </Box>
          <Box>
            <Typography>{audioSummarization}</Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default App;
