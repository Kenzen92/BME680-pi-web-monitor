import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid } from "@mui/material";
import {
  Thermostat as ThermostatIcon,
  WaterDrop as WaterDropIcon,
  Compress as CompressIcon,
  Cloud as CloudIcon,
} from "@mui/icons-material";

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
      icon: ThermostatIcon,
    },
    {
      label: "Humidity",
      value: `${sensorData.humidity.toFixed(1)}%`,
      color: "#82ca9d",
      icon: WaterDropIcon,
    },
    {
      label: "Pressure",
      value: `${sensorData.pressure.toFixed(1)} hPa`,
      color: "#ffc658",
      icon: CompressIcon,
    },
    {
      label: "Gas",
      value: `${sensorData.gas.toFixed(0)} Ω`,
      color: "#cc5500",
      icon: CloudIcon,
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
      <Grid container spacing={2}>
        {readings.map((reading) => {
          const IconComponent = reading.icon;
          return (
            <Grid item xs={6} sm={3} key={reading.label}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 2,
                  borderRadius: 2,
                  bgcolor: `${reading.color}15`,
                  border: "2px solid",
                  borderColor: reading.color,
                  transition: "all 0.3s ease-in-out",
                  transform: flash ? "scale(1.05)" : "scale(1)",
                }}
              >
                <IconComponent
                  sx={{
                    fontSize: 40,
                    color: reading.color,
                    mb: 1,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.secondary",
                    mb: 0.5,
                    fontWeight: 500,
                  }}
                >
                  {reading.label}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    color: reading.color,
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                    minWidth: "100px",
                    display: "inline-block",
                  }}
                >
                  {reading.value}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

export default RealTime;
