import React, { useEffect, useState } from "react";
import { Box, Typography, Paper } from "@mui/material";
import {
  Thermostat as ThermostatIcon,
  WaterDrop as WaterDropIcon,
  Compress as CompressIcon,
  Cloud as CloudIcon,
} from "@mui/icons-material";

const RealTime = () => {
  const [sensorData, setSensorData] = useState(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource("/events");

    eventSource.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);
      setSensorData(parsedData);

      setFlash(true);
      setTimeout(() => setFlash(false), 300);
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
    };

    return () => eventSource.close();
  }, []);

  const readings = [
    {
      label: "Temperature",
      value: sensorData ? `${sensorData.temperature.toFixed(1)}°C` : "---",
      color: "#8884d8",
      icon: ThermostatIcon,
    },
    {
      label: "Humidity",
      value: sensorData ? `${sensorData.humidity.toFixed(1)}%` : "---",
      color: "#82ca9d",
      icon: WaterDropIcon,
    },
    {
      label: "Pressure",
      value: sensorData ? `${sensorData.pressure.toFixed(1)} hPa` : "---",
      color: "#ffc658",
      icon: CompressIcon,
    },
    {
      label: "Gas",
      value: sensorData ? `${sensorData.gas.toFixed(0)} Ω` : "---",
      color: "#cc5500",
      icon: CloudIcon,
    },
  ];

  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 1, sm: 2 },
        bgcolor: "background.paper",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        maxWidth: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: { xs: 1, sm: 2 },
          width: "100%",
        }}
      >
        {readings.map((reading) => {
          const IconComponent = reading.icon;
          return (
            <Box
              key={reading.label}
              sx={{
                flex: { xs: "1 1 calc(50% - 4px)", sm: "1 1 calc(25% - 12px)" },
                minWidth: { xs: "120px", sm: "0" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  p: { xs: 1, sm: 1 },
                  borderRadius: 2,
                  bgcolor: `${reading.color}15`,
                  border: "2px solid",
                  borderColor: reading.color,
                  transition: "all 0.3s ease-in-out",
                  transform: flash ? "scale(1.05)" : "scale(1)",
                  height: "100%",
                }}
              >
                <IconComponent
                  sx={{
                    fontSize: { xs: 28, sm: 32, md: 40 },
                    color: reading.color,
                    mb: { xs: 0.5, sm: 1 },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.secondary",
                    mb: 0.5,
                    fontWeight: 500,
                    fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.85rem" },
                  }}
                >
                  {reading.label}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    color: reading.color,
                    fontSize: { xs: "0.7rem", sm: "0.75rem", md: "1rem" },
                    lineHeight: 1.2,
                  }}
                >
                  {reading.value}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default RealTime;
