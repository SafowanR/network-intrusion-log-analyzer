import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme";
import App from "./App.tsx";

// this wraps the whole app in the custom theme, so every mui component
// automatically uses the colors and styles defined in theme.ts.
// cssBaseline resets default browser styling so the theme applies cleanly.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);