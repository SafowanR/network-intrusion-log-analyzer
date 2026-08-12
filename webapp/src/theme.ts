import { createTheme } from "@mui/material/styles";

// this file defines the overall look of the app: colors, fonts, spacing.
// palette source: coolors.co/011936-465362-82a3a1-9fc490-c0dfa1
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#82A3A1",
    },
    secondary: {
      main: "#9FC490",
    },
    background: {
      default: "#011936",
      paper: "#465362",
    },
    text: {
      primary: "#EAF2E9",
      secondary: "#C0DFA1",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.5px",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 10,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;