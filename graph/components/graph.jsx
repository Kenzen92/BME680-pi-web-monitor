import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Chip,
  useTheme,
  useMediaQuery,
  Container,
} from "@mui/material";
import {
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  FiberManualRecord as DotIcon,
} from "@mui/icons-material";
import {
  TemperatureGraph,
  HumidityGraph,
  PressureGraph,
  GasResistanceGraph,
} from "./measurement_graph.jsx";
import RealTime from "./real_time.jsx";
import {
  TIME_RANGES,
  GRANULARITY_OPTIONS,
  getTimeRange,
  buildApiUrl,
  formatTimestamp,
  toRFC3339,
} from "../src/utils/timeUtils.js";

const GRAPH_COMPONENTS = [
  { component: TemperatureGraph, name: "Temperature", key: "temperature" },
  { component: HumidityGraph, name: "Humidity", key: "humidity" },
  { component: PressureGraph, name: "Pressure", key: "pressure" },
  { component: GasResistanceGraph, name: "Gas Resistance", key: "gas" },
];

export default function Graph() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const [graphData, setGraphData] = useState([]);
  const [selectedRange, setSelectedRange] = useState("DAY");
  const [granularity, setGranularity] = useState(TIME_RANGES.DAY.granularity);
  const [offset, setOffset] = useState(1);
  const [tabIndex, setTabIndex] = useState(0);
  const [customDateOpen, setCustomDateOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [customGranularity, setCustomGranularity] = useState("hour");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenGraphIndex, setFullscreenGraphIndex] = useState(0);

  const pi_ip = import.meta.env.VITE_PI_IP_ADDRESS;

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        let apiUrl;
        const baseUrl = `http://${pi_ip}:5000/readings`;

        if (selectedRange === "CUSTOM") {
          if (!customStartDate || !customEndDate) return;
          const params = {
            start: toRFC3339(new Date(customStartDate)),
            end: toRFC3339(new Date(customEndDate)),
            granularity: customGranularity,
          };
          apiUrl = buildApiUrl(baseUrl, params);
        } else if (selectedRange === "ALL") {
          const params = { granularity: granularity };
          apiUrl = buildApiUrl(baseUrl, params);
        } else {
          const rangeConfig = TIME_RANGES[selectedRange];
          const timeRange = getTimeRange(rangeConfig.hours, offset);
          const params = {
            start: timeRange.start,
            end: timeRange.end,
            granularity: granularity,
          };
          apiUrl = buildApiUrl(baseUrl, params);
        }

        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        const formattedData = data.map((item) => ({
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
          timestamp: formatTimestamp(item.timestamp, granularity),
        }));
        setGraphData(formattedData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchGraphData();
  }, [selectedRange, granularity, offset, customStartDate, customEndDate, customGranularity, pi_ip]);

  const handleRangeChange = (range) => {
    setSelectedRange(range);
    setGranularity(TIME_RANGES[range].granularity);
    setOffset(1);
  };

  const handleCustomDateSubmit = () => {
    setSelectedRange("CUSTOM");
    setCustomDateOpen(false);
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setFullscreenGraphIndex(0);
    }
  };

  const handleNextGraph = () => {
    setFullscreenGraphIndex((prev) => (prev + 1) % GRAPH_COMPONENTS.length);
  };

  const handlePrevGraph = () => {
    setFullscreenGraphIndex(
      (prev) => (prev - 1 + GRAPH_COMPONENTS.length) % GRAPH_COMPONENTS.length
    );
  };

  const renderTimeRangeButtons = () => (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 1,
        justifyContent: "center",
        mb: 2,
      }}
    >
      {Object.entries(TIME_RANGES).map(([key, value]) => (
        <Button
          key={key}
          variant={selectedRange === key ? "contained" : "outlined"}
          onClick={() => handleRangeChange(key)}
          size={isMobile ? "small" : "medium"}
        >
          {value.label}
        </Button>
      ))}
      <Button
        variant={selectedRange === "CUSTOM" ? "contained" : "outlined"}
        onClick={() => setCustomDateOpen(true)}
        size={isMobile ? "small" : "medium"}
      >
        Custom Range
      </Button>
    </Box>
  );

  const renderControls = () => (
    <Box sx={{ mb: 2 }}>
      {selectedRange !== "CUSTOM" && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <FormControl sx={{ minWidth: isMobile ? 150 : 200 }} size={isMobile ? "small" : "medium"}>
            <InputLabel>Granularity</InputLabel>
            <Select
              value={granularity}
              label="Granularity"
              onChange={(e) => setGranularity(e.target.value)}
            >
              {GRANULARITY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
      {selectedRange !== "ALL" && selectedRange !== "CUSTOM" && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setOffset((prev) => prev + 1)}
            size={isMobile ? "small" : "medium"}
          >
            Previous
          </Button>
          <Chip label={`Page ${offset}`} color="primary" />
          <Button
            variant="outlined"
            onClick={() => setOffset((prev) => Math.max(prev - 1, 1))}
            disabled={offset === 1}
            size={isMobile ? "small" : "medium"}
          >
            Next
          </Button>
        </Box>
      )}
    </Box>
  );

  const renderFullscreenMode = () => {
    const CurrentGraph = GRAPH_COMPONENTS[fullscreenGraphIndex].component;

    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: "background.default",
          zIndex: 1300,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header with controls */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={handleFullscreenToggle} size="large">
              <FullscreenExitIcon />
            </IconButton>
            <Box sx={{ fontWeight: "bold", fontSize: "1.2rem" }}>
              {GRAPH_COMPONENTS[fullscreenGraphIndex].name}
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            {GRAPH_COMPONENTS.map((_, index) => (
              <IconButton
                key={index}
                onClick={() => setFullscreenGraphIndex(index)}
                size="small"
                sx={{
                  p: 0.5,
                  color: index === fullscreenGraphIndex ? "primary.main" : "text.secondary",
                }}
              >
                <DotIcon fontSize={index === fullscreenGraphIndex ? "medium" : "small"} />
              </IconButton>
            ))}
          </Box>
        </Box>

        {/* Graph area */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            p: 2,
          }}
        >
          <IconButton
            onClick={handlePrevGraph}
            sx={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "action.hover" },
              zIndex: 1,
            }}
            size="large"
          >
            <ChevronLeftIcon fontSize="large" />
          </IconButton>

          <Box sx={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <CurrentGraph data={graphData} isSmallScreen={false} isFullscreen={true} />
          </Box>

          <IconButton
            onClick={handleNextGraph}
            sx={{
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "action.hover" },
              zIndex: 1,
            }}
            size="large"
          >
            <ChevronRightIcon fontSize="large" />
          </IconButton>
        </Box>
      </Box>
    );
  };

  const renderMobileLayout = () => (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <h2 style={{ margin: "0 0 16px 0" }}>Environmental Readings</h2>
        <RealTime />
      </Box>

      {renderTimeRangeButtons()}
      {renderControls()}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <IconButton onClick={handleFullscreenToggle} color="primary">
          <FullscreenIcon />
        </IconButton>
      </Box>

      <Tabs
        value={tabIndex}
        onChange={(_, newValue) => setTabIndex(newValue)}
        variant="fullWidth"
        sx={{ mb: 2 }}
      >
        {GRAPH_COMPONENTS.map((graph) => (
          <Tab key={graph.key} label={graph.name} />
        ))}
      </Tabs>

      <Box sx={{ width: "100%", minHeight: "50vh" }}>
        {GRAPH_COMPONENTS.map((graph, index) => (
          tabIndex === index && (
            <Box key={graph.key}>
              <graph.component data={graphData} isSmallScreen={true} />
            </Box>
          )
        ))}
      </Box>
    </Container>
  );

  const renderDesktopLayout = () => {
    const graphHeight = isTablet ? "45vh" : "40vh";
    const minGraphHeight = "300px";

    return (
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <h2 style={{ margin: 0 }}>Environmental Readings</h2>
          </Box>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <RealTime />
            <IconButton onClick={handleFullscreenToggle} color="primary" size="large">
              <FullscreenIcon />
            </IconButton>
          </Box>
        </Box>

        <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: "background.paper" }}>
          {renderTimeRangeButtons()}
          {renderControls()}
        </Paper>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: isTablet ? "1fr" : "1fr 1fr",
            gap: 2,
            width: "100%",
          }}
        >
          {GRAPH_COMPONENTS.map((graph) => (
            <Paper
              key={graph.key}
              elevation={3}
              sx={{
                p: 2,
                bgcolor: "background.paper",
                height: graphHeight,
                minHeight: minGraphHeight,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <graph.component data={graphData} isSmallScreen={false} />
            </Paper>
          ))}
        </Box>
      </Container>
    );
  };

  return (
    <>
      {isFullscreen ? renderFullscreenMode() : isMobile ? renderMobileLayout() : renderDesktopLayout()}

      {/* Custom Date Range Dialog */}
      <Dialog open={customDateOpen} onClose={() => setCustomDateOpen(false)}>
        <DialogTitle>Custom Date Range</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1, minWidth: 300 }}>
            <TextField
              label="Start Date"
              type="datetime-local"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Date"
              type="datetime-local"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Granularity</InputLabel>
              <Select
                value={customGranularity}
                label="Granularity"
                onChange={(e) => setCustomGranularity(e.target.value)}
              >
                {GRANULARITY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomDateOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCustomDateSubmit}
            variant="contained"
            disabled={!customStartDate || !customEndDate}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
