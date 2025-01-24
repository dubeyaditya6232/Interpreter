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
      setText('');
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
      setAudioSummarization(data.insights);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (isListening) {
      console.log("Interval started");
      intervalRef.current = setInterval(getAudioSummarization, 15000);
    } else {
      console.log("Listening stopped. Interval cleared");
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isListening]);

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
            <Box sx={{ maxHeight: "20vh", overflowY: "auto", scrollbarWidth: "none" }}>
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <h3>Translation:</h3>
              </Box>
              {/* <Typography>{text}</Typography> */}
              <Typography>There is a directed graph of end notes with each node labeled from zero to north -1. The graph is represented by a zero index to the integer array. The graph I is an integer array of nodes adjacent to node I. Meaning there is an age from not I to each node in graph I. A note is a terminal load if there are no outgoing edges. A node is a safe node if every possible pass starting from that node leads to a terminal node or another safe node.</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box>
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <h3>Explanation:</h3>
              </Box>
              {/* <Typography>{audioSummarization}</Typography> */}
              <Typography>There is a directed graph of end notes with each node labeled from zero to north -1. The graph is represented by a zero index to the integer array. The graph I is an integer array of nodes adjacent to node I. Meaning there is an age from not I to each node in graph I. A note is a terminal load if there are no outgoing edges. A node is a safe node if every possible pass starting from that node leads to a terminal node or another safe node.</Typography>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default App;
