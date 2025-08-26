import React, { useState, useEffect } from "react";
import { Stack, useMediaQuery, Box, Button } from "@mui/material";
import {
  TemperatureGraph,
  HumidityGraph,
  PressureGraph,
  GasResistanceGraph,
} from "./measurement_graph.jsx";
import RealTime from "./real_time.jsx";
export default function Graph() {
  const [graphData, setGraphData] = useState([]);
  const [chosenDays, setChosenDays] = useState(1);
  const [offset, setOffset] = useState(1);
  const isSmallScreen = useMediaQuery("(max-width: 900px)");
  const pi_ip = import.meta.env.VITE_PI_IP_ADDRESS;

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch(
          `http://${pi_ip}:5000/readings?days=${chosenDays}&offset=${offset}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const formattedData = data.map((item) => {
          const date = new Date(item.timestamp);
          return {
            temperature:
              item.temperature !== null && item.temperature !== undefined
                ? Number(item.temperature)
                : null,
            pressure:
              item.pressure !== null && item.pressure !== undefined
                ? Number(item.pressure)
                : null,
            humidity:
              item.humidity !== null && item.humidity !== undefined
                ? Number(item.humidity)
                : null,
            gas:
              item.gas !== null && item.gas !== undefined
                ? Number(item.gas)
                : null,
            timestamp:
              chosenDays === 1
                ? date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : date.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                  }),
          };
        });
        setGraphData(formattedData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchGraphData();
  }, [chosenDays, offset]);

  return (
    <Box
      sx={{
        padding: isSmallScreen ? 0 : 2,
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Environmental Readings</h2>
      <RealTime />
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: "10px",
          marginBottom: "20px",
          justifyContent: "center",
        }}
      >
        <Button
          variant="outlined"
          onClick={() => {
            setChosenDays(1);
            setOffset(1);
          }}
        >
          1 Day
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setChosenDays(7);
            setOffset(1);
          }}
        >
          1 Week
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setChosenDays(30);
            setOffset(1);
          }}
        >
          1 Month
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setChosenDays(90);
            setOffset(1);
          }}
        >
          3 Months
        </Button>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <Button
          variant="outlined"
          onClick={() => setOffset((prev) => prev + 1)}
        >
          Previous
        </Button>
        <Box sx={{ display: "flex", alignItems: "center", mx: 2 }}>
          Page {offset}
        </Box>
        <Button
          variant="outlined"
          onClick={() => setOffset((prev) => Math.max(prev - 1, 1))}
          disabled={offset === 1}
        >
          Next
        </Button>
      </Box>
      <Stack flexDirection="column" sx={{ minHeight: "60vh" }}>
        <TemperatureGraph data={graphData} />
        <HumidityGraph data={graphData} />
        <PressureGraph data={graphData} />
        <GasResistanceGraph data={graphData} />
      </Stack>
    </Box>
  );
}
