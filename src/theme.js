import { createTheme } from "@mui/material/styles";
import { tickahub } from "./tickahubTheme";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: tickahub.gold,
      light: "#FFC933",
      dark: tickahub.goldDark,
      contrastText: tickahub.navy,
    },
    secondary: {
      main: tickahub.cyan,
      light: "#33DDFF",
      dark: tickahub.cyanDark,
      contrastText: tickahub.navy,
    },
    info: {
      main: tickahub.cyan,
      light: "#33DDFF",
      dark: tickahub.cyanDark,
    },
    background: {
      default: tickahub.navy,
      paper: tickahub.surface,
    },
    text: {
      primary: "#FFFFFF",
      secondary: tickahub.textMuted,
    },
    success: {
      main: "#4ADE80",
      light: "#86EFAC",
      dark: "#22C55E",
    },
    error: {
      main: "#F87171",
      light: "#FCA5A5",
      dark: "#EF4444",
    },
    divider: tickahub.borderSubtle,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 900, letterSpacing: "-0.02em" },
    h2: { fontWeight: 800, letterSpacing: "-0.02em" },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: tickahub.navy,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export default theme;
