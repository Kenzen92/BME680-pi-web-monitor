import React from "react";
import BaseGraph from "./base_graph.jsx";
import { Box } from "@mui/material";

export const TemperatureGraph = ({ data, isSmallScreen, isFullscreen }) => (
  <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
    {!isFullscreen && <h2 style={{ margin: "0 0 8px 0" }}>Temperature (°C)</h2>}
    <Box sx={{ flex: 1, minHeight: 0 }}>
      <BaseGraph
        data={data}
        dataKey="temperature"
        stroke="#8884d8"
        yAxisLabel="Temperature (°C)"
        isSmallScreen={isSmallScreen}
        isFullscreen={isFullscreen}
      />
    </Box>
  </Box>
);

export const HumidityGraph = ({ data, isSmallScreen, isFullscreen }) => (
  <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
    {!isFullscreen && <h2 style={{ margin: "0 0 8px 0" }}>Humidity (%)</h2>}
    <Box sx={{ flex: 1, minHeight: 0 }}>
      <BaseGraph
        data={data}
        dataKey="humidity"
        stroke="#82ca9d"
        yAxisLabel="Humidity (%)"
        isSmallScreen={isSmallScreen}
        isFullscreen={isFullscreen}
      />
    </Box>
  </Box>
);

export const PressureGraph = ({ data, isSmallScreen, isFullscreen }) => (
  <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
    {!isFullscreen && <h2 style={{ margin: "0 0 8px 0" }}>Pressure (hPa)</h2>}
    <Box sx={{ flex: 1, minHeight: 0 }}>
      <BaseGraph
        data={data}
        dataKey="pressure"
        stroke="#ffc658"
        yAxisLabel="Pressure (hPa)"
        isSmallScreen={isSmallScreen}
        isFullscreen={isFullscreen}
      />
    </Box>
  </Box>
);

export const GasResistanceGraph = ({ data, isSmallScreen, isFullscreen }) => (
  <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
    {!isFullscreen && <h2 style={{ margin: "0 0 8px 0" }}>Gas Resistance (Ω)</h2>}
    <Box sx={{ flex: 1, minHeight: 0 }}>
      <BaseGraph
        data={data}
        dataKey="gas"
        stroke="#cc5500"
        yAxisLabel="Gas Resistance (Ω)"
        isSmallScreen={isSmallScreen}
        isFullscreen={isFullscreen}
      />
    </Box>
  </Box>
);
