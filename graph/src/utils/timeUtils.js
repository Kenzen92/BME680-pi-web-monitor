// Time range presets with their configurations
export const TIME_RANGES = {
  DAY: {
    label: "1 Day",
    hours: 24,
    granularity: "hour",
  },
  WEEK: {
    label: "1 Week",
    hours: 24 * 7,
    granularity: "hour",
  },
  MONTH: {
    label: "1 Month",
    hours: 24 * 30,
    granularity: "day",
  },
  THREE_MONTHS: {
    label: "3 Months",
    hours: 24 * 90,
    granularity: "day",
  },
  YEAR: {
    label: "1 Year",
    hours: 24 * 365,
    granularity: "day",
  },
  ALL: {
    label: "All",
    hours: null, // No time filter
    granularity: "day",
  },
};

// Granularity options for custom date ranges
export const GRANULARITY_OPTIONS = [
  { value: "5min", label: "5 Minutes" },
  { value: "20min", label: "20 Minutes" },
  { value: "hour", label: "Hour" },
  { value: "day", label: "Day" },
];

/**
 * Convert a Date object to RFC3339 format (ISO 8601)
 * @param {Date} date
 * @returns {string} RFC3339 formatted string
 */
export function toRFC3339(date) {
  return date.toISOString();
}

/**
 * Get the start and end times for a time range with pagination offset
 * @param {number} hours - Number of hours for the range
 * @param {number} offset - Pagination offset (1 = current, 2 = previous, etc.)
 * @returns {{start: string, end: string}} RFC3339 formatted start and end times
 */
export function getTimeRange(hours, offset = 1) {
  const now = new Date();
  const endTime = new Date(now.getTime() - (offset - 1) * hours * 60 * 60 * 1000);
  const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

  return {
    start: toRFC3339(startTime),
    end: toRFC3339(endTime),
  };
}

/**
 * Build the API URL with query parameters
 * @param {string} baseUrl - Base API URL
 * @param {Object} params - Query parameters
 * @returns {string} Complete API URL
 */
export function buildApiUrl(baseUrl, params) {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
}

/**
 * Format timestamp for display based on granularity
 * @param {string} timestamp - RFC3339 timestamp
 * @param {string} granularity - Data granularity (5min, 20min, hour, day)
 * @returns {string} Formatted timestamp
 */
export function formatTimestamp(timestamp, granularity) {
  const date = new Date(timestamp);

  switch (granularity) {
    case "5min":
    case "20min":
      // Show time only for short ranges
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    case "hour":
      // Show time only for short ranges (up to 48 hours)
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    case "day":
      // Show date only for longer ranges
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
      });
    default:
      return date.toLocaleString();
  }
}

/**
 * Format timestamp for tooltip display (always shows full date and time)
 * @param {string} timestamp - RFC3339 timestamp
 * @returns {string} Formatted timestamp
 */
export function formatTooltipTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
