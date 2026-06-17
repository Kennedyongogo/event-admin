import React, { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  InputAdornment,
  CircularProgress,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Lock as LockIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { tickahub, goldGradient, backgroundGradient } from "../tickahubTheme";
import { getDisplayName, getInitials } from "../utils/userDisplay";

const swalDark = {
  confirmButtonColor: tickahub.gold,
  background: tickahub.surface,
  color: "#fff",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: tickahub.navy,
    "& fieldset": { borderColor: tickahub.borderSubtle },
    "&:hover fieldset": { borderColor: tickahub.borderLight },
    "&.Mui-focused fieldset": { borderColor: tickahub.cyan },
  },
  "& .MuiInputLabel-root": { color: tickahub.textMuted },
  "& .MuiOutlinedInput-input": { color: "#fff" },
  "& .Mui-disabled": { WebkitTextFillColor: `${tickahub.textMuted} !important` },
  "& .MuiFormHelperText-root": { color: tickahub.textMuted, mt: 0.5 },
};

const sectionTitleSx = {
  color: "#fff",
  fontWeight: 800,
  fontSize: "1rem",
};

const halfCardSx = {
  flex: 1,
  minWidth: 0,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: 3,
  overflow: "hidden",
  bgcolor: tickahub.surface,
  border: `1px solid ${tickahub.borderSubtle}`,
};

const cardHeaderSx = {
  px: 2.5,
  py: 1.75,
  flexShrink: 0,
  borderBottom: `1px solid ${tickahub.borderSubtle}`,
};

const PasswordToggle = ({ show, onToggle }) => (
  <IconButton onClick={onToggle} edge="end" sx={{ color: tickahub.textMuted }}>
    {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
  </IconButton>
);

export default function Settings({ user }) {
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "admin",
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const userId = user?.id;

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        setLoadingProfile(true);
        const response = await fetch(`/api/users/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (data.success && data.data) {
          const u = data.data;
          setProfile({
            full_name: u.full_name || "",
            email: u.email || "",
            phone: u.phone || "",
            role: u.role || "admin",
          });
          localStorage.setItem("user", JSON.stringify(u));
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Could not load profile",
          text: err.message || "Failed to load profile",
          ...swalDark,
        });
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [userId]);

  const handleProfileSave = async () => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setSavingProfile(true);
      Swal.fire({
        title: "Saving profile...",
        allowOutsideClick: false,
        ...swalDark,
        didOpen: () => Swal.showLoading(),
      });

      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: profile.full_name.trim(),
          phone: profile.phone.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update profile");
      }
      const updated = data.data;
      localStorage.setItem("user", JSON.stringify(updated));
      setProfile({
        full_name: updated.full_name || "",
        email: updated.email || "",
        phone: updated.phone || "",
        role: updated.role || "admin",
      });

      Swal.fire({
        icon: "success",
        title: "Profile updated",
        text: "Your changes have been saved.",
        timer: 2000,
        showConfirmButton: false,
        ...swalDark,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: err.message,
        ...swalDark,
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Password too short",
        text: "Password must be at least 6 characters.",
        ...swalDark,
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Passwords do not match",
        text: "New password and confirmation must match.",
        ...swalDark,
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token || !userId) return;

    try {
      setSavingPassword(true);
      Swal.fire({
        title: "Updating password...",
        allowOutsideClick: false,
        ...swalDark,
        didOpen: () => Swal.showLoading(),
      });

      const response = await fetch(`/api/users/${userId}/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: oldPassword,
          newPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update password");
      }
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      Swal.fire({
        icon: "success",
        title: "Password updated",
        text: "Your password has been changed successfully.",
        timer: 2000,
        showConfirmButton: false,
        ...swalDark,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update failed",
        text: err.message,
        ...swalDark,
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const displayName = getDisplayName({ ...(user || {}), ...profile });

  return (
    <Box
      sx={{
        m: -3,
        minHeight: "calc(100vh - 72px)",
        height: "calc(100vh - 72px)",
        background: backgroundGradient,
        display: "flex",
        flexDirection: "column",
        p: 2,
        gap: 2,
        overflow: "hidden",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          px: 2.5,
          py: 1.75,
          flexShrink: 0,
          borderRadius: 3,
          bgcolor: tickahub.surface,
          border: `1px solid ${tickahub.borderSubtle}`,
          background: `linear-gradient(135deg, ${tickahub.navyLight} 0%, ${tickahub.surface} 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar sx={{ width: 40, height: 40, background: goldGradient, color: tickahub.navy, fontWeight: 800 }}>
            {getInitials(displayName)}
          </Avatar>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <SettingsIcon sx={{ color: tickahub.gold, fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#fff" }}>
                Account Settings
              </Typography>
            </Stack>
            <Typography sx={{ color: tickahub.textMuted, fontSize: "0.85rem" }}>
              {displayName}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Paper elevation={0} sx={halfCardSx}>
          <Box sx={{ ...cardHeaderSx, background: `linear-gradient(135deg, ${tickahub.gold}22, transparent)` }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <PersonIcon sx={{ color: tickahub.gold, fontSize: 20 }} />
              <Typography sx={sectionTitleSx}>Profile</Typography>
            </Stack>
            <Typography sx={{ color: tickahub.textMuted, fontSize: "0.8rem", mt: 0.25 }}>
              Update your personal details
            </Typography>
          </Box>
          <Box sx={{ flex: 1, p: 2.5, overflow: "auto" }}>
            {loadingProfile ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <CircularProgress sx={{ color: tickahub.cyan }} size={26} />
              </Box>
            ) : (
              <Stack spacing={1.5} sx={{ height: "100%" }}>
                <TextField
                  label="full_name"
                  size="small"
                  fullWidth
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: tickahub.textMuted, fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
                <TextField label="email" size="small" fullWidth value={profile.email} disabled sx={fieldSx} />
                <TextField
                  label="phone"
                  size="small"
                  fullWidth
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  sx={fieldSx}
                />
                <Box>
                  <Typography variant="caption" sx={{ color: tickahub.textMuted, fontFamily: "monospace" }}>
                    role
                  </Typography>
                  <Box mt={0.5}>
                    <Chip
                      label={profile.role}
                      size="small"
                      sx={{ bgcolor: `${tickahub.gold}22`, color: tickahub.gold, fontWeight: 700, height: 24 }}
                    />
                  </Box>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleProfileSave}
                  disabled={savingProfile}
                  startIcon={savingProfile ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  sx={{
                    alignSelf: "flex-start",
                    background: goldGradient,
                    color: tickahub.navy,
                    fontWeight: 700,
                    textTransform: "none",
                    px: 2.5,
                  }}
                >
                  {savingProfile ? "Saving..." : "Save profile"}
                </Button>
              </Stack>
            )}
          </Box>
        </Paper>

        <Paper elevation={0} sx={halfCardSx}>
          <Box sx={{ ...cardHeaderSx, background: `linear-gradient(135deg, ${tickahub.cyan}22, transparent)` }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LockIcon sx={{ color: tickahub.cyan, fontSize: 20 }} />
              <Typography sx={sectionTitleSx}>Security</Typography>
            </Stack>
            <Typography sx={{ color: tickahub.textMuted, fontSize: "0.8rem", mt: 0.25 }}>
              Change your password
            </Typography>
          </Box>
          <Box sx={{ flex: 1, p: 2.5, overflow: "auto" }}>
            <Box component="form" onSubmit={handlePasswordSave} sx={{ height: "100%" }}>
              <Stack spacing={1.5} sx={{ height: "100%" }}>
                <TextField
                  label="Current password"
                  size="small"
                  type={showPasswords.old ? "text" : "password"}
                  fullWidth
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: tickahub.textMuted, fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <PasswordToggle show={showPasswords.old} onToggle={() => setShowPasswords((p) => ({ ...p, old: !p.old }))} />
                    ),
                  }}
                  sx={fieldSx}
                />
                <TextField
                  label="New password"
                  size="small"
                  type={showPasswords.new ? "text" : "password"}
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  helperText="Min. 6 characters"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: tickahub.textMuted, fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <PasswordToggle show={showPasswords.new} onToggle={() => setShowPasswords((p) => ({ ...p, new: !p.new }))} />
                    ),
                  }}
                  sx={fieldSx}
                />
                <TextField
                  label="Confirm password"
                  size="small"
                  type={showPasswords.confirm ? "text" : "password"}
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: tickahub.textMuted, fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <PasswordToggle show={showPasswords.confirm} onToggle={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))} />
                    ),
                  }}
                  sx={fieldSx}
                />
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  type="submit"
                  size="small"
                  variant="contained"
                  disabled={savingPassword}
                  startIcon={savingPassword ? <CircularProgress size={16} color="inherit" /> : <LockIcon />}
                  sx={{
                    alignSelf: "flex-start",
                    background: `linear-gradient(135deg, ${tickahub.cyan}, ${tickahub.cyanDark})`,
                    color: tickahub.navy,
                    fontWeight: 700,
                    textTransform: "none",
                    px: 2.5,
                  }}
                >
                  {savingPassword ? "Updating..." : "Update password"}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
