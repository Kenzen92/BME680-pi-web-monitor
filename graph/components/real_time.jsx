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

  useEffect(() => {
    const socket = new WebSocket("ws://raspberrypi:5000/ws");
    console.log(socket);

    socket.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      setSensorData(parsedData);
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
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <Typography>
            Temperature: {sensorData.temperature.toFixed(2)} °C
          </Typography>
          <Typography>Humidity: {sensorData.humidity.toFixed(1)} %</Typography>
          <Typography>
            Pressure: {sensorData.pressure.toFixed(1)} hPa
          </Typography>
        </Box>
      ) : (
        <Typography>Loading...</Typography>
      )}
    </Box>
  );
};

export default RealTime;
