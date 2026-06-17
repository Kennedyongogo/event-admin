import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Container,
  Stack,
  Divider,
  Fade,
  Slide,
  CircularProgress,
  InputAdornment,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login,
  ConfirmationNumberRounded,
  ShieldRounded,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import {
  tickahub,
  goldGradient,
  backgroundGradient,
} from "../tickahubTheme";

export default function LoginPage() {
  const rfEmail = useRef();
  const rsEmail = useRef();
  const rfPassword = useRef();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [body, updateBody] = useState({ email: null });
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const navigate = useNavigate();

  const login = async (e) => {
    if (e) e.preventDefault();

    const d = { ...body };
    d.email = rfEmail.current.value.toLowerCase().trim();
    d.password = rfPassword.current.value;
    updateBody(d);

    if (!validateEmail(d.email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address",
        confirmButtonColor: tickahub.gold,
        background: tickahub.surface,
        color: "#fff",
      });
      return;
    }

    if (!validatePassword(d.password)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Password",
        text: "Password must be at least 6 characters",
        confirmButtonColor: tickahub.gold,
        background: tickahub.surface,
        color: "#fff",
      });
      return;
    }

    setLoading(true);
    Swal.fire({
      title: "Signing in...",
      allowOutsideClick: false,
      background: tickahub.surface,
      color: "#fff",
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await fetch("/api/admins/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(d),
      });
      const data = await response.json();

      if (!response.ok) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.message,
          confirmButtonColor: tickahub.gold,
          background: tickahub.surface,
          color: "#fff",
        });
      } else if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Welcome back",
          text: data.message,
          timer: 1500,
          showConfirmButton: false,
          background: tickahub.surface,
          color: "#fff",
        });
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("userRole", data.data.admin.role);
        localStorage.setItem("user", JSON.stringify(data.data.admin));
        setTimeout(() => navigate("/analytics"), 1500);
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.message,
          confirmButtonColor: tickahub.gold,
          background: tickahub.surface,
          color: "#fff",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Login failed. Please try again.",
        confirmButtonColor: tickahub.gold,
        background: tickahub.surface,
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    const email = rsEmail.current.value.toLowerCase().trim();

    if (!validateEmail(email)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email",
        text: "Please enter a valid email address",
        confirmButtonColor: tickahub.gold,
        background: tickahub.surface,
        color: "#fff",
      });
      return;
    }

    setResetLoading(true);
    Swal.fire({
      title: "Processing...",
      allowOutsideClick: false,
      background: tickahub.surface,
      color: "#fff",
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await fetch("/api/admins/forgot-password", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ Email: email }),
      });
      const data = await response.json();

      if (response.ok) {
        setOpenResetDialog(false);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: data.message,
          confirmButtonColor: tickahub.gold,
          background: tickahub.surface,
          color: "#fff",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message,
          confirmButtonColor: tickahub.gold,
          background: tickahub.surface,
          color: "#fff",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: tickahub.gold,
        background: tickahub.surface,
        color: "#fff",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const validateEmail = (email) =>
    String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]/.,;:\s@"]+(\.[^<>()[\]/.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );

  const validatePassword = (password) => password.length >= 6;

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: tickahub.navyLight,
      borderRadius: 3,
      transition: "all 0.2s ease",
      "& fieldset": {
        borderColor: tickahub.borderLight,
      },
      "&:hover fieldset": {
        borderColor: "rgba(255, 255, 255, 0.28)",
      },
      "&.Mui-focused fieldset": {
        borderColor: tickahub.gold,
        borderWidth: 2,
      },
      "&.Mui-focused": {
        boxShadow: `0 0 0 4px ${tickahub.gold}22`,
      },
    },
    "& .MuiInputLabel-root": {
      color: tickahub.textMuted,
      "&.Mui-focused": { color: tickahub.gold },
    },
    "& .MuiInputBase-input": {
      color: "#fff",
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: backgroundGradient,
      }}
    >
      {/* Ambient glow orbs — no background images */}
      <Box
        sx={{
          position: "absolute",
          width: 420,
          height: 420,
          top: "-8%",
          right: "-6%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tickahub.gold}30 0%, transparent 70%)`,
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 360,
          height: 360,
          bottom: "-10%",
          left: "-8%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tickahub.cyan}22 0%, transparent 70%)`,
          filter: "blur(48px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 200,
          height: 200,
          top: "40%",
          left: "30%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${tickahub.gold}12 0%, transparent 70%)`,
          filter: "blur(32px)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: 4 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 4, md: 6, lg: 10 },
            alignItems: "center",
          }}
        >
          {/* Brand panel */}
          <Fade in timeout={800}>
            <Stack
              spacing={3}
              alignItems={{ xs: "center", md: "flex-start" }}
              textAlign={{ xs: "center", md: "left" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  component="img"
                  src="/tickahub.png"
                  alt="TickaHub"
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 3,
                    boxShadow: `0 12px 32px ${tickahub.gold}33`,
                  }}
                />
                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      letterSpacing: "-0.03em",
                      background: goldGradient,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      lineHeight: 1.1,
                    }}
                  >
                    TickaHub
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: tickahub.textMuted, fontWeight: 600 }}
                  >
                    Admin Portal
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-0.02em",
                  maxWidth: 440,
                  fontSize: { xs: "1.75rem", md: "2rem" },
                }}
              >
                Manage events, tickets & insights in one place
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: tickahub.textMuted,
                  maxWidth: 420,
                  lineHeight: 1.6,
                  fontSize: "1.05rem",
                }}
              >
                The same premium experience as the mobile app — built for
                organizers and platform admins.
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  icon={<ConfirmationNumberRounded sx={{ color: `${tickahub.gold} !important` }} />}
                  label="Events & tickets"
                  size="small"
                  sx={{
                    bgcolor: `${tickahub.surface}`,
                    border: `1px solid ${tickahub.borderLight}`,
                    color: "#fff",
                    fontWeight: 600,
                  }}
                />
                <Chip
                  icon={<ShieldRounded sx={{ color: `${tickahub.cyan} !important` }} />}
                  label="Secure admin access"
                  size="small"
                  sx={{
                    bgcolor: `${tickahub.surface}`,
                    border: `1px solid ${tickahub.borderLight}`,
                    color: "#fff",
                    fontWeight: 600,
                  }}
                />
              </Stack>
            </Stack>
          </Fade>

          {/* Sign-in card */}
          <Slide direction="up" in timeout={600}>
            <Box
              sx={{
                width: "100%",
                maxWidth: 440,
                mx: "auto",
                p: { xs: 3, sm: 4 },
                borderRadius: 4,
                bgcolor: tickahub.surface,
                border: `1px solid ${tickahub.borderLight}`,
                boxShadow: `0 24px 64px rgba(0, 0, 0, 0.45), 0 0 0 1px ${tickahub.borderSubtle}`,
              }}
            >
              <Stack spacing={0.5} sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff" }}>
                  Sign in
                </Typography>
                <Typography variant="body2" sx={{ color: tickahub.textMuted }}>
                  Enter your admin credentials to continue
                </Typography>
              </Stack>

              <form onSubmit={login}>
                <TextField
                  inputRef={rfEmail}
                  type="email"
                  label="Email address"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  autoComplete="email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: tickahub.textMuted, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />

                <TextField
                  inputRef={rfPassword}
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  autoComplete="current-password"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: tickahub.textMuted, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label="toggle password"
                          sx={{ color: tickahub.textMuted }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />

                <Typography
                  variant="body2"
                  align="right"
                  sx={{
                    mt: 1.5,
                    color: tickahub.cyan,
                    cursor: "pointer",
                    fontWeight: 600,
                    "&:hover": { textDecoration: "underline" },
                  }}
                  onClick={() => setOpenResetDialog(true)}
                >
                  Forgot password?
                </Typography>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} sx={{ color: tickahub.navy }} />
                    ) : (
                      <Login />
                    )
                  }
                  sx={{
                    mt: 3,
                    py: 1.6,
                    background: goldGradient,
                    color: tickahub.navy,
                    fontSize: "1rem",
                    fontWeight: 800,
                    boxShadow: `0 8px 24px ${tickahub.gold}44`,
                    "&:hover": {
                      background: `linear-gradient(135deg, ${tickahub.goldDark}, ${tickahub.gold})`,
                      boxShadow: `0 12px 28px ${tickahub.gold}55`,
                      transform: "translateY(-1px)",
                    },
                    "&:disabled": {
                      background: tickahub.surfaceElevated,
                      color: tickahub.textMuted,
                    },
                  }}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Box>
          </Slide>
        </Box>
      </Container>

      <Dialog
        open={openResetDialog}
        onClose={() => setOpenResetDialog(false)}
        fullWidth
        maxWidth="xs"
        TransitionComponent={Slide}
        transitionDuration={300}
        PaperProps={{
          sx: {
            bgcolor: tickahub.surface,
            border: `1px solid ${tickahub.borderLight}`,
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: goldGradient,
            color: tickahub.navy,
            fontWeight: 800,
          }}
        >
          Reset password
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText sx={{ mb: 2, color: tickahub.textMuted }}>
            Enter your email and we&apos;ll send reset instructions.
          </DialogContentText>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              reset();
            }}
          >
            <TextField
              inputRef={rsEmail}
              type="email"
              label="Email address"
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: tickahub.textMuted }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />
            <DialogActions sx={{ mt: 2, px: 0 }}>
              <Button
                onClick={() => setOpenResetDialog(false)}
                variant="outlined"
                disabled={resetLoading}
                sx={{
                  borderColor: tickahub.borderLight,
                  color: "#fff",
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={resetLoading}
                startIcon={
                  resetLoading ? <CircularProgress size={16} /> : null
                }
                sx={{
                  background: goldGradient,
                  color: tickahub.navy,
                  fontWeight: 700,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${tickahub.goldDark}, ${tickahub.gold})`,
                  },
                }}
              >
                {resetLoading ? "Processing..." : "Submit"}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
