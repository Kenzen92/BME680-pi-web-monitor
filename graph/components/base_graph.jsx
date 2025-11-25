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

const BaseGraph = ({ data, dataKey, stroke, yAxisLabel, isSmallScreen, isFullscreen }) => {
  // Determine tick formatting based on the dataKey
  const tickFormatter = (value) => {
    if (dataKey === "pressure") {
      return value.toFixed(2);
    } else if (dataKey === "temperature") {
      return value.toFixed(1);
    } else if (dataKey === "gas") {
      return value;
    } else {
      return value.toFixed(0);
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 20,
          right: isFullscreen ? 60 : 30,
          left: isFullscreen ? 60 : 20,
          bottom: isFullscreen ? 40 : 20,
        }}
      >
        <CartesianGrid stroke="#cccccc65" strokeDasharray="1 5" />
        <XAxis
          dataKey="timestamp"
          tick={{ fontSize: isFullscreen ? 14 : 10 }}
          stroke="#64b5f6"
        />
        <YAxis
          domain={["auto", "auto"]}
          tickCount={12}
          allowDecimals={true}
          allowDataOverflow={true}
          tickFormatter={tickFormatter}
          tick={{ fontSize: isFullscreen ? 14 : 12 }}
          stroke="#64b5f6"
        />
        <Tooltip
          formatter={(value) => tickFormatter(value)}
          wrapperStyle={{ padding: 0 }}
          contentStyle={{
            padding: "8px 12px",
            backgroundColor: "#2d2d2d",
            border: "1px solid #64b5f6",
            borderRadius: 8,
          }}
        />
        <Legend
          wrapperStyle={{
            paddingTop: isFullscreen ? "20px" : "10px",
          }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={stroke}
          strokeWidth={isFullscreen ? 3 : 2}
          name={yAxisLabel}
          dot={false}
          activeDot={{ r: isFullscreen ? 8 : 6 }}
        />
        <Brush
          dataKey="timestamp"
          height={isFullscreen ? 40 : 30}
          stroke={stroke}
          travellerWidth={10}
          fill="#2d2d2d"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default BaseGraph;
