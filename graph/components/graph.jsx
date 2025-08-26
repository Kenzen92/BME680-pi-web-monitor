import React, { useState, useEffect } from "react";
import { Stack, useMediaQuery, Box, Button, Tabs, Tab } from "@mui/material";
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
  const [tabIndex, setTabIndex] = useState(0);
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
    // Desktop layout
    !isSmallScreen ? (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          justifyContent: "center",
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
        <Stack
          direction="row"
          spacing={2}
          sx={{ width: "100%", height: "40vh" }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TemperatureGraph data={graphData} isSmallScreen={isSmallScreen} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <HumidityGraph data={graphData} isSmallScreen={isSmallScreen} />
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          sx={{ width: "100%", height: "40vh", mt: 2 }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <PressureGraph data={graphData} isSmallScreen={isSmallScreen} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <GasResistanceGraph
              data={graphData}
              isSmallScreen={isSmallScreen}
            />
          </Box>
        </Stack>
      </Box>
    ) : (
      // Mobile layout
      <Box sx={{ width: "100%", p: 0 }}>
        <h2 style={{ textAlign: "center" }}>Environmental Readings</h2>
        <RealTime />

        {/* Controls - full width */}
        <Stack
          direction="row"
          justifyContent="center"
          spacing={1}
          sx={{ my: 2 }}
        >
          <Button
            variant="outlined"
            onClick={() => {
              setChosenDays(1);
              setOffset(1);
            }}
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: isSmallScreen ? "0.7rem" : "1rem", // smaller font on mobile
            }}
          >
            1 Day
          </Button>
          <Button
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: isSmallScreen ? "0.7rem" : "1rem", // smaller font on mobile
            }}
            variant="outlined"
            onClick={() => {
              setChosenDays(7);
              setOffset(1);
            }}
          >
            1 Week
          </Button>
          <Button
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: isSmallScreen ? "0.7rem" : "1rem", // smaller font on mobile
            }}
            variant="outlined"
            onClick={() => {
              setChosenDays(30);
              setOffset(1);
            }}
          >
            1 Month
          </Button>
          <Button
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: isSmallScreen ? "0.7rem" : "1rem", // smaller font on mobile
            }}
            variant="outlined"
            onClick={() => {
              setChosenDays(90);
              setOffset(1);
            }}
          >
            3 Months
          </Button>
        </Stack>

        {/* Pagination Controls */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ my: 2 }}
        >
          <Button
            sx={{ width: 100, fontSize: isSmallScreen ? "0.7rem" : "1rem" }}
            variant="outlined"
            onClick={() => setOffset((prev) => prev + 1)}
          >
            Previous
          </Button>

          <Button
            sx={{ width: 100, fontSize: isSmallScreen ? "0.7rem" : "1rem" }}
            variant="outlined"
            onClick={() => setOffset((prev) => Math.max(prev - 1, 1))}
            disabled={offset === 1}
          >
            Next
          </Button>
        </Stack>

        {/* Tab Navigation for Graphs */}
        <Tabs
          value={tabIndex}
          onChange={(e, newValue) => setTabIndex(newValue)}
          variant="fullWidth"
          sx={{ mb: 2 }}
        >
          <Tab
            label="Temperature"
            sx={{
              fontSize: isSmallScreen ? "0.7rem" : "1rem",
              color: "#818181ff",
            }}
          />
          <Tab
            label="Humidity"
            sx={{
              fontSize: isSmallScreen ? "0.7rem" : "1rem",
              color: "#818181ff",
            }}
          />
          <Tab
            label="Pressure"
            sx={{
              fontSize: isSmallScreen ? "0.7rem" : "1rem",
              color: "#818181ff",
            }}
          />
          <Tab
            label="Gas"
            sx={{
              fontSize: isSmallScreen ? "0.7rem" : "1rem",
              color: "#818181ff",
            }}
          />
        </Tabs>

        <Box sx={{ width: "100%", height: "40vh", mt: 2 }}>
          {tabIndex === 0 && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <TemperatureGraph
                data={graphData}
                isSmallScreen={isSmallScreen}
              />
            </Box>
          )}
          {tabIndex === 1 && (
            <HumidityGraph data={graphData} isSmallScreen={isSmallScreen} />
          )}
          {tabIndex === 2 && (
            <PressureGraph data={graphData} isSmallScreen={isSmallScreen} />
          )}
          {tabIndex === 3 && (
            <GasResistanceGraph
              data={graphData}
              isSmallScreen={isSmallScreen}
            />
          )}
        </Box>
      </Box>
    )
  );
}
