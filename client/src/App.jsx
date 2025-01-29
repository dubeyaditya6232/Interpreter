import React, { useState, useEffect, useRef } from "react";
import { Box, Grid2 as Grid, IconButton, Typography } from "@mui/material";
import { Mic, Stop } from "@mui/icons-material";

import axios from "axios";

const App = () => {
  const [text, setText] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [audioSummarization, setAudioSummarization] = useState(null);
  const intervalRef = useRef(null);
  const textRef = useRef(null);
  let transcript = '';
  useEffect(() => {
    // Check browser support for SpeechRecognition and initialize it
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = 'en-US'; // Set language
      recognitionInstance.continuous = true; // Keep listening until manually stopped
      recognitionInstance.interimResults = true; // Show interim results

      recognitionInstance.onresult = (event) => {
        transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        setText(transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
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
      console.log("Recognition started....setting isListening to true");
      setIsListening(true);
      recognition.start();
    }
  };

  // Stop speech recognition
  const stopListening = () => {
    if (recognition) {
      console.log("Recognition stopped....setting isListening to false");
      recognition.stop();
      setIsListening(false);
    }
  };

  const getAudioSummarization = async () => {
    try {
      const newText = transcript.replace(textRef.current, '');
      console.log({ text, newText, prevText: textRef.current, transcript });
      textRef.current = newText;
      if (newText === '') {
        console.log("No new text to summarize");
        transcript = '';
        return;
      }
      else {
        const response = await axios.post(
          import.meta.env.VITE_SERVER_URL,
          { text: newText },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        const data = response.data;
        console.log(data);
        setAudioSummarization(prevData => prevData + "\n\n" + data.insights);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    intervalRef.current = setInterval(getAudioSummarization, 7000);
    return () => clearInterval(intervalRef.current);
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
        {!isListening ? (
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
      {text && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <h3>Translation</h3>
            </Box>
            <Box sx={{ maxHeight: "30vh", overflowY: "auto", scrollbarWidth: "none", minWidth: "100%" }}>
              <Typography>{text}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <h3>Explanation</h3>
            </Box>
            <Box sx={{ maxHeight: "30vh", overflowY: "auto", scrollbarWidth: "none", minWidth: "100%" }}>
              <Typography>{audioSummarization}</Typography>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default App;
