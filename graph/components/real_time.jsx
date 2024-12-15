import React, { useEffect, useState } from "react";
import {
  Tabs,
  Tab,
  useMediaQuery,
  Box,
  Button,
  Typography,
} from "@mui/material";

const RealTime = () => {
  const [sensorData, setSensorData] = useState(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const socket = new WebSocket("ws://raspberrypi:5000/ws");

    socket.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      setSensorData(parsedData);

      setFlash(true);
      setTimeout(() => setFlash(false), 300); // Flash lasts 300ms
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => socket.close();
  }, []);

  return (
    <Box m={5}>
      {sensorData ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flexWrap: "wrap",
            justifyContent: "center",
            borderRadius: 2,
            padding: 3,
            boxShadow:
              "0px 4px 6px rgba(0, 0, 0, 0.6), 0px 1px 3px rgba(0, 0, 0, 0.4)"
          }}
        >
          {" "}
          <Typography sx={{ alignContent: "center" }}>
            Current Values:
          </Typography>
          <Box
            sx={{
              marginTop: 2,
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 5,
              justifyContent: "center",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography>Temperature</Typography>
              <Typography  sx={{  
                color: flash
              ? "rgb(255, 255, 255)"
              : "rgba(255, 255, 255, 0.7)",
            transition: "background-color 0.3s ease-in-out" 
            }}>
                {sensorData.temperature.toFixed(1) + "°" + "C"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography>Humidity</Typography>
              <Typography  sx={{  
                color: flash
              ? "rgb(255, 255, 255)"
              : "rgba(255, 255, 255, 0.7)",
            transition: "background-color 0.3s ease-in-out" 
            }}>{sensorData.humidity.toFixed(1) + "%"}</Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography>Air Pressure</Typography>
              <Typography  sx={{  
                color: flash
              ? "rgb(255, 255, 255)"
              : "rgba(255, 255, 255, 0.7)",
            transition: "background-color 0.3s ease-in-out" 
            }}>{sensorData.pressure.toFixed(1) + "hPa"}</Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <Typography>Loading...</Typography>
      )}
    </Box>
  );
};

export default RealTime;
