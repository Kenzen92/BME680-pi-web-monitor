import React from "react";
import BaseGraph from "./base_graph.jsx";
import { Box, IconButton } from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

export const TemperatureGraph = ({ data, isFullScreen, onToggleFullScreen }) => (
  <Box sx={{ minWidth: "300px", position: "relative" }}>
    <h2>Temperature (°C)</h2>
    <IconButton
      sx={{ position: "absolute", top: 8, right: 8 }}
      onClick={onToggleFullScreen}
    >
      {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
    </IconButton>
    <BaseGraph
      data={data}
      dataKey="temperature"
      stroke="#8884d8"
      yAxisLabel="Temperature (°C)"
      isFullScreen={isFullScreen}
    />
  </Box>
);

export const HumidityGraph = ({ data, isFullScreen, onToggleFullScreen }) => (
  <Box sx={{ minWidth: "300px", position: "relative" }}>
    <h2>Humidity (%)</h2>
    <IconButton
      sx={{ position: "absolute", top: 8, right: 8 }}
      onClick={onToggleFullScreen}
    >
      {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
    </IconButton>
    <BaseGraph
      data={data}
      dataKey="humidity"
      stroke="#82ca9d"
      yAxisLabel="Humidity (%)"
      isFullScreen={isFullScreen}
    />
  </Box>
);

export const PressureGraph = ({ data, isFullScreen, onToggleFullScreen }) => (
  <Box sx={{ minWidth: "300px", position: "relative" }}>
    <h2>Pressure (hPa)</h2>
    <IconButton
      sx={{ position: "absolute", top: 8, right: 8 }}
      onClick={onToggleFullScreen}
    >
      {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
    </IconButton>
    <BaseGraph
      data={data}
      dataKey="pressure"
      stroke="#ffc658"
      yAxisLabel="Pressure (hPa)"
      isFullScreen={isFullScreen}
    />
  </Box>
);

export const GasResistanceGraph = ({ data, isFullScreen, onToggleFullScreen }) => (
  <Box sx={{ minWidth: "300px", position: "relative" }}>
    <h2>Gas Resistance (Ω)</h2>
    <IconButton
      sx={{ position: "absolute", top: 8, right: 8 }}
      onClick={onToggleFullScreen}
    >
      {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
    </IconButton>
    <BaseGraph
      data={data}
      dataKey="gas"
      stroke="#cc5500"
      yAxisLabel="Gas Resistance (Ω)"
      isFullScreen={isFullScreen}
    />
  </Box>
);