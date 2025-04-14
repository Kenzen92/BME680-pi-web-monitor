import React, { useState, useEffect } from "react";
import { Tabs, Tab, useMediaQuery, Box, Button } from "@mui/material";
import Grid2 from "@mui/material/Grid2"; // Use Grid2 instead of Grid
import {
  TemperatureGraph,
  HumidityGraph,
  PressureGraph,
  GasResistanceGraph,
} from "./measurement_graph.jsx";
import RealTime from "./real_time.jsx";
export default function Graph () {

  const [graphData, setGraphData] = useState([]);
  const [chosenDays, setChosenDays] = useState(1);
  const [selectedTab, setSelectedTab] = useState(0);
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
            temperature: item.temperature?.toFixed(2),
            pressure: item.pressure,
            humidity: item.humidity?.toFixed(2),
            gas: item.gas?.toFixed(1),
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

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Box
      sx={{

        paddingLeft: "1em",
        paddingRight: "1em",
        width: "95vw",
        height: "95vh",
      }}
    >

      <h2>Environmental Readings</h2>

      <RealTime />

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: "10px",
          marginBottom: "20px",
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: "70em",
        }}
      >
        <Button
          variant="outlined"
          sx={{ flex: 1, width: "100%" }}
          onClick={() => {
            setChosenDays(1);
            setOffset(1);
          }}
        >
          1 Day
        </Button>
        <Button
          variant="outlined"
          sx={{ flex: 1, width: "100%" }}
          onClick={() => {
            setChosenDays(7);
            setOffset(1);
          }}
        >
          1 Week
        </Button>
        <Button
          variant="outlined"
          sx={{ flex: 1, width: "100%" }}
          onClick={() => {
            setChosenDays(30);
            setOffset(1);
          }}
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
      </Box>

      {isSmallScreen ? (
        <Box sx={{ overflowY: "auto" }}>
          <Tabs value={selectedTab} onChange={handleTabChange} centered>
            <Tab label="Temperature" sx={{ color: "#fff" }} />
            <Tab label="Humidity" sx={{ color: "#fff" }} />
            <Tab label="Pressure" sx={{ color: "#fff" }} />
            <Tab label="Gas Resistance" sx={{ color: "#fff" }} />
          </Tabs>
          {selectedTab === 0 && <TemperatureGraph data={graphData} />}
          {selectedTab === 1 && <HumidityGraph data={graphData} />}
          {selectedTab === 2 && <PressureGraph data={graphData} />}
          {selectedTab === 3 && <GasResistanceGraph data={graphData} />}
        </Box>
      ) : (
        <Box>
          <Box
            sx={{
              maxWidth: "40em",
              marginLeft: "auto",
              marginRight: "auto",
              display: "flex",
              gap: "3em",
              justifyContent: "center",
              flexDirection: "row",
            }}
          >
            <Button
              variant="outlined"
              sx={{ minWidth: "8em" }}
              onClick={() => setOffset(offset + 1)}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              sx={{ minWidth: "8em" }}
              onClick={() => setOffset(offset - 1)}
              disabled={offset == 1}
            >
              Next
            </Button>

            </Box>

            <Grid2 container spacing={2}>
              <Grid2 xs={12} sm={6}>
                <TemperatureGraph data={graphData} />
              </Grid2>
              <Grid2 xs={12} sm={6}>
                <HumidityGraph data={graphData} />
              </Grid2>
              <Grid2 xs={12} sm={6}>
                <PressureGraph data={graphData} />
              </Grid2>
              <Grid2 xs={12} sm={6}>
                <GasResistanceGraph data={graphData} />
              </Grid2>
            </Grid2>

          </Box>



      )}
    </Box>
  );

}

