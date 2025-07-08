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
    <ResponsiveContainer width={"100%"} height={0.5 * screen.availHeight}>
      <LineChart data={data} margin={{ top: 5, right: 15, left: 5, bottom: 5 }}>
        <CartesianGrid stroke="#fff" strokeOpacity={0.4} />

        <XAxis
          dataKey="timestamp"
          tick={{ fill: "#fff", fontSize: 12, fontWeight: 400 }}
          tickLine={false}
        />

        <YAxis
          domain={["auto", "auto"]}
          tickFormatter={tickFormatter}
          tick={{ fill: "#fff", fontSize: 12, fontWeight: 400 }}
          tickLine={false}
          tickCount={12}
          interval="preserveStartEnd"
        />

        <Tooltip />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={stroke}
          strokeWidth={4}
          name={yAxisLabel}
          dot={true}
        />
        <Brush
          dataKey="timestamp"
          height={30}
          stroke={stroke}
          travellerWidth={15}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default BaseGraph;
