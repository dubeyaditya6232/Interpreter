import { useState, useEffect, useRef } from "react";
import { Box, Grid2 as Grid, IconButton, Typography } from "@mui/material";
import { Mic, Stop } from "@mui/icons-material";

import axios from "axios";
import SpeechHistory from "./components/SpeechHistory";

const App = () => {
  const [text, setText] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [audioSummarization, setAudioSummarization] = useState(null);
  const intervalRef = useRef(null);
  const textRef = useRef('');
  const transcriptRef = useRef('');
  const [chunks, setChunks] = useState([]);
  const [keyWords, setKeyWords] = useState([]);

  useEffect(() => {
    // Check browser support for SpeechRecognition and initialize it
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = 'en-US'; // Set language
      recognitionInstance.continuous = true; // Keep listening until manually stopped
      recognitionInstance.interimResults = true; // Show interim results

      recognitionInstance.onresult = (event) => {
        transcriptRef.current = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        setText(transcriptRef.current);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        clearInterval(intervalRef.current);
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
      setChunks([]);
      intervalRef.current = setInterval(getKeyWords, 7000);
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

  const getKeyWords = async () => {
    try {
      const newText = transcriptRef.current.substring(textRef.current.length);
      console.log({ text, newText, prevText: textRef.current, transcript: transcriptRef.current });
      if (newText === '') {
        console.log("No new text to extract key words");
        transcriptRef.current = '';
        return;
      }
      else {
        textRef.current = textRef.current.concat(newText);
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/get_keywords`,
          { text: newText },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
        const data = response.data;
        console.log(data);
        setKeyWords(data.keywords);
        setChunks(prevChunks => [...prevChunks, { "text": newText, "keywords": data.keywords, "timeStamp": new Date().toLocaleTimeString() }]);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const getKeyWordSummarization = async (keys) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/get_info_on_keyword`,
        { keyword: keys },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      const data = response.data;
      console.log(data);
      setAudioSummarization(data.information);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getAudioSummarization = async () => {
    try {
      const newText = transcriptRef.current.substring(textRef.current.length);
      console.log({ text, newText, prevText: textRef.current, transcript: transcriptRef.current });
      if (newText === '') {
        console.log("No new text to summarize");
        transcriptRef.current = '';
        return;
      }
      else {
        textRef.current = textRef.current.concat(newText);
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/get_insights`,
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
    // intervalRef.current = setInterval(getKeyWords, 7000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        m: "2rem",
        width: "100%",
        height: "96vh",
        minWidth: "320px",
        minHeight: "30vh",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
        <Typography variant="h4">Audio Recorder</Typography>
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
            <Box sx={{ maxHeight: "80vh", overflowY: "auto", scrollbarWidth: "none", minWidth: "100%" }}>
              <Typography>{text}</Typography>
            </Box>
            <Box>
              <Typography>Important Keywords</Typography>
              <SpeechHistory
                chunks={chunks}
                getKeyWordSummarization={getKeyWordSummarization}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <h3>Explanation</h3>
            </Box>
            <Box sx={{ maxHeight: "80vh", overflowY: "auto", scrollbarWidth: "none", minWidth: "100%" }}>
              {
                audioSummarization?.map((data, index) => (
                  <Box key={index}>
                    <Typography variant="h6">{data.topic}</Typography>
                    <Typography>{data.point}</Typography>
                  </Box>
                ))
              }
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default App;
