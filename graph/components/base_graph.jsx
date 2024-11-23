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
} from "recharts";

const BaseGraph = ({ data, dataKey, stroke, yAxisLabel }) => {
  return (
    <ResponsiveContainer width={"100%"} height={500}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="2 2" />
        <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
        <YAxis domain={["dataMin", "dataMax"]} tickCount={10} />
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
      </LineChart>
    </ResponsiveContainer>
  );
};

export default BaseGraph;
