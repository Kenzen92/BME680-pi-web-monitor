import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";

const BaseGraph = ({ data, dataKey, stroke, yAxisLabel, isFullScreen }) => {
  // Determine tick formatting based on the dataKey
  const tickFormatter = (value) => {
    if (dataKey === "pressure") {
      return value.toFixed(2); // 2 decimal places for humidity
    } else if (dataKey === "temperature") {
      return value.toFixed(1);
    } else if (dataKey == "gas") {
      return value;
    } else {
      return value.toFixed(0); // 1 decimal place for temperature and pressure
    }
  };

  return (
    <ResponsiveContainer
      width={"100%"}
      height={isFullScreen ? window.innerHeight * 0.8 : window.innerHeight * 0.32}
    >
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="2 2" />
        <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
        <YAxis
          domain={["auto", "auto"]}
          tickFormatter={tickFormatter}
          tickCount={15} // Ensures ticks are distributed evenly
          interval="preserveStartEnd" // Ensures whole number ticks
        />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={stroke}
          strokeWidth={2}
          name={yAxisLabel}
          dot={false}
        />
        <Brush
          dataKey="timestamp"
          height={30}
          stroke={stroke}
          travellerWidth={10}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default BaseGraph;