import React from "react";
import BaseGraph from "./base_graph.jsx";
import { Box } from "@mui/material";

export const TemperatureGraph = ({ data, chosenDays, isSmallScreen }) => (
  <Box sx={{ minWidth: "300px", position: "relative" }}>
    <h2>Temperature (°C)</h2>
    <BaseGraph
      data={data}
      dataKey="temperature"
      stroke="#8884d8"
      yAxisLabel="Temperature (°C)"
      chosenDays={chosenDays}
      isSmallScreen={isSmallScreen}
    />
  </Box>
);

export const HumidityGraph = ({ data, chosenDays, isSmallScreen }) => (
  <Box sx={{ minWidth: "300px", position: "relative" }}>
    <h2>Humidity (%)</h2>
    <BaseGraph
      data={data}
      dataKey="humidity"
      stroke="#82ca9d"
      yAxisLabel="Humidity (%)"
      chosenDays={chosenDays}
      isSmallScreen={isSmallScreen}
    />
  </Box>
);

export const PressureGraph = ({ data, chosenDays, isSmallScreen }) => (
  <Box sx={{ minWidth: "300px", position: "relative" }}>
    <h2>Pressure (hPa)</h2>
    <BaseGraph
      data={data}
      dataKey="pressure"
      stroke="#ffc658"
      yAxisLabel="Pressure (hPa)"
      chosenDays={chosenDays}
      isSmallScreen={isSmallScreen}
    />
  </Box>
);

export const GasResistanceGraph = ({ data, chosenDays, isSmallScreen }) => (
  <Box sx={{ minWidth: "300px", position: "relative" }}>
    <h2>Gas Resistance (Ω)</h2>
    <BaseGraph
      data={data}
      dataKey="gas"
      stroke="#cc5500"
      yAxisLabel="Gas Resistance (Ω)"
      chosenDays={chosenDays}
      isSmallScreen={isSmallScreen}
    />
  </Box>
);
