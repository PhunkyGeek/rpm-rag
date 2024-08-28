"use client";
import {
  Box,
  Button,
  Typography,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? "#9c27b0" : "#1976d2",
      },
      background: {
        default: darkMode ? "#121212" : "#f5f5f5",
      },
      text: {
        primary: darkMode ? "#ffffff" : "#000000",
      },
    },
  });

  const handleThemeChange = () => {
    setDarkMode(!darkMode);
  };

  const handleGetStarted = () => {
    router.push("/chat");
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        bgcolor="background.default"
        color="text.primary"
        p={3}
        textAlign="center"
      >
        <Box position="absolute" top={20} left={20}>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={handleThemeChange}
                style={{
                  color: theme.palette.mode === "dark" ? "purple" : "black",
                }}
              />
            }
            label="Dark Mode"
            style={{ marginLeft: "15px", marginTop: "10px" }}
          />
        </Box>

        <Box mb={5}>
          <Image
            src={darkMode ? "/logo-dark.png" : "/logo.png"}
            alt="Logo"
            width={220}
            height={150}
          />
        </Box>

        <Box mb={8}>
          <Typography mb={6} fontbold variant="h3" gutterBottom>
            Welcome to Instructor Intel
          </Typography>
          <Typography variant="h5" paragraph>
            Want to know more about your professors? Ask our intelligent AI
            assistant.
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          color="secondary"
          onClick={handleGetStarted}
          style={{
            backgroundColor: darkMode ? "#9c27b0" : "black",
            color: "#ffffff",
            width: "220px",
            height: "60px",
          }}
        >
          Get Started
        </Button>
      </Box>
    </ThemeProvider>
  );
}
