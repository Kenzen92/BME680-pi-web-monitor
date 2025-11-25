import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid } from "@mui/material";

const RealTime = () => {
  const [sensorData, setSensorData] = useState(null);
  const [flash, setFlash] = useState(false);
  const pi_ip = import.meta.env.VITE_PI_IP_ADDRESS;

  useEffect(() => {
    const socket = new WebSocket(`ws://${pi_ip}:5000/ws`);

    socket.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      setSensorData(parsedData);

      setFlash(true);
      setTimeout(() => setFlash(false), 300);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => socket.close();
  }, [pi_ip]);

  if (!sensorData) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Real-time data loading...
        </Typography>
      </Box>
    );
  }

  const readings = [
    {
      label: "Temperature",
      value: `${sensorData.temperature.toFixed(1)}°C`,
      color: "#8884d8",
    },
    {
      label: "Humidity",
      value: `${sensorData.humidity.toFixed(1)}%`,
      color: "#82ca9d",
    },
    {
      label: "Pressure",
      value: `${sensorData.pressure.toFixed(1)} hPa`,
      color: "#ffc658",
    },
    {
      label: "Gas",
      value: `${sensorData.gas.toFixed(0)} Ω`,
      color: "#cc5500",
    },
  ];

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        bgcolor: "background.paper",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ mb: 1, color: "text.secondary", textAlign: "center" }}
      >
        Current Values
      </Typography>
      <Grid container spacing={2}>
        {readings.map((reading) => (
          <Grid item xs={6} sm={3} key={reading.label}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary">
                {reading.label}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: flash ? reading.color : "text.primary",
                  transition: "color 0.3s ease-in-out",
                  fontSize: { xs: "0.9rem", sm: "1.1rem" },
                }}
              >
                {reading.value}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default RealTime;
