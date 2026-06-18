import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  TextField,
  Button,
  alpha,
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
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  ConfirmationNumber as TicketIcon,
  Storefront as StoreIcon,
  MusicNote as ArtistIcon,
  TrendingUp as TrendingIcon,
} from "@mui/icons-material";
import {
  tickahub,
  goldGradient,
  pageShellSx,
  tabsSx,
  PageHeader,
  eventStatusColor,
} from "../shared/tickahubPageStyles";

const STATUS_CHART_COLORS = {
  pending: tickahub.gold,
  approved: tickahub.cyan,
  rejected: tickahub.goldDark,
  completed: tickahub.cyanDark,
  cancelled: tickahub.textMuted,
};

const chartTooltipSx = {
  backgroundColor: tickahub.surfaceElevated,
  border: `1px solid ${tickahub.borderLight}`,
  borderRadius: 8,
  color: "#fff",
};

const formatKes = (value) =>
  `KES ${Number(value || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const startOfYear = () => new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0];
const endOfYear = () => new Date(new Date().getFullYear(), 11, 31).toISOString().split("T")[0];

function MetricCard({ label, value, icon: Icon, accent = tickahub.cyan }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: "100%",
        position: "relative",
        overflow: "hidden",
        bgcolor: tickahub.surface,
        border: `1px solid ${tickahub.borderSubtle}`,
        borderRadius: 0,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(accent, 0.2)} 0%, transparent 70%)`,
        }}
      />
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: tickahub.textMuted, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {label}
          </Typography>
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "1.45rem", mt: 0.75, lineHeight: 1.1 }}>
            {value}
          </Typography>
        </Box>
        {Icon && (
          <Box sx={{ width: 40, height: 40, borderRadius: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: alpha(accent, 0.14), border: `1px solid ${alpha(accent, 0.28)}`, flexShrink: 0 }}>
            <Icon sx={{ color: accent, fontSize: 22 }} />
          </Box>
        )}
      </Stack>
    </Paper>
  );
}

function Panel({ title, children }) {
  return (
    <Paper elevation={0} sx={{ bgcolor: tickahub.surface, border: `1px solid ${tickahub.borderSubtle}`, borderRadius: 0, overflow: "hidden", width: "100%" }}>
      <Box sx={{ px: 2.5, py: 1.25, borderBottom: `1px solid ${tickahub.borderSubtle}`, background: `linear-gradient(135deg, ${alpha(tickahub.cyan, 0.08)}, transparent)` }}>
        <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "0.9rem" }}>{title}</Typography>
      </Box>
      <Box sx={{ p: 2.5 }}>{children}</Box>
    </Paper>
  );
}

function ActivityRow({ primary, meta, chip }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ py: 1.25, borderBottom: `1px solid ${tickahub.borderSubtle}`, "&:last-child": { borderBottom: "none" } }}>
      <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
        {primary}
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
        {chip}
        {meta && <Typography sx={{ color: tickahub.textMuted, fontSize: "0.72rem" }}>{meta}</Typography>}
      </Stack>
    </Stack>
  );
}

function StatusChip({ status }) {
  const color = eventStatusColor(status);
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        bgcolor: `${color}22`,
        color,
        fontWeight: 700,
        fontSize: "0.68rem",
        textTransform: "capitalize",
        height: 22,
      }}
    />
  );
}

const Analytics = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState(null);
  const [events, setEvents] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: startOfYear(),
    endDate: endOfYear(),
  });

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    }),
    []
  );

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const queryParams = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      const [overviewRes, eventsRes, revenueRes] = await Promise.all([
        fetch(`/api/admins/dashboard/stats?${queryParams}`, { headers: authHeaders }),
        fetch(`/api/admins/analytics/events?${queryParams}`, { headers: authHeaders }),
        fetch(`/api/admins/analytics/revenue?${queryParams}`, { headers: authHeaders }),
      ]);

      const [overviewData, eventsData, revenueData] = await Promise.all([
        overviewRes.json(),
        eventsRes.json(),
        revenueRes.json(),
      ]);

      if (!overviewData.success || !eventsData.success || !revenueData.success) {
        throw new Error("Failed to load dashboard data");
      }

      setOverview(overviewData.data);
      setEvents(eventsData.data);
      setRevenue(revenueData.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, dateRange.endDate, dateRange.startDate]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const metrics = overview?.metrics;

  const revenueChartData = useMemo(
    () =>
      (revenue?.revenueByPeriod || []).map((row) => ({
        name: row.period,
        total: Number(row.totalRevenue),
        admin: Number(row.adminRevenue),
        organizer: Number(row.organizerRevenue),
      })),
    [revenue]
  );

  const statusChartData = useMemo(
    () =>
      (events?.eventsByStatus || []).map((row) => ({
        name: row.status,
        count: row.count,
      })),
    [events]
  );

  const categoryChartData = useMemo(
    () =>
      (events?.eventsByCategory || []).map((row) => ({
        name: row.category,
        count: row.count,
      })),
    [events]
  );

  const categoryChartHeight = Math.max(categoryChartData.length * 30, 280);

  const topEventsChartData = useMemo(
    () =>
      (revenue?.topEvents || []).map((row) => ({
        name: row.eventName?.length > 18 ? `${row.eventName.slice(0, 18)}…` : row.eventName,
        revenue: Number(row.totalRevenue),
      })),
    [revenue]
  );

  const renderOverview = () => (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Organizers" value={metrics?.organizers?.total ?? 0} icon={StoreIcon} accent={tickahub.gold} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Artists" value={metrics?.artists?.total ?? 0} icon={ArtistIcon} accent={tickahub.cyan} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Events" value={metrics?.events?.total ?? 0} icon={EventIcon} accent={tickahub.cyan} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Tickets sold" value={metrics?.tickets?.sold ?? 0} icon={TicketIcon} accent={tickahub.gold} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard label="Total revenue" value={formatKes(metrics?.revenue?.total)} icon={MoneyIcon} accent={tickahub.gold} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard label="Platform share" value={formatKes(metrics?.revenue?.admin)} icon={TrendingIcon} accent={tickahub.cyan} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <MetricCard label="Organizer payouts" value={formatKes(metrics?.revenue?.organizer)} icon={PeopleIcon} accent={tickahub.cyanDark} />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Panel title="Recent events">
            {(overview?.recent?.events || []).length === 0 ? (
              <Typography sx={{ color: tickahub.textMuted, fontSize: "0.85rem" }}>—</Typography>
            ) : (
              overview.recent.events.map((event) => (
                <ActivityRow
                  key={event.id}
                  primary={event.name}
                  meta={formatDate(event.createdAt)}
                  chip={<StatusChip status={event.status} />}
                />
              ))
            )}
          </Panel>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Panel title="Recent purchases">
            {(overview?.recent?.purchases || []).length === 0 ? (
              <Typography sx={{ color: tickahub.textMuted, fontSize: "0.85rem" }}>—</Typography>
            ) : (
              overview.recent.purchases.map((purchase) => (
                <ActivityRow
                  key={purchase.id}
                  primary={purchase.eventName}
                  meta={formatKes(purchase.amount)}
                  chip={<Typography sx={{ color: tickahub.textMuted, fontSize: "0.72rem" }}>{formatDate(purchase.createdAt)}</Typography>}
                />
              ))
            )}
          </Panel>
        </Grid>
      </Grid>
    </Stack>
  );

  const renderEvents = () => (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Total events" value={events?.summary?.totalEvents ?? 0} icon={EventIcon} accent={tickahub.cyan} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Approved" value={events?.summary?.approvedEvents ?? 0} icon={EventIcon} accent={tickahub.gold} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Tickets sold" value={events?.summary?.totalTicketsSold ?? 0} icon={TicketIcon} accent={tickahub.cyan} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Completed" value={events?.summary?.completedEvents ?? 0} icon={TrendingIcon} accent={tickahub.gold} />
        </Grid>
      </Grid>

      <Panel title="Event status">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={statusChartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid stroke={tickahub.borderSubtle} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: tickahub.textMuted, fontSize: 12 }}
              tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
            <YAxis tick={{ fill: tickahub.textMuted, fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={chartTooltipSx}
              labelFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {statusChartData.map((entry) => (
                <Cell key={entry.name} fill={STATUS_CHART_COLORS[entry.name] || tickahub.cyan} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel title="Event categories">
        <Box sx={{ width: "100%", maxHeight: 520, overflowY: "auto", overflowX: "hidden" }}>
          <ResponsiveContainer width="100%" height={categoryChartHeight}>
            <BarChart
              data={categoryChartData}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
            >
              <CartesianGrid stroke={tickahub.borderSubtle} horizontal={false} />
              <XAxis type="number" tick={{ fill: tickahub.textMuted, fontSize: 11 }} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={160}
                tick={{ fill: tickahub.textMuted, fontSize: 10 }}
              />
              <Tooltip contentStyle={chartTooltipSx} />
              <Bar dataKey="count" fill={tickahub.cyan} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Panel>
    </Stack>
  );

  const renderRevenue = () => (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Gross revenue" value={formatKes(revenue?.summary?.totalRevenue)} icon={MoneyIcon} accent={tickahub.gold} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Platform share" value={formatKes(revenue?.summary?.adminRevenue)} icon={TrendingIcon} accent={tickahub.cyan} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Organizer share" value={formatKes(revenue?.summary?.organizerRevenue)} icon={PeopleIcon} accent={tickahub.cyanDark} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <MetricCard label="Transactions" value={revenue?.summary?.transactionCount ?? 0} icon={TicketIcon} accent={tickahub.gold} />
        </Grid>
      </Grid>

      <Panel title="Revenue trend">
        {revenueChartData.length === 0 ? (
          <Typography sx={{ color: tickahub.textMuted }}>—</Typography>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueChartData}>
              <defs>
                <linearGradient id="totalFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={tickahub.gold} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={tickahub.gold} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="adminFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={tickahub.cyan} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={tickahub.cyan} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={tickahub.borderSubtle} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: tickahub.textMuted, fontSize: 11 }} />
              <YAxis tick={{ fill: tickahub.textMuted, fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={chartTooltipSx} formatter={(value) => formatKes(value)} />
              <Legend wrapperStyle={{ color: tickahub.textMuted }} />
              <Area type="monotone" dataKey="total" name="Total" stroke={tickahub.gold} fill="url(#totalFill)" strokeWidth={2} />
              <Area type="monotone" dataKey="admin" name="Platform" stroke={tickahub.cyan} fill="url(#adminFill)" strokeWidth={2} />
              <Area type="monotone" dataKey="organizer" name="Organizers" stroke={tickahub.cyanDark} fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Panel>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Panel title="Top events">
            {topEventsChartData.length === 0 ? (
              <Typography sx={{ color: tickahub.textMuted }}>—</Typography>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topEventsChartData} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid stroke={tickahub.borderSubtle} horizontal={false} />
                  <XAxis type="number" tick={{ fill: tickahub.textMuted, fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fill: tickahub.textMuted, fontSize: 11 }} />
                  <Tooltip contentStyle={chartTooltipSx} formatter={(value) => formatKes(value)} />
                  <Bar dataKey="revenue" fill={tickahub.gold} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Panel>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Panel title="Commission by organizer">
            {(revenue?.commissionByOrganizer || []).length === 0 ? (
              <Typography sx={{ color: tickahub.textMuted }}>—</Typography>
            ) : (
              <Stack spacing={0}>
                {revenue.commissionByOrganizer.map((row) => (
                  <ActivityRow
                    key={row.organizerId}
                    primary={row.organizationName}
                    meta={formatKes(row.totalCommission)}
                  />
                ))}
              </Stack>
            )}
          </Panel>
        </Grid>
      </Grid>
    </Stack>
  );

  return (
    <Box sx={pageShellSx}>
      <PageHeader
        icon={DashboardIcon}
        iconGradient={goldGradient}
        title="Dashboard"
        subtitle="Platform performance, events, and revenue at a glance"
        action={
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <TextField
              label="From"
              type="date"
              size="small"
              value={dateRange.startDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{
                width: { xs: 130, sm: 150 },
                "& .MuiOutlinedInput-root": {
                  bgcolor: tickahub.navy,
                  borderRadius: 2,
                  "& fieldset": { borderColor: tickahub.borderSubtle },
                  "& input": { color: "#fff", fontSize: "0.85rem" },
                },
                "& .MuiInputLabel-root": { color: tickahub.textMuted },
              }}
            />
            <TextField
              label="To"
              type="date"
              size="small"
              value={dateRange.endDate}
              onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              sx={{
                width: { xs: 130, sm: 150 },
                "& .MuiOutlinedInput-root": {
                  bgcolor: tickahub.navy,
                  borderRadius: 2,
                  "& fieldset": { borderColor: tickahub.borderSubtle },
                  "& input": { color: "#fff", fontSize: "0.85rem" },
                },
                "& .MuiInputLabel-root": { color: tickahub.textMuted },
              }}
            />
          </Stack>
        }
      />

      <Paper
        elevation={0}
        sx={{
          bgcolor: tickahub.surface,
          border: `1px solid ${tickahub.borderSubtle}`,
          borderRadius: 0,
          overflow: "hidden",
        }}
      >
        <Box sx={{ px: { xs: 1.5, md: 2 }, pt: 1.5, borderBottom: `1px solid ${tickahub.borderSubtle}` }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={tabsSx}>
            <Tab label="Overview" />
            <Tab label="Events" />
            <Tab label="Revenue" />
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 1.5, md: 2.5 }, minHeight: 320 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 10 }}>
              <CircularProgress sx={{ color: tickahub.cyan }} />
            </Box>
          ) : error ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={fetchAnalyticsData}>
                  Retry
                </Button>
              }
              sx={{ bgcolor: alpha(tickahub.goldDark, 0.12), color: "#fff", border: `1px solid ${tickahub.borderSubtle}` }}
            >
              {error}
            </Alert>
          ) : (
            <>
              {activeTab === 0 && renderOverview()}
              {activeTab === 1 && renderEvents()}
              {activeTab === 2 && renderRevenue()}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Analytics;
