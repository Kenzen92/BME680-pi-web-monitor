import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#64b5f6", // Light blue for dark mode
      light: "#90caf9",
      dark: "#42a5f5",
      contrastText: "#fff",
    },
    secondary: {
      main: "#81c784", // Complementary green
      light: "#a5d6a7",
      dark: "#66bb6a",
    },
    background: {
      default: "#1e1e1e",
      paper: "#2d2d2d",
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255, 255, 255, 0.7)",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontWeight: 500,
        },
        outlined: {
          borderColor: "#64b5f6",
          color: "#64b5f6",
          "&:hover": {
            borderColor: "#90caf9",
            backgroundColor: "rgba(100, 181, 246, 0.08)",
          },
        },
        contained: {
          backgroundColor: "#64b5f6",
          "&:hover": {
            backgroundColor: "#42a5f5",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#64b5f6",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#90caf9",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#64b5f6",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#64b5f6",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#90caf9",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#64b5f6",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "rgba(255, 255, 255, 0.7)",
          "&.Mui-focused": {
            color: "#64b5f6",
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: "rgba(255, 255, 255, 0.7)",
          "&.Mui-selected": {
            color: "#64b5f6",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#64b5f6",
          "&:hover": {
            backgroundColor: "rgba(100, 181, 246, 0.08)",
          },
        },
      },
    },
  },
});
