import React, { useState, useEffect } from "react";
import {
  Stack,
  useMediaQuery,
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
} from "@mui/material";
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

export default function Graph() {
  const [graphData, setGraphData] = useState([]);
  const [selectedRange, setSelectedRange] = useState("DAY");
  const [granularity, setGranularity] = useState(TIME_RANGES.DAY.granularity);
  const [offset, setOffset] = useState(1);
  const [tabIndex, setTabIndex] = useState(0);
  const [customDateOpen, setCustomDateOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [customGranularity, setCustomGranularity] = useState("hour");
  const isSmallScreen = useMediaQuery("(max-width: 900px)");
  const pi_ip = import.meta.env.VITE_PI_IP_ADDRESS;

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        let apiUrl;
        const baseUrl = `http://${pi_ip}:5000/readings`;

        if (selectedRange === "CUSTOM") {
          // Custom date range
          if (!customStartDate || !customEndDate) return;

          const params = {
            start: toRFC3339(new Date(customStartDate)),
            end: toRFC3339(new Date(customEndDate)),
            granularity: customGranularity,
          };
          apiUrl = buildApiUrl(baseUrl, params);
        } else if (selectedRange === "ALL") {
          // All data - no time filter
          const params = {
            granularity: granularity,
          };
          apiUrl = buildApiUrl(baseUrl, params);
        } else {
          // Preset time range with pagination
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
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        const formattedData = data.map((item) => {
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
            timestamp: formatTimestamp(item.timestamp, granularity),
          };
        });
        setGraphData(formattedData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchGraphData();
  }, [selectedRange, granularity, offset, customStartDate, customEndDate, customGranularity]);

  const handleRangeChange = (range) => {
    setSelectedRange(range);
    setGranularity(TIME_RANGES[range].granularity);
    setOffset(1);
  };

  const handleCustomDateSubmit = () => {
    setSelectedRange("CUSTOM");
    setCustomDateOpen(false);
  };

  return (
    <>
      {!isSmallScreen ? (
        // Desktop layout
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
              flexWrap: "wrap",
            }}
          >
            <Button
              variant={selectedRange === "DAY" ? "contained" : "outlined"}
              onClick={() => handleRangeChange("DAY")}
            >
              {TIME_RANGES.DAY.label}
            </Button>
            <Button
              variant={selectedRange === "WEEK" ? "contained" : "outlined"}
              onClick={() => handleRangeChange("WEEK")}
            >
              {TIME_RANGES.WEEK.label}
            </Button>
            <Button
              variant={selectedRange === "MONTH" ? "contained" : "outlined"}
              onClick={() => handleRangeChange("MONTH")}
            >
              {TIME_RANGES.MONTH.label}
            </Button>
            <Button
              variant={selectedRange === "THREE_MONTHS" ? "contained" : "outlined"}
              onClick={() => handleRangeChange("THREE_MONTHS")}
            >
              {TIME_RANGES.THREE_MONTHS.label}
            </Button>
            <Button
              variant={selectedRange === "YEAR" ? "contained" : "outlined"}
              onClick={() => handleRangeChange("YEAR")}
            >
              {TIME_RANGES.YEAR.label}
            </Button>
            <Button
              variant={selectedRange === "ALL" ? "contained" : "outlined"}
              onClick={() => handleRangeChange("ALL")}
            >
              {TIME_RANGES.ALL.label}
            </Button>
            <Button
              variant={selectedRange === "CUSTOM" ? "contained" : "outlined"}
              onClick={() => setCustomDateOpen(true)}
            >
              Custom Range
            </Button>
          </Box>

          {selectedRange !== "CUSTOM" && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <FormControl sx={{ minWidth: 200 }}>
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
          )}
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
        // Mobile layout already defined above
        <Box sx={{ width: "100%", p: 0 }}>
          <h2 style={{ textAlign: "center" }}>Environmental Readings</h2>
          <RealTime />

          <Stack
            direction="row"
            justifyContent="center"
            spacing={1}
            sx={{ my: 2 }}
          >
            <Button
              variant={selectedRange === "DAY" ? "contained" : "outlined"}
              onClick={() => handleRangeChange("DAY")}
              sx={{
                flex: 1,
                minWidth: 0,
                fontSize: "0.7rem",
              }}
            >
              1 Day
            </Button>
            <Button
              sx={{
                flex: 1,
                minWidth: 0,
                fontSize: "0.7rem",
              }}
              variant={selectedRange === "WEEK" ? "contained" : "outlined"}
              onClick={() => handleRangeChange("WEEK")}
            >
              1 Week
            </Button>
            <Button
              sx={{
                flex: 1,
                minWidth: 0,
                fontSize: "0.7rem",
              }}
              variant={selectedRange === "MONTH" ? "contained" : "outlined"}
              onClick={() => handleRangeChange("MONTH")}
            >
              1 Month
            </Button>
            <Button
              sx={{
                flex: 1,
                minWidth: 0,
                fontSize: "0.7rem",
              }}
              variant={selectedRange === "THREE_MONTHS" ? "contained" : "outlined"}
              onClick={() => handleRangeChange("THREE_MONTHS")}
            >
              3 Months
            </Button>
          </Stack>
          <Stack
            direction="row"
            justifyContent="center"
            spacing={1}
            sx={{ my: 2 }}
          >
            <Button
              sx={{
                flex: 1,
                minWidth: 0,
                fontSize: "0.7rem",
              }}
              variant={selectedRange === "YEAR" ? "contained" : "outlined"}
              onClick={() => handleRangeChange("YEAR")}
            >
              1 Year
            </Button>
            <Button
              sx={{
                flex: 1,
                minWidth: 0,
                fontSize: "0.7rem",
              }}
              variant={selectedRange === "ALL" ? "contained" : "outlined"}
              onClick={() => handleRangeChange("ALL")}
            >
              All
            </Button>
            <Button
              sx={{
                flex: 1,
                minWidth: 0,
                fontSize: "0.7rem",
              }}
              variant={selectedRange === "CUSTOM" ? "contained" : "outlined"}
              onClick={() => setCustomDateOpen(true)}
            >
              Custom
            </Button>
          </Stack>

          {selectedRange !== "CUSTOM" && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Granularity</InputLabel>
                <Select
                  value={granularity}
                  label="Granularity"
                  onChange={(e) => setGranularity(e.target.value)}
                  sx={{ fontSize: "0.8rem" }}
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
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ my: 2 }}
            >
              <Button
                sx={{ width: 100, fontSize: "0.7rem" }}
                variant="outlined"
                onClick={() => setOffset((prev) => prev + 1)}
              >
                Previous
              </Button>
              <Box sx={{ fontSize: "0.8rem" }}>Page {offset}</Box>
              <Button
                sx={{ width: 100, fontSize: "0.7rem" }}
                variant="outlined"
                onClick={() => setOffset((prev) => Math.max(prev - 1, 1))}
                disabled={offset === 1}
              >
                Next
              </Button>
            </Stack>
          )}

          <Tabs
            value={tabIndex}
            onChange={(e, newValue) => setTabIndex(newValue)}
            variant="fullWidth"
            sx={{ mb: 2 }}
          >
            <Tab
              label="Temperature"
              sx={{
                fontSize: "0.7rem",
                color: "#818181ff",
              }}
            />
            <Tab
              label="Humidity"
              sx={{
                fontSize: "0.7rem",
                color: "#818181ff",
              }}
            />
            <Tab
              label="Pressure"
              sx={{
                fontSize: "0.7rem",
                color: "#818181ff",
              }}
            />
            <Tab
              label="Gas"
              sx={{
                fontSize: "0.7rem",
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
      )}

      {/* Custom Date Range Dialog */}
      <Dialog open={customDateOpen} onClose={() => setCustomDateOpen(false)}>
        <DialogTitle>Custom Date Range</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Start Date"
              type="datetime-local"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
            />
            <TextField
              label="End Date"
              type="datetime-local"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
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
