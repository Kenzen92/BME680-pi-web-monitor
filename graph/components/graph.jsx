import React, { useState, useEffect } from "react";
import { Tabs, Tab, useMediaQuery, Box, Button } from "@mui/material";
import Grid from "@mui/material/Grid";
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
  const [selectedTab, setSelectedTab] = useState(0);
  const [offset, setOffset] = useState(1);
  const [currentFullScreenGraph, setCurrentFullScreenGraph] = useState(null); // 'temperature', 'humidity', 'pressure', 'gas' or null
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

  const handleToggleFullScreen = (graphName) => {
    setCurrentFullScreenGraph(
      currentFullScreenGraph === graphName ? null : graphName
    );
  };

  const renderGraph = (graphName, GraphComponent) => {
    const isFullScreen = currentFullScreenGraph === graphName;
    const isOtherGraphFullScreen =
      currentFullScreenGraph !== null && currentFullScreenGraph !== graphName;

    if (isOtherGraphFullScreen && !isFullScreen) {
      // Render smaller if another graph is full screen
      return (
        <Grid item xs={12} sm={3}>
          <Box sx={{ height: "150px", overflow: "hidden" }}>
            <GraphComponent
              data={graphData}
              isFullScreen={false}
              onToggleFullScreen={() => handleToggleFullScreen(graphName)}
            />
          </Box>
        </Grid>
      );
    } else if (isFullScreen) {
      // Render full screen
      return (
        <Grid item xs={12}>
          <GraphComponent
            data={graphData}
            isFullScreen={true}
            onToggleFullScreen={() => handleToggleFullScreen(graphName)}
          />
        </Grid>
      );
    } else {
      // Render in 2x2 grid
      return (
        <Grid item xs={12} sm={6}>
          <GraphComponent
            data={graphData}
            isFullScreen={false}
            onToggleFullScreen={() => handleToggleFullScreen(graphName)}
          />
        </Grid>
      );
    }
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

          <Grid container spacing={2}>
            {currentFullScreenGraph === null ? (
              <>
                {renderGraph("temperature", TemperatureGraph)}
                {renderGraph("humidity", HumidityGraph)}
                {renderGraph("pressure", PressureGraph)}
                {renderGraph("gas", GasResistanceGraph)}
              </>
            ) : (
              <>
                {renderGraph(currentFullScreenGraph, (
                  {
                    temperature: TemperatureGraph,
                    humidity: HumidityGraph,
                    pressure: PressureGraph,
                    gas: GasResistanceGraph,
                  }[currentFullScreenGraph]
                ))}
                <Grid item xs={12}>
                  <Grid container spacing={2} sx={{ height: "180px", overflow: "hidden" }}>
                    {currentFullScreenGraph !== "temperature" &&
                      renderGraph("temperature", TemperatureGraph)}
                    {currentFullScreenGraph !== "humidity" &&
                      renderGraph("humidity", HumidityGraph)}
                    {currentFullScreenGraph !== "pressure" &&
                      renderGraph("pressure", PressureGraph)}
                    {currentFullScreenGraph !== "gas" &&
                      renderGraph("gas", GasResistanceGraph)}
                  </Grid>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
      )}
    </Box>
  );
}