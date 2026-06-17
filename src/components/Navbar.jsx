import React, { cloneElement, useEffect, useState } from "react";
import { Logout, PeopleAlt, Dashboard, Event } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Box } from "@mui/material";
import { Gear } from "@phosphor-icons/react";
import { tickahub, goldGradient, heroGradient } from "../tickahubTheme";
import Header from "./Header/Header";

const drawerWidth = 300;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(1.5, 2),
  backgroundColor: tickahub.surfaceElevated,
  color: tickahub.gold,
  borderBottom: `1px solid ${tickahub.borderSubtle}`,
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  background: heroGradient,
  borderBottom: `1px solid ${tickahub.borderSubtle}`,
  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.35)",
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  overflowY: "hidden",
  "& .MuiDrawer-paper": {
    backgroundColor: tickahub.surface,
    borderRight: `1px solid ${tickahub.borderSubtle}`,
    color: "#fff",
  },
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const Navbar = (props) => {
  const { user } = props; // Expecting user role from props
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [open, setOpen] = useState(() => {
    return window.innerWidth >= theme.breakpoints.values.md;
  });
  const [menuItems, setMenuItems] = useState([]);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const logout = () => {
    localStorage.clear();
    navigate("/");
    fetch("/api/admin-users/logout", {
      method: "GET",
      credentials: "include",
    });
  };

  const adminItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/analytics" },
    { text: "Events", icon: <Event />, path: "/events" },
  ];

  useEffect(() => {
    if (user) {
      // if (
      //   user.Department ===
      //   "Lands, Physical Planning, Housing and Urban Development"
      // ) {
      //   setMenuItems(adminItems);
      // } else if (user.Department === "ICT") {
      //   // setMenuItems(ICTItems);
      // } else if (user.Department === "Finance and Economic Planning") {
      //   // setMenuItems(financeItems);
      // }
      setMenuItems(adminItems);
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      setOpen(window.innerWidth >= theme.breakpoints.values.md);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [theme.breakpoints.values.md]);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
          <Header setUser={props.setUser} handleDrawerOpen={handleDrawerOpen} open={open} />
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, pl: 0.5 }}>
            <Box
              component="img"
              src="/tickahub.png"
              alt="TickaHub"
              sx={{ width: 32, height: 32, borderRadius: 1.5 }}
            />
            <Box
              component="span"
              sx={{
                fontWeight: 800,
                fontSize: "0.95rem",
                background: goldGradient,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              TickaHub
            </Box>
          </Box>
          <IconButton onClick={handleDrawerClose} sx={{ color: "#fff" }}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
              button
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                cursor: "pointer",
                bgcolor:
                  location.pathname === item.path
                    ? `${tickahub.gold}18`
                    : "transparent",
                borderLeft:
                  location.pathname === item.path
                    ? `3px solid ${tickahub.gold}`
                    : "3px solid transparent",
                "&:hover": { bgcolor: `${tickahub.gold}10` },
              }}
            >
              <ListItemIcon>
                {cloneElement(item.icon, {
                  color:
                    location.pathname === item.path
                      ? "primary"
                      : "textSecondary",
                })}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  cursor: "pointer",
                  color:
                    location.pathname === item.path
                      ? "primary"
                      : "textSecondary",
                  fontWeight:
                    location.pathname === item.path ? "bold" : "normal",
                }}
              />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          {user && (
            <ListItem
              button
              onClick={() => navigate("/users")}
              selected={location.pathname === "/users"}
              sx={{
                cursor: "pointer",
                bgcolor:
                  location.pathname === "/users"
                    ? `${tickahub.gold}18`
                    : "transparent",
                borderLeft:
                  location.pathname === "/users"
                    ? `3px solid ${tickahub.gold}`
                    : "3px solid transparent",
                "&:hover": { bgcolor: `${tickahub.gold}10` },
              }}
            >
              <ListItemIcon>
                <PeopleAlt
                  color={
                    location.pathname === "/users" ? "primary" : "textSecondary"
                  }
                />
              </ListItemIcon>
              <ListItemText
                primary="Users"
                sx={{
                  cursor: "pointer",
                  color:
                    location.pathname === "/users"
                      ? "primary"
                      : "textSecondary",
                  fontWeight:
                    location.pathname === "/users" ? "bold" : "normal",
                }}
              />
            </ListItem>
          )}
          <ListItem
            button
            onClick={() => navigate("/settings")}
            selected={location.pathname === "/settings"}
            sx={{
              cursor: "pointer",
              bgcolor:
                location.pathname === "/settings"
                  ? `${tickahub.gold}18`
                  : "transparent",
              borderLeft:
                location.pathname === "/settings"
                  ? `3px solid ${tickahub.gold}`
                  : "3px solid transparent",
              "&:hover": { bgcolor: `${tickahub.gold}10` },
            }}
          >
            <ListItemIcon>
              <Gear
                size={24}
                color={
                  location.pathname === "/settings"
                    ? "primary"
                    : "textSecondary"
                }
              />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              sx={{
                cursor: "pointer",
                color:
                  location.pathname === "/settings"
                    ? "primary"
                    : "textSecondary",
                fontWeight:
                  location.pathname === "/settings" ? "bold" : "normal",
              }}
            />
          </ListItem>
          <ListItem
            button
            onClick={logout}
            sx={{
              cursor: "pointer",
              "&:hover": { bgcolor: "rgba(248, 113, 113, 0.1)" },
            }}
          >
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
    </Box>
  );
};

export default Navbar;
