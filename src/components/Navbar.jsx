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
import { Box, Typography } from "@mui/material";
import { Gear } from "@phosphor-icons/react";
import { tickahub, goldGradient, heroGradient } from "../tickahubTheme";
import Header from "./Header/Header";

const drawerWidth = 300;
const drawerCollapsedWidth = 76;

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
  width: drawerCollapsedWidth,
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
  whiteSpace: open ? "nowrap" : "normal",
  boxSizing: "border-box",
  overflowY: "hidden",
  "& .MuiDrawer-paper": {
    backgroundColor: tickahub.surface,
    borderRight: `1px solid ${tickahub.borderSubtle}`,
    color: "#fff",
  },
  ...(!open && {
    "& .MuiListItemIcon-root": {
      minWidth: 0,
      justifyContent: "center",
    },
  }),
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const navItemSx = (active, open) => ({
  cursor: "pointer",
  bgcolor: active ? `${tickahub.gold}18` : "transparent",
  borderLeft: open ? (active ? `3px solid ${tickahub.gold}` : "3px solid transparent") : "none",
  borderTop: !open ? (active ? `2px solid ${tickahub.gold}` : "2px solid transparent") : "none",
  flexDirection: open ? "row" : "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  py: open ? undefined : 1.25,
  px: open ? undefined : 0.75,
  gap: open ? 0 : 0.35,
  minHeight: open ? 48 : 68,
  "&:hover": { bgcolor: `${tickahub.gold}10` },
});

function DrawerNavItem({
  open,
  active,
  label,
  shortLabel,
  onClick,
  icon,
  phosphorIcon,
  activeColor = tickahub.gold,
  inactiveColor = tickahub.textMuted,
}) {
  const color = active ? activeColor : inactiveColor;
  const collapsedLabel = shortLabel || label;

  return (
    <ListItem button onClick={onClick} selected={active} sx={navItemSx(active, open)}>
      <ListItemIcon sx={{ minWidth: open ? 56 : "auto", justifyContent: "center", color }}>
        {phosphorIcon ? (
          (() => {
            const Icon = phosphorIcon;
            return <Icon size={22} color={color} weight={active ? "fill" : "regular"} />;
          })()
        ) : (
          cloneElement(icon, { sx: { fontSize: 22, color } })
        )}
      </ListItemIcon>
      {open ? (
        <ListItemText
          primary={label}
          sx={{
            "& .MuiTypography-root": {
              color: active ? "#fff" : inactiveColor,
              fontWeight: active ? 700 : 500,
            },
          }}
        />
      ) : (
        <Typography
          sx={{
            fontSize: "0.62rem",
            fontWeight: active ? 700 : 500,
            lineHeight: 1.15,
            color,
            px: 0.25,
            maxWidth: "100%",
            wordBreak: "break-word",
          }}
        >
          {collapsedLabel}
        </Typography>
      )}
    </ListItem>
  );
}

const Navbar = (props) => {
  const { user } = props;
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
    { text: "Dashboard", shortLabel: "Home", icon: <Dashboard />, path: "/analytics" },
    { text: "Events", shortLabel: "Events", icon: <Event />, path: "/events" },
  ];

  useEffect(() => {
    if (user) {
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

  const isActive = (path) => location.pathname === path;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
          <Header setUser={props.setUser} handleDrawerOpen={handleDrawerOpen} open={open} />
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader sx={{ justifyContent: open ? "space-between" : "center", px: open ? undefined : 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: open ? "flex-start" : "center",
              gap: 1.5,
              pl: open ? 0.5 : 0,
              flex: 1,
              minWidth: 0,
            }}
          >
            <Box
              component="img"
              src="/tickahub.png"
              alt="TickaHub"
              sx={{ width: 32, height: 32, borderRadius: 1.5 }}
            />
            {open && (
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
            )}
          </Box>
          {open && (
            <IconButton onClick={handleDrawerClose} sx={{ color: "#fff" }}>
              {theme.direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          )}
        </DrawerHeader>
        <Divider />
        <List sx={{ py: open ? 0 : 0.5 }}>
          {menuItems.map((item) => (
            <DrawerNavItem
              key={item.text}
              open={open}
              active={isActive(item.path)}
              label={item.text}
              shortLabel={item.shortLabel}
              onClick={() => navigate(item.path)}
              icon={item.icon}
            />
          ))}
        </List>
        <Divider />
        <List sx={{ py: open ? 0 : 0.5 }}>
          {user && (
            <DrawerNavItem
              open={open}
              active={isActive("/users")}
              label="Users"
              shortLabel="Users"
              onClick={() => navigate("/users")}
              icon={<PeopleAlt />}
            />
          )}
          <DrawerNavItem
            open={open}
            active={isActive("/settings")}
            label="Settings"
            shortLabel="Settings"
            onClick={() => navigate("/settings")}
            phosphorIcon={Gear}
          />
          <DrawerNavItem
            open={open}
            active={false}
            label="Logout"
            shortLabel="Logout"
            onClick={logout}
            icon={<Logout />}
            inactiveColor="#ff8a8a"
            activeColor="#ff8a8a"
          />
        </List>
      </Drawer>
    </Box>
  );
};

export default Navbar;
