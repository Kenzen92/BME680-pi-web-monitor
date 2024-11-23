import React from "react";
import BaseGraph from "./base_graph.jsx";

export const TemperatureGraph = ({ data }) => (
  <div>
    <h2>Temperature (°C)</h2>
    <BaseGraph
      data={data}
      dataKey="temperature"
      stroke="#8884d8"
      yAxisLabel="Temperature (°C)"
    />
  </div>
);

export const HumidityGraph = ({ data }) => (
  <div>
    <h2>Humidity (%)</h2>
    <BaseGraph
      data={data}
      dataKey="humidity"
      stroke="#82ca9d"
      yAxisLabel="Humidity (%)"
    />
  </div>
);

export const PressureGraph = ({ data }) => (
  <div>
    <h2>Pressure (hPa)</h2>
    <BaseGraph
      data={data}
      dataKey="pressure"
      stroke="#ffc658"
      yAxisLabel="Pressure (hPa)"
    />
  </div>
);
