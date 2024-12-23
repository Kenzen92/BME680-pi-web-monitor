import React, { useState, useEffect } from "react";
import {
  Tabs,
  Tab,
  useMediaQuery,
  Box,
  Button,
  Container,
} from "@mui/material";
import {
  TemperatureGraph,
  HumidityGraph,
  PressureGraph,
} from "./measurement_graph.jsx";
import RealTime from "./real_time.jsx";

export default function Graph() {
  const [graphData, setGraphData] = useState([]);
  const [chosenDays, setChosenDays] = useState(1);
  const [selectedTab, setSelectedTab] = useState(0);
  const isSmallScreen = useMediaQuery("(max-width: 900px)");

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch(
          `http://raspberrypi:5000/readings?days=${chosenDays}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const formattedData = data.map((item) => {
          const date = new Date(item.timestamp);
          return {
            temperature: item.temperature?.toFixed(2),
            pressure: item.pressure,
            humidity: item.humidity?.toFixed(2),
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
  }, [chosenDays]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ width: "100vw" }}>
      <h2>Environmental Readings</h2>

      <RealTime />

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <Button
          variant="outlined"
          sx={{ flex: 1, width: "100%" }}
          onClick={() => setChosenDays(1)}
        >
          1 Day
        </Button>
        <Button
          variant="outlined"
          sx={{ flex: 1, width: "100%" }}
          onClick={() => setChosenDays(7)}
        >
          1 Week
        </Button>
        <Button
          variant="outlined"
          sx={{ flex: 1, width: "100%" }}
          onClick={() => setChosenDays(30)}
        >
          1 Month
        </Button>
        <Button
          variant="outlined"
          sx={{ flex: 1, width: "100%" }}
          onClick={() => setChosenDays(90)}
        >
          3 Months
        </Button>
      </div>

      {isSmallScreen ? (
        <Box>
          <Tabs value={selectedTab} onChange={handleTabChange} centered>
            <Tab label="Temperature" sx={{ color: "#fff" }} />
            <Tab label="Humidity" sx={{ color: "#fff" }} />
            <Tab label="Pressure" sx={{ color: "#fff" }} />
          </Tabs>
          {selectedTab === 0 && <TemperatureGraph data={graphData} />}
          {selectedTab === 1 && <HumidityGraph data={graphData} />}
          {selectedTab === 2 && <PressureGraph data={graphData} />}
        </Box>
      ) : (
        <div>
          <TemperatureGraph data={graphData} />
          <HumidityGraph data={graphData} />
          <PressureGraph data={graphData} />
        </div>
      )}
    </Box>
  );
}
