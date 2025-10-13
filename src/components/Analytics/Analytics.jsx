import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
  LineChart,
  Line,
  Area,
  AreaChart,
  Scatter,
  ScatterChart,
  ZAxis,
} from "recharts";
import {
  Analytics as AnalyticsIcon,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Map as MapIcon,
  Speed as GaugeIcon,
  Timeline,
  Help as HelpIcon,
  Info as InfoIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  Speed as GaugeIcon2,
  Assessment as AssessmentIcon,
  Insights as InsightsIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

// Color palette for charts
const COLORS = [
  "#667eea",
  "#764ba2",
  "#f093fb",
  "#f5576c",
  "#4facfe",
  "#00f2fe",
  "#43e97b",
  "#38f9d7",
  "#ffecd2",
  "#fcb69f",
];

const Analytics = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    events: {},
    revenue: {},
  });
  // Helper function to format date for display
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split("T")[0], // January 1st of current year
    endDate: new Date(new Date().getFullYear(), 11, 31)
      .toISOString()
      .split("T")[0], // December 31st of current year
  });

  const [overviewHelpOpen, setOverviewHelpOpen] = useState(false);
  const [eventsHelpOpen, setEventsHelpOpen] = useState(false);
  const [revenueHelpOpen, setRevenueHelpOpen] = useState(false);

  const tabs = [
    { label: "Overview", icon: <AnalyticsIcon />, value: 0 },
    { label: "Events", icon: <MapIcon />, value: 1 },
    { label: "Revenue", icon: <PieChartIcon />, value: 2 },
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Build query parameters for date filtering
      const queryParams = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      // Fetch all three analytics endpoints with date filtering
      const [overviewRes, eventsRes, revenueRes] = await Promise.all([
        fetch(`/api/admins/dashboard/stats?${queryParams}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`/api/admins/analytics/events?${queryParams}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`/api/admins/analytics/revenue?${queryParams}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const [overviewData, eventsData, revenueData] = await Promise.all([
        overviewRes.json(),
        eventsRes.json(),
        revenueRes.json(),
      ]);

      console.log("Analytics API Responses:", {
        overviewData,
        eventsData,
        revenueData,
      });

      if (overviewData.success && eventsData.success && revenueData.success) {
        setAnalyticsData({
          overview: overviewData.data,
          events: eventsData.data,
          revenue: revenueData.data,
        });
        setDataLoaded(true);
      } else {
        throw new Error(
          "Failed to fetch analytics data from one or more endpoints"
        );
      }
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Overview Help Dialog Component
  const OverviewHelpDialog = () => (
    <Dialog
      open={overviewHelpOpen}
      onClose={() => setOverviewHelpOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <InfoIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Event Management Overview - Data Explanation
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This overview provides key metrics and insights about your event
          management system. Here's what each section means:
        </Typography>

        {/* Key Metrics Cards */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          📊 Key Metrics Cards
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <MapIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Total Organizers"
              secondary="The total number of event organizers registered in your system"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <BarChartIcon color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary="Total Events"
              secondary="The total number of events created in your system"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PeopleIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Tickets Sold"
              secondary="The total number of tickets sold across all events"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <GaugeIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Total Revenue"
              secondary="The total revenue generated from all ticket sales"
            />
          </ListItem>
        </List>

        {/* Event Metrics */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          📈 Event Metrics
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <AssessmentIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Completion Rate"
              secondary="The percentage of events that have been completed"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PieChartIcon color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary="Avg Tickets per Event"
              secondary="Average number of tickets sold per event"
            />
          </ListItem>
        </List>

        {/* Revenue Analysis */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          💰 Revenue Analysis
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <GaugeIcon color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Organizer Revenue"
              secondary="Total revenue earned by event organizers"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <GaugeIcon color="info" />
            </ListItemIcon>
            <ListItemText
              primary="Admin Revenue"
              secondary="Total revenue earned by the platform (admin)"
            />
          </ListItem>
        </List>

        {/* Activity Insights */}
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2, mt: 3 }}>
          💡 Activity Insights
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon>
              <PeopleIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Recent Events"
              secondary="Number of recently created events"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AssessmentIcon color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Recent Purchases"
              secondary="Number of recent ticket purchases"
            />
          </ListItem>
        </List>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>💡 Tip:</strong> These metrics help you understand event
            performance, identify areas needing attention, and track progress
            over time. Higher numbers generally indicate better performance and
            successful event management.
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOverviewHelpOpen(false)} color="primary">
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Events Help Dialog Component
  const EventsHelpDialog = () => (
    <Dialog
      open={eventsHelpOpen}
      onClose={() => setEventsHelpOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <MapIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Events Tab - Data Explanation
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The Events tab shows event status distribution, category breakdown,
          and analytics summary.
        </Typography>
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>💡 Tip:</strong> Use these charts to track event performance
            and understand your event portfolio distribution.
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEventsHelpOpen(false)} color="primary">
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Revenue Help Dialog Component
  const RevenueHelpDialog = () => (
    <Dialog
      open={revenueHelpOpen}
      onClose={() => setRevenueHelpOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PieChartIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Revenue Tab - Data Explanation
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The Revenue tab shows revenue trends, top performing events, and
          commission analysis.
        </Typography>
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>💡 Tip:</strong> Use these charts to track revenue
            performance and identify top-performing events and organizers.
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setRevenueHelpOpen(false)} color="primary">
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Modern Card Component (from Home.jsx)
  const ModernCard = ({ title, subtitle, icon, children }) => (
    <Card
      sx={{
        borderRadius: 3,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        border: "1px solid rgba(102, 126, 234, 0.1)",
        boxShadow: "0 4px 20px rgba(102, 126, 234, 0.08)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 8px 30px rgba(102, 126, 234, 0.15)",
          transform: "translateY(-2px)",
          borderColor: "rgba(102, 126, 234, 0.2)",
        },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backdropFilter: "blur(10px)",
      }}
    >
      <CardContent
        sx={{ p: 2, flex: 1, display: "flex", flexDirection: "column" }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              {icon && (
                <Avatar
                  sx={{
                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                    color: "#667eea",
                    mr: 2,
                    width: 40,
                    height: 40,
                    border: "1px solid rgba(102, 126, 234, 0.2)",
                  }}
                >
                  {icon}
                </Avatar>
              )}
              <Typography variant="h6" fontWeight="600" color="#2c3e50">
                {title}
              </Typography>
            </Box>
            {subtitle && (
              <Typography variant="body2" color="#7f8c8d">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </Box>
      </CardContent>
    </Card>
  );

  // CardItem component with improved UI and appropriate icons
  const CardItem = (props) => {
    const getCardStyle = (title) => {
      switch (title) {
        case "Total Organizers":
          return {
            icon: <PeopleIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
            bgColor: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
            borderColor: "#1976d2",
            textColor: "#1976d2",
            iconBg: "rgba(25, 118, 210, 0.1)",
          };
        case "Pending Organizers":
          return {
            icon: <PeopleIcon sx={{ fontSize: 40, color: "#ff9800" }} />,
            bgColor: "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)",
            borderColor: "#ff9800",
            textColor: "#ff9800",
            iconBg: "rgba(255, 152, 0, 0.1)",
          };
        case "Total Events":
          return {
            icon: <MapIcon sx={{ fontSize: 40, color: "#7b1fa2" }} />,
            bgColor: "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)",
            borderColor: "#7b1fa2",
            textColor: "#7b1fa2",
            iconBg: "rgba(123, 31, 162, 0.1)",
          };
        case "Pending Events":
          return {
            icon: <MapIcon sx={{ fontSize: 40, color: "#ff9800" }} />,
            bgColor: "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)",
            borderColor: "#ff9800",
            textColor: "#ff9800",
            iconBg: "rgba(255, 152, 0, 0.1)",
          };
        case "Tickets Sold":
          return {
            icon: <BarChartIcon sx={{ fontSize: 40, color: "#d32f2f" }} />,
            bgColor: "linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)",
            borderColor: "#d32f2f",
            textColor: "#d32f2f",
            iconBg: "rgba(211, 47, 47, 0.1)",
          };
        case "Total Revenue":
          return {
            icon: <TrendingUp sx={{ fontSize: 40, color: "#2e7d32" }} />,
            bgColor: "linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)",
            borderColor: "#2e7d32",
            textColor: "#2e7d32",
            iconBg: "rgba(46, 125, 50, 0.1)",
          };
        case "Admin Revenue":
          return {
            icon: <PieChartIcon sx={{ fontSize: 40, color: "#9c27b0" }} />,
            bgColor: "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)",
            borderColor: "#9c27b0",
            textColor: "#9c27b0",
            iconBg: "rgba(156, 39, 176, 0.1)",
          };
        case "Organizer Revenue":
          return {
            icon: <TrendingUp sx={{ fontSize: 40, color: "#ff5722" }} />,
            bgColor: "linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)",
            borderColor: "#ff5722",
            textColor: "#ff5722",
            iconBg: "rgba(255, 87, 34, 0.1)",
          };
        default:
          return {
            icon: <AnalyticsIcon sx={{ fontSize: 40, color: "#666" }} />,
            bgColor: "linear-gradient(135deg, #F5F5F5 0%, #EEEEEE 100%)",
            borderColor: "#666",
            textColor: "#666",
            iconBg: "rgba(102, 102, 102, 0.1)",
          };
      }
    };

    const { title, value } = props;
    const style = getCardStyle(title);

    return (
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card
          sx={{
            borderRadius: "20px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            background: style.bgColor,
            border: `2px solid ${style.borderColor}30`,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-12px) scale(1.02)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              borderColor: style.borderColor,
              "& .card-icon": {
                transform: "scale(1.15) rotate(5deg)",
              },
              "& .card-value": {
                transform: "scale(1.05)",
              },
            },
            height: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              background: `linear-gradient(90deg, ${style.borderColor}, ${style.borderColor}80, ${style.borderColor})`,
            },
            "&::after": {
              content: '""',
              position: "absolute",
              top: -50,
              right: -50,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${style.borderColor}15, transparent)`,
              transition: "all 0.3s ease",
            },
            "&:hover::after": {
              transform: "scale(1.5)",
              opacity: 0.3,
            },
          }}
        >
          <CardContent
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              flex: 1,
              position: "relative",
              zIndex: 1,
            }}
          >
            <Box
              className="card-icon"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
                width: 90,
                height: 90,
                borderRadius: "50%",
                backgroundColor: style.iconBg,
                border: `3px solid ${style.borderColor}40`,
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: `0 8px 20px ${style.borderColor}30`,
                "&:hover": {
                  backgroundColor: style.borderColor,
                  "& .MuiSvgIcon-root": {
                    color: "white",
                  },
                },
              }}
            >
              {style.icon}
            </Box>
            <Typography
              className="card-value"
              variant="h2"
              fontWeight="900"
              sx={{
                color: style.textColor,
                mb: 2,
                background: `linear-gradient(135deg, ${style.textColor}, ${style.textColor}90)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 4px 8px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              }}
            >
              {value?.toLocaleString() || 0}
            </Typography>
            <Typography
              variant="h6"
              fontWeight="700"
              sx={{
                color: style.textColor,
                opacity: 0.9,
                fontSize: "1rem",
                lineHeight: 1.3,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                transition: "all 0.3s ease",
              }}
            >
              {title}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const renderOverview = () => (
    <Box>
      {/* Overview Header with Help Button */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          Event Management Overview
        </Typography>
        <IconButton
          onClick={() => setOverviewHelpOpen(true)}
          color="primary"
          sx={{
            backgroundColor: "rgba(25, 118, 210, 0.1)",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.2)",
            },
          }}
          title="Click to understand the data shown here"
        >
          <HelpIcon />
        </IconButton>
      </Box>

      {/* Loading State for Overview */}
      {loading && !dataLoaded && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
          mb={3}
        >
          <Box textAlign="center">
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Loading overview data...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Data Content */}
      {dataLoaded && (
        <>
          {/* Key Metrics Cards */}
          <Grid container spacing={3}>
            <CardItem
              title="Total Organizers"
              value={analyticsData.overview?.stats?.totalOrganizers || 0}
            />
            <CardItem
              title="Pending Organizers"
              value={analyticsData.overview?.stats?.pendingOrganizers || 0}
            />
            <CardItem
              title="Total Events"
              value={analyticsData.overview?.stats?.totalEvents || 0}
            />
            <CardItem
              title="Pending Events"
              value={analyticsData.overview?.stats?.pendingEvents || 0}
            />
            <CardItem
              title="Tickets Sold"
              value={analyticsData.overview?.stats?.totalTicketsSold || 0}
            />
            <CardItem
              title="Total Revenue"
              value={`KSh ${parseFloat(
                analyticsData.overview?.revenue?.totalRevenue || 0
              ).toLocaleString()}`}
            />
            <CardItem
              title="Admin Revenue"
              value={`KSh ${parseFloat(
                analyticsData.overview?.revenue?.adminRevenue || 0
              ).toLocaleString()}`}
            />
            <CardItem
              title="Organizer Revenue"
              value={`KSh ${parseFloat(
                analyticsData.overview?.revenue?.organizerRevenue || 0
              ).toLocaleString()}`}
            />
          </Grid>

          {/* Date Range Display */}
          {analyticsData.overview?.dateRange && (
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid size={{ xs: 12 }}>
                <Card
                  sx={{
                    p: 2,
                    backgroundColor: "rgba(25, 118, 210, 0.05)",
                    border: "1px solid rgba(25, 118, 210, 0.1)",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                  >
                    <strong>Data Period:</strong>{" "}
                    {analyticsData.overview.dateRange.start
                      ? `${new Date(
                          analyticsData.overview.dateRange.start
                        ).toLocaleDateString()} - ${new Date(
                          analyticsData.overview.dateRange.end
                        ).toLocaleDateString()}`
                      : "All time"}
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                    transform: "translateY(-2px)",
                  },
                  height: 280,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent
                  sx={{
                    p: 3,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    Event Metrics
                  </Typography>
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={2}
                      sx={{
                        backgroundColor: "rgba(25, 118, 210, 0.05)",
                        borderRadius: 2,
                        border: "1px solid rgba(25, 118, 210, 0.1)",
                      }}
                    >
                      <Typography fontWeight="500">Completion Rate</Typography>
                      <Chip
                        label={`${analyticsData.events?.completionRate || 0}%`}
                        color="primary"
                      />
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={2}
                      sx={{
                        backgroundColor: "rgba(156, 39, 176, 0.05)",
                        borderRadius: 2,
                        border: "1px solid rgba(156, 39, 176, 0.1)",
                      }}
                    >
                      <Typography fontWeight="500">
                        Avg Tickets per Event
                      </Typography>
                      <Chip
                        label={`${
                          analyticsData.events?.avgTicketsPerEvent
                            ?.avgTickets || 0
                        }`}
                        color="secondary"
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                    transform: "translateY(-2px)",
                  },
                  height: 280,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent
                  sx={{
                    p: 3,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    Revenue Analysis
                  </Typography>
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={2}
                      sx={{
                        backgroundColor: "rgba(76, 175, 80, 0.05)",
                        borderRadius: 2,
                        border: "1px solid rgba(76, 175, 80, 0.1)",
                      }}
                    >
                      <Typography fontWeight="500">
                        Organizer Revenue
                      </Typography>
                      <Chip
                        label={`KSh ${parseFloat(
                          analyticsData.overview?.revenue?.organizerRevenue || 0
                        ).toLocaleString()}`}
                        color="success"
                      />
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={2}
                      sx={{
                        backgroundColor: "rgba(0, 188, 212, 0.05)",
                        borderRadius: 2,
                        border: "1px solid rgba(0, 188, 212, 0.1)",
                      }}
                    >
                      <Typography fontWeight="500">Total Tickets</Typography>
                      <Chip
                        label={`${
                          analyticsData.events?.avgTicketsPerEvent
                            ?.totalTickets || 0
                        }`}
                        color="info"
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                    transform: "translateY(-2px)",
                  },
                  height: 280,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent
                  sx={{
                    p: 3,
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    Recent Activity
                  </Typography>
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={2}
                      sx={{
                        backgroundColor: "rgba(25, 118, 210, 0.05)",
                        borderRadius: 2,
                        border: "1px solid rgba(25, 118, 210, 0.1)",
                      }}
                    >
                      <Typography fontWeight="500">Recent Events</Typography>
                      <Chip
                        label={`${
                          analyticsData.overview?.recentActivities?.recentEvents
                            ?.length || 0
                        }`}
                        color="primary"
                      />
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={2}
                      sx={{
                        backgroundColor: "rgba(255, 152, 0, 0.05)",
                        borderRadius: 2,
                        border: "1px solid rgba(255, 152, 0, 0.1)",
                      }}
                    >
                      <Typography fontWeight="500">Recent Purchases</Typography>
                      <Chip
                        label={`${
                          analyticsData.overview?.recentActivities
                            ?.recentPurchases?.length || 0
                        }`}
                        color="warning"
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Activities Details */}
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Recent Events
                </Typography>
                {(analyticsData.overview?.recentActivities?.recentEvents || [])
                  .length > 0 ? (
                  <List>
                    {(
                      analyticsData.overview?.recentActivities?.recentEvents ||
                      []
                    ).map((event) => (
                      <ListItem key={event.id}>
                        <ListItemIcon>
                          <MapIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={event.event_name}
                          secondary={`Status: ${event.status} | Organizer: ${
                            event.organizer?.organization_name || "N/A"
                          } | Created: ${new Date(
                            event.createdAt
                          ).toLocaleDateString()}`}
                        />
                        <Chip
                          label={event.status}
                          color={
                            event.status === "approved" ? "success" : "primary"
                          }
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", py: 2 }}
                  >
                    No recent events
                  </Typography>
                )}
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Recent Purchases
                </Typography>
                {(
                  analyticsData.overview?.recentActivities?.recentPurchases ||
                  []
                ).length > 0 ? (
                  <List>
                    {(
                      analyticsData.overview?.recentActivities
                        ?.recentPurchases || []
                    ).map((purchase) => (
                      <ListItem key={purchase.id}>
                        <ListItemIcon>
                          <BarChartIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${purchase.quantity} tickets`}
                          secondary={`Event: ${
                            purchase.event?.event_name || "N/A"
                          } | Amount: KSh ${parseFloat(
                            purchase.total_amount || 0
                          ).toLocaleString()} | Status: ${purchase.status}`}
                        />
                        <Chip
                          label={purchase.status}
                          color={
                            purchase.status === "paid" ? "success" : "primary"
                          }
                          size="small"
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", py: 2 }}
                  >
                    No recent purchases
                  </Typography>
                )}
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Fallback when data is not loaded */}
      {!dataLoaded && !loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
          mb={3}
        >
          <Box textAlign="center">
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No data available
            </Typography>
            <Button
              variant="contained"
              onClick={fetchAnalyticsData}
              startIcon={<RefreshIcon />}
            >
              Load Data
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );

  const renderEvents = () => (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="600" color="text.primary">
            Event Status & Distribution
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Event status breakdown and category distribution
          </Typography>
        </Box>
        <IconButton
          onClick={() => setEventsHelpOpen(true)}
          color="primary"
          sx={{
            backgroundColor: "rgba(25, 118, 210, 0.1)",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.2)",
            },
          }}
          title="Click to understand the data shown here"
        >
          <HelpIcon />
        </IconButton>
      </Box>

      {/* Loading State for Events */}
      {loading && !dataLoaded && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
          mb={3}
        >
          <Box textAlign="center">
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Loading event data...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Data Content */}
      {dataLoaded && (
        <>
          <Grid container spacing={3}>
            {/* Event Status Chart */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Event Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  {(analyticsData.events?.eventStats || []).length > 0 ? (
                    <PieChart>
                      <Pie
                        data={(analyticsData.events?.eventStats || []).map(
                          (item) => ({
                            name: item.status,
                            value: parseInt(item.count) || 0,
                          })
                        )}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="90%"
                        innerRadius="50%"
                        fill="#8884d8"
                      >
                        {(analyticsData.events?.eventStats || []).map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Events"]} />
                      <Legend />
                    </PieChart>
                  ) : (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                    >
                      <Typography variant="body2" color="text.secondary">
                        No event data available
                      </Typography>
                    </Box>
                  )}
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Event Category Chart */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Event Category Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={(analyticsData.events?.eventsByCategory || []).map(
                      (item) => ({
                        ...item,
                        count: parseInt(item.count) || 0,
                      })
                    )}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, "Events"]} />
                    <Bar dataKey="count" fill="#f093fb" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Event Analytics Summary */}
            <Grid size={{ xs: 12 }}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Event Analytics Summary
                </Typography>
                <Grid
                  container
                  spacing={0}
                  sx={{ justifyContent: "space-between" }}
                >
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box
                      textAlign="center"
                      sx={{
                        p: 3,
                        borderRight: {
                          xs: "none",
                          sm: "1px solid rgba(0,0,0,0.1)",
                        },
                        "&:last-child": {
                          borderRight: "none",
                        },
                      }}
                    >
                      <Typography
                        variant="h3"
                        color="primary"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        {analyticsData.events?.avgTicketsPerEvent?.avgTickets ||
                          0}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          fontWeight: 500,
                          fontSize: "0.95rem",
                          lineHeight: 1.3,
                        }}
                      >
                        Avg Tickets per Event
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box
                      textAlign="center"
                      sx={{
                        p: 3,
                        borderRight: {
                          xs: "none",
                          sm: "1px solid rgba(0,0,0,0.1)",
                        },
                        "&:last-child": {
                          borderRight: "none",
                        },
                      }}
                    >
                      <Typography
                        variant="h3"
                        color="success.main"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        {analyticsData.events?.avgTicketsPerEvent
                          ?.totalTickets || 0}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          fontWeight: 500,
                          fontSize: "0.95rem",
                          lineHeight: 1.3,
                        }}
                      >
                        Total Tickets Sold
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Box
                      textAlign="center"
                      sx={{
                        p: 3,
                        "&:last-child": {
                          borderRight: "none",
                        },
                      }}
                    >
                      <Typography
                        variant="h3"
                        color="warning.main"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        {analyticsData.events?.completionRate || 0}%
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          fontWeight: 500,
                          fontSize: "0.95rem",
                          lineHeight: 1.3,
                        }}
                      >
                        Completion Rate
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Fallback when data is not loaded */}
      {!dataLoaded && !loading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
          mb={3}
        >
          <Box textAlign="center">
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No event data available
            </Typography>
            <Button
              variant="contained"
              onClick={fetchAnalyticsData}
              startIcon={<RefreshIcon />}
            >
              Load Data
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );

  // Custom Bar Chart Component (similar to Home component)
  const CustomBarChart = ({ data, title, height = 400 }) => {
    return (
      <Box height={height} width="100%">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
                stroke="#666"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Bar
                dataKey="voterRegistrationRate"
                fill="#667eea"
                name="Registration Rate (%)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="supporterDensity"
                fill="#f093fb"
                name="Supporter Density (%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Box
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            <Typography variant="body2" color="text.secondary">
              No performance data available
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const renderRevenue = () => (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="600" color="text.primary">
            Revenue Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Revenue trends, top events, and commission analysis
          </Typography>
        </Box>
        <IconButton
          onClick={() => setRevenueHelpOpen(true)}
          color="primary"
          sx={{
            backgroundColor: "rgba(25, 118, 210, 0.1)",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.2)",
            },
          }}
          title="Click to understand the data shown here"
        >
          <HelpIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Revenue by Period Chart */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Revenue by Period ({analyticsData.revenue?.period || "month"})
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              {(analyticsData.revenue?.revenueByPeriod || []).length > 0 ? (
                <BarChart
                  data={(analyticsData.revenue?.revenueByPeriod || []).map(
                    (item) => ({
                      ...item,
                      totalRevenue: parseFloat(item.totalRevenue) || 0,
                      adminRevenue: parseFloat(item.adminRevenue) || 0,
                      organizerRevenue: parseFloat(item.organizerRevenue) || 0,
                      transactionCount: parseInt(item.transactionCount) || 0,
                    })
                  )}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                    formatter={(value, name) => [
                      `KSh ${parseFloat(value).toLocaleString()}`,
                      name === "totalRevenue"
                        ? "Total Revenue"
                        : name === "adminRevenue"
                        ? "Admin Revenue"
                        : name === "organizerRevenue"
                        ? "Organizer Revenue"
                        : name,
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="totalRevenue"
                    fill="#667eea"
                    name="Total Revenue"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="adminRevenue"
                    fill="#f093fb"
                    name="Admin Revenue"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="organizerRevenue"
                    fill="#43e97b"
                    name="Organizer Revenue"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                >
                  <Typography variant="body2" color="text.secondary">
                    No revenue data available
                  </Typography>
                </Box>
              )}
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Top Events by Revenue */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Top Events by Revenue
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              {(analyticsData.revenue?.topEvents || []).length > 0 ? (
                <BarChart
                  data={(analyticsData.revenue?.topEvents || []).map(
                    (item) => ({
                      ...item,
                      totalRevenue: parseFloat(item.totalRevenue) || 0,
                      transactionCount: parseInt(item.transactionCount) || 0,
                    })
                  )}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="event_name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                    formatter={(value) => [
                      `KSh ${parseFloat(value).toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="totalRevenue"
                    fill="#667eea"
                    name="Revenue"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                >
                  <Typography variant="body2" color="text.secondary">
                    No top events data available
                  </Typography>
                </Box>
              )}
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Commission by Organizer */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Commission by Organizer
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              {(analyticsData.revenue?.commissionByOrganizer || []).length >
              0 ? (
                <BarChart
                  data={(
                    analyticsData.revenue?.commissionByOrganizer || []
                  ).map((item) => ({
                    ...item,
                    totalCommission: parseFloat(item.totalCommission) || 0,
                    transactionCount: parseInt(item.transactionCount) || 0,
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="organization_name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                    formatter={(value) => [
                      `KSh ${parseFloat(value).toLocaleString()}`,
                      "Commission",
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="totalCommission"
                    fill="#f093fb"
                    name="Commission"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                >
                  <Typography variant="body2" color="text.secondary">
                    No commission data available
                  </Typography>
                </Box>
              )}
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Revenue Summary */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Revenue Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    KSh{" "}
                    {parseFloat(
                      analyticsData.revenue?.revenueByPeriod?.reduce(
                        (sum, item) => sum + parseFloat(item.totalRevenue || 0),
                        0
                      ) || 0
                    ).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box textAlign="center" p={2}>
                  <Typography
                    variant="h4"
                    color="success.main"
                    fontWeight="bold"
                  >
                    KSh{" "}
                    {parseFloat(
                      analyticsData.revenue?.revenueByPeriod?.reduce(
                        (sum, item) => sum + parseFloat(item.adminRevenue || 0),
                        0
                      ) || 0
                    ).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Admin Revenue
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box textAlign="center" p={2}>
                  <Typography
                    variant="h4"
                    color="warning.main"
                    fontWeight="bold"
                  >
                    KSh{" "}
                    {parseFloat(
                      analyticsData.revenue?.revenueByPeriod?.reduce(
                        (sum, item) =>
                          sum + parseFloat(item.organizerRevenue || 0),
                        0
                      ) || 0
                    ).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Organizer Revenue
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" color="info.main" fontWeight="bold">
                    {analyticsData.revenue?.revenueByPeriod?.reduce(
                      (sum, item) => sum + parseInt(item.transactionCount || 0),
                      0
                    ) || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Transactions
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Custom Pie Chart Component (similar to Home component)
  const CustomPieChart = ({ data, title, height = 300 }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const onPieEnter = (_, index) => {
      setActiveIndex(index);
    };

    const renderActiveShape = (props) => {
      const RADIAN = Math.PI / 180;
      const {
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        fill,
        payload,
        percent,
        value,
      } = props;
      const sin = Math.sin(-RADIAN * midAngle);
      const cos = Math.cos(-RADIAN * midAngle);
      const sx = cx + (outerRadius + 2) * cos;
      const sy = cy + (outerRadius + 2) * sin;
      const mx = cx + (outerRadius + 2) * cos;
      const my = cy + (outerRadius + 2) * sin;
      const ex = mx + (cos >= 0 ? 1 : -1) * 22;
      const ey = my;
      const textAnchor = cos >= 0 ? "start" : "end";

      return (
        <g>
          <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
            {payload.name}
          </text>
          <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
          />
          <Sector
            cx={cx}
            cy={cy}
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={outerRadius + 2}
            outerRadius={outerRadius + 6}
            fill={fill}
          />
          <path
            d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
            stroke={fill}
            fill="none"
          />
          <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
          <text
            x={ex + (cos >= 0 ? 1 : -1) * 4}
            y={ey}
            textAnchor={textAnchor}
            fill="#333"
            fontSize="small"
          >{`${value}`}</text>
          <text
            x={ex + (cos >= 0 ? 1 : -1) * 4}
            y={ey}
            dy={18}
            textAnchor={textAnchor}
            fill="#999"
            fontSize="small"
          >
            {`(${(percent * 100).toFixed(0)}%)`}
          </text>
        </g>
      );
    };

    return (
      <Box height={height} width="100%">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="90%"
                innerRadius="50%"
                fill="#8884d8"
                onMouseEnter={onPieEnter}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Box
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="body2">No data available</Typography>
          </Box>
        )}
      </Box>
    );
  };

  const renderBudgetResources = () => (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="600" color="text.primary">
            Budget & Resource Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Budget analysis and resource allocation across projects
          </Typography>
        </Box>
        <IconButton
          onClick={() => setBudgetResourcesHelpOpen(true)}
          color="primary"
          sx={{
            backgroundColor: "rgba(25, 118, 210, 0.1)",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.2)",
            },
          }}
          title="Click to understand the data shown here"
        >
          <HelpIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Budget Overview */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Budget Overview
            </Typography>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Total Budgeted:</Typography>
                <Typography variant="h6" color="primary">
                  KSh{" "}
                  {parseFloat(
                    analyticsData.budget?.totalBudgeted || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Total Actual:</Typography>
                <Typography variant="h6" color="secondary">
                  KSh{" "}
                  {parseFloat(
                    analyticsData.budget?.totalActual || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Variance:</Typography>
                <Typography
                  variant="h6"
                  color={
                    parseFloat(analyticsData.budget?.variance || 0) >= 0
                      ? "success.main"
                      : "error.main"
                  }
                >
                  KSh{" "}
                  {parseFloat(
                    analyticsData.budget?.variance || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Utilization:</Typography>
                <Typography variant="h6" color="info.main">
                  {analyticsData.budget?.utilizationPercent || 0}%
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Budget by Category */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Budget by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              {(analyticsData.budget?.byCategory || []).length > 0 ? (
                <PieChart>
                  <Pie
                    data={(analyticsData.budget?.byCategory || []).map(
                      (item) => ({
                        name: item.category,
                        value: parseFloat(item.totalAmount) || 0,
                      })
                    )}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="90%"
                    innerRadius="50%"
                    fill="#8884d8"
                  >
                    {(analyticsData.budget?.byCategory || []).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      `KSh ${parseFloat(value).toLocaleString()}`
                    }
                  />
                  <Legend />
                </PieChart>
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                >
                  <Typography variant="body2" color="text.secondary">
                    No budget data available
                  </Typography>
                </Box>
              )}
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Project Resources */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Project Resource Allocation
            </Typography>
            <List>
              {(analyticsData.projects?.resources || []).map((project) => (
                <ListItem key={project.project_id}>
                  <ListItemIcon>
                    <MapIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={project.project_name}
                    secondary={`Status: ${project.status} | Progress: ${project.progress_percent}%`}
                  />
                  <Box display="flex" gap={1}>
                    <Chip
                      label={`Materials: ${project.materialCount}`}
                      size="small"
                      color="primary"
                    />
                    <Chip
                      label={`Labor: ${project.laborCount}`}
                      size="small"
                      color="secondary"
                    />
                    <Chip
                      label={`Equipment: ${project.equipmentCount}`}
                      size="small"
                      color="success"
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderPerformance = () => (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="600" color="text.primary">
            Performance Metrics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Task completion rates and project performance indicators
          </Typography>
        </Box>
        <IconButton
          onClick={() => setPerformanceHelpOpen(true)}
          color="primary"
          sx={{
            backgroundColor: "rgba(25, 118, 210, 0.1)",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.2)",
            },
          }}
          title="Click to understand the data shown here"
        >
          <HelpIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Performance Overview */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Performance Overview
            </Typography>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Task Completion Rate:</Typography>
                <Typography variant="h5" color="primary">
                  {analyticsData.performance?.taskCompletionRate || 0}%
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Completed Tasks:</Typography>
                <Typography variant="h6" color="success.main">
                  {analyticsData.performance?.completedTasks || 0}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>In Progress Tasks:</Typography>
                <Typography variant="h6" color="warning.main">
                  {analyticsData.performance?.inProgressTasks || 0}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Projects at Risk:</Typography>
                <Typography
                  variant="h6"
                  color={
                    analyticsData.performance?.projectsAtRisk > 0
                      ? "error.main"
                      : "success.main"
                  }
                >
                  {analyticsData.performance?.projectsAtRisk || 0}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Material Utilization */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: 300 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Material Utilization
            </Typography>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Total Required:</Typography>
                <Typography variant="h6" color="primary">
                  {parseFloat(
                    analyticsData.materials?.summary?.totalRequired || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Total Used:</Typography>
                <Typography variant="h6" color="secondary">
                  {parseFloat(
                    analyticsData.materials?.summary?.totalUsed || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Utilization:</Typography>
                <Typography variant="h6" color="info.main">
                  {analyticsData.materials?.summary?.utilizationPercent || 0}%
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Total Cost:</Typography>
                <Typography variant="h6" color="success.main">
                  KSh{" "}
                  {parseFloat(
                    analyticsData.materials?.summary?.totalCost || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Equipment Summary */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Equipment & Cost Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {analyticsData.overview?.totalEquipment || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Equipment
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box textAlign="center" p={2}>
                  <Typography
                    variant="h4"
                    color="success.main"
                    fontWeight="bold"
                  >
                    {analyticsData.equipmentSummary?.availableEquipment || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available Equipment
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box textAlign="center" p={2}>
                  <Typography
                    variant="h4"
                    color="warning.main"
                    fontWeight="bold"
                  >
                    KSh{" "}
                    {parseFloat(
                      analyticsData.equipmentSummary?.totalDailyRentalCost || 0
                    ).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Daily Rental Cost
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box textAlign="center" p={2}>
                  <Typography variant="h4" color="info.main" fontWeight="bold">
                    {analyticsData.overview?.overdueTasks || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue Tasks
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderEquipmentMaterials = () => (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="600" color="text.primary">
            Equipment & Materials Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Equipment availability, material utilization, and resource
            management
          </Typography>
        </Box>
        <IconButton
          onClick={() => setEquipmentMaterialsHelpOpen(true)}
          color="primary"
          sx={{
            backgroundColor: "rgba(25, 118, 210, 0.1)",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.2)",
            },
          }}
          title="Click to understand the data shown here"
        >
          <HelpIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* Equipment Availability */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Equipment Availability
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              {(analyticsData.equipment?.byAvailability || []).length > 0 ? (
                <PieChart>
                  <Pie
                    data={(analyticsData.equipment?.byAvailability || []).map(
                      (item) => ({
                        name: item.availability ? "Available" : "Unavailable",
                        value: parseInt(item.count) || 0,
                      })
                    )}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="90%"
                    innerRadius="50%"
                    fill="#8884d8"
                  >
                    {(analyticsData.equipment?.byAvailability || []).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Equipment"]} />
                  <Legend />
                </PieChart>
              ) : (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                >
                  <Typography variant="body2" color="text.secondary">
                    No equipment data available
                  </Typography>
                </Box>
              )}
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Labor Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Labor Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={(analyticsData.labor?.byStatus || []).map((item) => ({
                  ...item,
                  count: parseInt(item.count) || 0,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip formatter={(value) => [value, "Workers"]} />
                <Bar dataKey="count" fill="#f093fb" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        {/* Material Summary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Material Summary
            </Typography>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Total Required:</Typography>
                <Typography variant="h6" color="primary">
                  {parseFloat(
                    analyticsData.materials?.summary?.totalRequired || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Total Used:</Typography>
                <Typography variant="h6" color="secondary">
                  {parseFloat(
                    analyticsData.materials?.summary?.totalUsed || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Utilization:</Typography>
                <Typography variant="h6" color="info.main">
                  {analyticsData.materials?.summary?.utilizationPercent || 0}%
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Total Cost:</Typography>
                <Typography variant="h6" color="success.main">
                  KSh{" "}
                  {parseFloat(
                    analyticsData.materials?.summary?.totalCost || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Total Spent:</Typography>
                <Typography variant="h6" color="warning.main">
                  KSh{" "}
                  {parseFloat(
                    analyticsData.materials?.summary?.totalSpent || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Equipment Summary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Equipment Summary
            </Typography>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Available Equipment:</Typography>
                <Typography variant="h6" color="success.main">
                  {analyticsData.equipmentSummary?.availableEquipment || 0}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Total Equipment:</Typography>
                <Typography variant="h6" color="primary">
                  {analyticsData.overview?.totalEquipment || 0}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Daily Rental Cost:</Typography>
                <Typography variant="h6" color="warning.main">
                  KSh{" "}
                  {parseFloat(
                    analyticsData.equipmentSummary?.totalDailyRentalCost || 0
                  ).toLocaleString()}
                </Typography>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography>Equipment Utilization:</Typography>
                <Typography variant="h6" color="info.main">
                  {analyticsData.equipmentSummary?.availableEquipment > 0
                    ? Math.round(
                        (analyticsData.equipmentSummary?.availableEquipment /
                          analyticsData.overview?.totalEquipment) *
                          100
                      )
                    : 0}
                  %
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>

        {/* Issues Summary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Issues Summary
            </Typography>
            <Stack spacing={2}>
              {(analyticsData.issues?.byStatus || []).map((issue) => (
                <Box
                  key={issue.status}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={2}
                  sx={{
                    backgroundColor: "rgba(25, 118, 210, 0.05)",
                    borderRadius: 2,
                    border: "1px solid rgba(25, 118, 210, 0.1)",
                  }}
                >
                  <Typography fontWeight="500" textTransform="capitalize">
                    {issue.status.replace("_", " ")} Issues
                  </Typography>
                  <Chip
                    label={issue.count}
                    color={
                      issue.status === "resolved"
                        ? "success"
                        : issue.status === "open"
                        ? "error"
                        : "warning"
                    }
                  />
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>

        {/* Documents Summary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="600">
              Documents & Activity
            </Typography>
            <Stack spacing={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={2}
                sx={{
                  backgroundColor: "rgba(76, 175, 80, 0.05)",
                  borderRadius: 2,
                  border: "1px solid rgba(76, 175, 80, 0.1)",
                }}
              >
                <Typography fontWeight="500">Total Documents:</Typography>
                <Chip
                  label={analyticsData.overview?.totalDocuments || 0}
                  color="success"
                />
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={2}
                sx={{
                  backgroundColor: "rgba(255, 152, 0, 0.05)",
                  borderRadius: 2,
                  border: "1px solid rgba(255, 152, 0, 0.1)",
                }}
              >
                <Typography fontWeight="500">Progress Updates:</Typography>
                <Chip
                  label={
                    analyticsData.recentActivity?.progressUpdates?.length || 0
                  }
                  color="warning"
                />
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={2}
                sx={{
                  backgroundColor: "rgba(156, 39, 176, 0.05)",
                  borderRadius: 2,
                  border: "1px solid rgba(156, 39, 176, 0.1)",
                }}
              >
                <Typography fontWeight="500">Overdue Tasks:</Typography>
                <Chip
                  label={analyticsData.overview?.overdueTasks || 0}
                  color="secondary"
                />
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderOverview();
      case 1:
        return renderEvents();
      case 2:
        return renderRevenue();
      default:
        return renderOverview();
    }
  };

  // Show error message if there's an error
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchAnalyticsData} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1.5 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: "bold",
          mb: 1.5,
          color: "#2c3e50",
          textAlign: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Event Management Dashboard
      </Typography>

      {/* Date Range Selector */}
      <Card
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 2,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          border: "1px solid rgba(102, 126, 234, 0.1)",
          boxShadow: "0 4px 20px rgba(102, 126, 234, 0.1)",
        }}
      >
        <Typography variant="h6" gutterBottom fontWeight="600">
          Filter by Date Range
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Start Date"
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="End Date"
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Quick Select</InputLabel>
              <Select
                value=""
                onChange={(e) => {
                  const today = new Date();
                  switch (e.target.value) {
                    case "today":
                      setDateRange({
                        startDate: today.toISOString().split("T")[0],
                        endDate: today.toISOString().split("T")[0],
                      });
                      break;
                    case "week":
                      const weekStart = new Date(today);
                      weekStart.setDate(today.getDate() - 7);
                      setDateRange({
                        startDate: weekStart.toISOString().split("T")[0],
                        endDate: today.toISOString().split("T")[0],
                      });
                      break;
                    case "month":
                      const monthStart = new Date(today);
                      monthStart.setMonth(today.getMonth() - 1);
                      setDateRange({
                        startDate: monthStart.toISOString().split("T")[0],
                        endDate: today.toISOString().split("T")[0],
                      });
                      break;
                    case "year":
                      const yearStart = new Date(today);
                      yearStart.setFullYear(today.getFullYear() - 1);
                      setDateRange({
                        startDate: yearStart.toISOString().split("T")[0],
                        endDate: today.toISOString().split("T")[0],
                      });
                      break;
                    default:
                      break;
                  }
                }}
                label="Quick Select"
              >
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">Last 7 Days</MenuItem>
                <MenuItem value="month">Last 30 Days</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      <Card
        sx={{
          borderRadius: 3,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          border: "1px solid rgba(102, 126, 234, 0.1)",
          boxShadow: "0 8px 32px rgba(102, 126, 234, 0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "rgba(102, 126, 234, 0.1)",
            backgroundColor: "rgba(102, 126, 234, 0.02)",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                color: "#667eea",
                fontWeight: 600,
                minHeight: 60,
                fontSize: "0.875rem",
                padding: "8px 12px",
                "&.Mui-selected": {
                  color: "#667eea",
                  backgroundColor: "rgba(102, 126, 234, 0.08)",
                },
                "&:hover": {
                  backgroundColor: "rgba(102, 126, 234, 0.05)",
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#667eea",
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.value}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                sx={{ minHeight: 60 }}
              />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ p: 1.5 }}>{renderTabContent()}</Box>
      </Card>

      {/* Help Dialogs */}
      <OverviewHelpDialog />
      <EventsHelpDialog />
      <RevenueHelpDialog />
    </Box>
  );
};

export default Analytics;
