import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Stack,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Tabs,
  Tab,
  alpha,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Event as EventIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Delete as DeleteIcon,
  Business as OrganizerIcon,
  ConfirmationNumber as TicketsIcon,
} from "@mui/icons-material";
import {
  tickahub,
  pageShellSx,
  tabsSx,
  eventStatusColor,
  PageHeader,
} from "../shared/tickahubPageStyles";
import { promptApproveEvent, promptRejectEvent, promptDeleteEvent } from "./eventAdminActions";

const statusTabs = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Completed", value: "completed" },
];

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalEvents, setTotalEvents] = useState(0);
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchEvents();
  }, [page, rowsPerPage, activeTab]);

  useEffect(() => {
    fetchAllEventsForCounts();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      });

      const currentStatus = statusTabs[activeTab]?.value;
      if (currentStatus && currentStatus !== "all") {
        queryParams.append("status", currentStatus);
      }

      const response = await fetch(`/api/events?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setEvents(data.data || []);
        setTotalEvents(data.count || 0);
      } else {
        setError(data.message || "Failed to fetch events");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const updateTabCounts = (eventsData) => {
    const counts = { all: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0, completed: 0 };
    eventsData.forEach((event) => {
      counts.all++;
      if (Object.prototype.hasOwnProperty.call(counts, event.status)) counts[event.status]++;
    });
    setTabCounts(counts);
  };

  const fetchAllEventsForCounts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch("/api/events?limit=1000", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) updateTabCounts(data.data || []);
    } catch (err) {
      console.error("Error fetching event counts:", err);
    }
  };

  const refresh = () => {
    fetchEvents();
    fetchAllEventsForCounts();
  };

  const handleApprove = async (event, e) => {
    e?.stopPropagation();
    const result = await promptApproveEvent(event);
    if (result.ok) refresh();
  };

  const handleReject = async (event, e) => {
    e?.stopPropagation();
    const result = await promptRejectEvent(event);
    if (result.ok) refresh();
  };

  const handleDelete = async (event, e) => {
    e?.stopPropagation();
    const result = await promptDeleteEvent(event);
    if (result.ok) refresh();
  };

  const actionBtnSx = (color) => ({
    color,
    bgcolor: alpha(color, 0.12),
    borderRadius: 2,
    "&:hover": { bgcolor: alpha(color, 0.22) },
  });

  const organizerLabel = (event) =>
    event.organizer?.organization_name || event.organizer?.full_name || "—";

  if (error && !events.length) {
    return (
      <Box sx={pageShellSx}>
        <Typography sx={{ color: "#ff6b6b" }}>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={pageShellSx}>
      <PageHeader
        icon={EventIcon}
        title="Events"
        subtitle="Review, approve, and manage organizer submissions"
      />

      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          bgcolor: tickahub.surface,
          border: `1px solid ${tickahub.borderSubtle}`,
          overflow: "hidden",
        }}
      >
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: 1.5, borderBottom: `1px solid ${tickahub.borderSubtle}` }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => {
              setActiveTab(v);
              setPage(0);
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={tabsSx}
          >
            {statusTabs.map((tab, index) => (
              <Tab
                key={tab.value}
                label={
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <span>{tab.label}</span>
                    <Chip
                      label={tabCounts[tab.value]}
                      size="small"
                      sx={{
                        height: 20,
                        minWidth: 20,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        bgcolor: activeTab === index ? `${tickahub.cyan}33` : alpha("#fff", 0.06),
                        color: activeTab === index ? tickahub.cyan : tickahub.textMuted,
                      }}
                    />
                  </Stack>
                }
              />
            ))}
          </Tabs>
        </Box>

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: tickahub.navyLight,
                  "& .MuiTableCell-head": {
                    color: tickahub.textMuted,
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    borderBottom: `1px solid ${tickahub.borderSubtle}`,
                    py: 1.25,
                  },
                }}
              >
                <TableCell>#</TableCell>
                <TableCell>Event</TableCell>
                <TableCell>Organizer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Tickets</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} sx={{ color: tickahub.cyan }} />
                  </TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography sx={{ color: tickahub.textMuted }}>No events found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event, idx) => (
                  <TableRow
                    key={event.id}
                    hover
                    onClick={() => navigate(`/events/${event.id}`)}
                    sx={{
                      cursor: "pointer",
                      "&:hover": { bgcolor: alpha(tickahub.cyan, 0.04) },
                      "& .MuiTableCell-root": {
                        color: "#fff",
                        borderBottom: `1px solid ${tickahub.borderSubtle}`,
                        fontSize: "0.875rem",
                        py: 1.5,
                      },
                    }}
                  >
                    <TableCell sx={{ color: `${tickahub.cyan} !important`, fontWeight: 700 }}>
                      {page * rowsPerPage + idx + 1}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        {event.event_name || event.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <OrganizerIcon sx={{ fontSize: 16, color: tickahub.gold }} />
                        <Typography variant="body2" sx={{ color: tickahub.textMuted }}>
                          {organizerLabel(event)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <CalendarIcon sx={{ fontSize: 16, color: tickahub.cyan }} />
                        <Typography variant="body2" sx={{ color: tickahub.textMuted }}>
                          {formatDate(event.event_date)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={event.status}
                        size="small"
                        sx={{
                          bgcolor: `${eventStatusColor(event.status)}22`,
                          color: eventStatusColor(event.status),
                          fontWeight: 700,
                          fontSize: "0.72rem",
                          textTransform: "capitalize",
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <TicketsIcon sx={{ fontSize: 16, color: tickahub.cyan }} />
                        <Typography variant="body2" sx={{ color: tickahub.textMuted, fontWeight: 600 }}>
                          {event.tickets_available ?? "—"}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="View details">
                          <IconButton size="small" onClick={() => navigate(`/events/${event.id}`)} sx={actionBtnSx(tickahub.cyan)}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {event.status === "pending" && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton size="small" onClick={(e) => handleApprove(event, e)} sx={actionBtnSx("#4ade80")}>
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton size="small" onClick={(e) => handleReject(event, e)} sx={actionBtnSx("#ff6b6b")}>
                                <RejectIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={(e) => handleDelete(event, e)} sx={actionBtnSx("#ff6b6b")}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalEvents}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            color: tickahub.textMuted,
            borderTop: `1px solid ${tickahub.borderSubtle}`,
            "& .MuiTablePagination-selectIcon": { color: tickahub.textMuted },
            "& .MuiTablePagination-actions .MuiIconButton-root": { color: tickahub.cyan },
          }}
        />
      </Paper>
    </Box>
  );
};

export default Events;
