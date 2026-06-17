import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import Navbar from "./Navbar";
import Settings from "../Pages/Settings";
import NotFound from "../Pages/NotFound";
import Events from "./Events/Events";
import EventView from "./Events/EventView";
import UsersTable from "./Users/UsersTable";
import Analytics from "./Analytics/Analytics";

function PageRoutes() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on component mount
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      setLoading(false);
    } else {
      // Redirect to login if no user or token
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(false);
    }
  }, [user]);

  return (
    <Box sx={{ display: "flex" }}>
      <Navbar user={user} setUser={setUser} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 9,
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Routes>
            <Route path="home" element={<Navigate to="/analytics" replace />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="events" element={<Events />} />
            <Route path="events/:id" element={<EventView />} />
            <Route path="users" element={<UsersTable />} />
            <Route path="settings" element={<Settings user={user} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </Box>
    </Box>
  );
}

export default PageRoutes;
