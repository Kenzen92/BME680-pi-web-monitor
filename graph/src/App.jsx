import "./App.css";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme";
import Graph from "../components/graph";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Graph />
    </ThemeProvider>
  );
}

export default App;
