import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

const RealTime = () => {
  const [sensorData, setSensorData] = useState(null);
  const [flash, setFlash] = useState(false);
  const pi_ip = import.meta.env.VITE_PI_IP_ADDRESS;

  const realTimeStyles = {display: "flex", flexDirection: "column", p: 2, justifyContent: "center"};

  useEffect(() => {
    const socket = new WebSocket(`ws://${pi_ip}:5000/ws`);

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
    <Box>
      {sensorData ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flexWrap: "wrap",
            marginLeft: "auto",
            marginRight: "auto",
            alignItems: "center",
            padding: 2,
            maxWidth: "40rem",
          }}
        >
          <Typography sx={{ alignContent: "center" }}>
            Current Values
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Box sx={{ ...realTimeStyles }}>
              <Typography>Temperature</Typography>
              <Typography
                sx={{
                  fontWeight: "bold",
                  color: flash
                    ? "rgb(255, 255, 255)"
                    : "rgba(255, 255, 255, 0.7)",
                  transition: "background-color 0.3s ease-in-out",
                }}
              >
                {sensorData.temperature.toFixed(1) + "°" + "C"}
              </Typography>
            </Box>

            <Box sx={{ ...realTimeStyles }}>
              <Typography>Humidity</Typography>
              <Typography
                sx={{
                  fontWeight: "bold",
                  color: flash
                    ? "rgb(255, 255, 255)"
                    : "rgba(255, 255, 255, 0.7)",
                  transition: "background-color 0.3s ease-in-out",
                }}
              >
                {sensorData.humidity.toFixed(1) + "%"}
              </Typography>
            </Box>

            <Box sx={{ ...realTimeStyles }}>
              <Typography>Air Pressure</Typography>
              <Typography
                sx={{
                  fontWeight: "bold",
                  color: flash
                    ? "rgb(255, 255, 255)"
                    : "rgba(255, 255, 255, 0.7)",
                  transition: "background-color 0.3s ease-in-out",
                }}
              >
                {sensorData.pressure.toFixed(1) + "hPa"}
              </Typography>
            </Box>

            <Box sx={{ ...realTimeStyles }}>
              <Typography>Air Resistance</Typography>
              <Typography
                sx={{
                  fontWeight: "bold",
                  color: flash
                    ? "rgb(255, 255, 255)"
                    : "rgba(255, 255, 255, 0.7)",
                  transition: "background-color 0.3s ease-in-out",
                }}
              >
                {sensorData.gas.toFixed(1) + "Ω"}
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ mt: "1em", height: "3em" }}>
          <Typography>Real-time data loading...</Typography>
        </Box>
      )}
    </Box>
  );
};

export default RealTime;
