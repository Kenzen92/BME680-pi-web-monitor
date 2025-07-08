import React from "react";
import BaseGraph from "./base_graph.jsx";
import { Box, IconButton } from "@mui/material";

export const TemperatureGraph = ({ data }) => (
  <Box sx={{ minWidth: "300px", position: "relative" }}>
    <h2>Temperature (°C)</h2>
    <BaseGraph
      data={data}
      dataKey="temperature"
      stroke="#8884d8"
      yAxisLabel="Temperature (°C)"
    />
  </Box>
);

export const HumidityGraph = ({ data }) => (
  <Box sx={{ minWidth: "300px", position: "relative" }}>
    <h2>Humidity (%)</h2>
    <BaseGraph
      data={data}
      dataKey="humidity"
      stroke="#82ca9d"
      yAxisLabel="Humidity (%)"
    />
  </Box>
);

export const PressureGraph = ({ data }) => (
  <Box sx={{ minWidth: "300px", position: "relative" }}>
    <h2>Pressure (hPa)</h2>
    <BaseGraph
      data={data}
      dataKey="pressure"
      stroke="#ffc658"
      yAxisLabel="Pressure (hPa)"
    />
  </Box>
);

export const GasResistanceGraph = ({ data }) => (
  <Box sx={{ minWidth: "300px", position: "relative" }}>
    <h2>Gas Resistance (Ω)</h2>
    <BaseGraph
      data={data}
      dataKey="gas"
      stroke="#cc5500"
      yAxisLabel="Gas Resistance (Ω)"
    />
  </Box>
);
