import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
  FormControlLabel,
  Switch,
  Avatar,
  Tabs,
  Tab,
  InputAdornment,
  Divider,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  AdminPanelSettings as AdminIcon,
  Event as EventIcon,
  MicExternalOn as ArtistIcon,
  Check as ApproveIcon,
  Block as SuspendIcon,
  Search as SearchIcon,
  Groups as GroupsIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { tickahub, goldGradient, cyanGradient, backgroundGradient } from "../../tickahubTheme";

const ROLE_TABS = [
  {
    role: "admin",
    label: "Admins",
    icon: AdminIcon,
    subtitle: "Create, edit, and delete platform administrators",
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canApprove: false,
  },
  {
    role: "event_organizer",
    label: "Organizers",
    icon: EventIcon,
    subtitle: "View, approve, or suspend event organizer accounts",
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canApprove: true,
  },
  {
    role: "artist",
    label: "Artists",
    icon: ArtistIcon,
    subtitle: "View registered artist accounts",
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canApprove: false,
  },
];

/** Table columns — keys match backend User model fields */
const TABLE_COLUMNS = {
  admin: [
    { key: "full_name", label: "full_name" },
    { key: "email", label: "email" },
    { key: "phone", label: "phone" },
    { key: "isActive", label: "isActive" },
  ],
  event_organizer: [
    { key: "organization_name", label: "organization_name" },
    { key: "full_name", label: "full_name" },
    { key: "email", label: "email" },
    { key: "phone", label: "phone" },
    { key: "organizer_status", label: "organizer_status" },
  ],
  artist: [
    { key: "stage_name", label: "stage_name" },
    { key: "full_name", label: "full_name" },
    { key: "email", label: "email" },
    { key: "phone", label: "phone" },
    { key: "genre", label: "genre" },
    { key: "isActive", label: "isActive" },
  ],
};

/** View / edit field definitions per role — keys match backend */
const ROLE_FIELDS = {
  admin: [
    { key: "full_name", label: "full_name", type: "text" },
    { key: "email", label: "email", type: "text", readOnlyOnEdit: true },
    { key: "phone", label: "phone", type: "text" },
    { key: "role", label: "role", type: "text", viewOnly: true },
    { key: "isActive", label: "isActive", type: "boolean" },
    { key: "lastLogin", label: "lastLogin", type: "datetime", viewOnly: true },
    { key: "createdAt", label: "createdAt", type: "datetime", viewOnly: true },
  ],
  event_organizer: [
    { key: "full_name", label: "full_name", type: "text", viewOnly: true },
    { key: "email", label: "email", type: "text", viewOnly: true },
    { key: "phone", label: "phone", type: "text", viewOnly: true },
    { key: "organization_name", label: "organization_name", type: "text", viewOnly: true },
    { key: "address", label: "address", type: "text", viewOnly: true },
    { key: "kra_pin", label: "kra_pin", type: "text", viewOnly: true },
    { key: "pesapal_merchant_ref", label: "pesapal_merchant_ref", type: "text", viewOnly: true },
    { key: "bank_name", label: "bank_name", type: "text", viewOnly: true },
    { key: "bank_account_number", label: "bank_account_number", type: "text", viewOnly: true },
    { key: "organizer_status", label: "organizer_status", type: "status", viewOnly: true },
    { key: "isActive", label: "isActive", type: "boolean", viewOnly: true },
    { key: "lastLogin", label: "lastLogin", type: "datetime", viewOnly: true },
    { key: "createdAt", label: "createdAt", type: "datetime", viewOnly: true },
  ],
  artist: [
    { key: "stage_name", label: "stage_name", type: "text", viewOnly: true },
    { key: "full_name", label: "full_name", type: "text", viewOnly: true },
    { key: "email", label: "email", type: "text", viewOnly: true },
    { key: "phone", label: "phone", type: "text", viewOnly: true },
    { key: "bio", label: "bio", type: "textarea", viewOnly: true },
    { key: "genre", label: "genre", type: "text", viewOnly: true },
    { key: "profile_image", label: "profile_image", type: "image", viewOnly: true },
    { key: "facebook_url", label: "facebook_url", type: "text", viewOnly: true },
    { key: "instagram_url", label: "instagram_url", type: "text", viewOnly: true },
    { key: "tiktok_url", label: "tiktok_url", type: "text", viewOnly: true },
    { key: "twitter_url", label: "twitter_url", type: "text", viewOnly: true },
    { key: "linkedin_url", label: "linkedin_url", type: "text", viewOnly: true },
    { key: "isActive", label: "isActive", type: "boolean", viewOnly: true },
    { key: "lastLogin", label: "lastLogin", type: "datetime", viewOnly: true },
    { key: "createdAt", label: "createdAt", type: "datetime", viewOnly: true },
  ],
};

const CREATE_ADMIN_FIELDS = [
  { key: "full_name", label: "full_name", required: true },
  { key: "email", label: "email", required: true, type: "email" },
  { key: "phone", label: "phone", required: false },
  { key: "password", label: "password", required: true, type: "password" },
];

const swalDark = {
  background: tickahub.surface,
  color: "#fff",
  confirmButtonColor: tickahub.gold,
};

const emptyAdminForm = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
  isActive: true,
};

const buildImageUrl = (imageUrl) => {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
  if (imageUrl.startsWith("/uploads/")) return imageUrl;
  return imageUrl;
};

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString();
};

const organizerStatusColor = (status) => {
  switch (status) {
    case "approved":
    case "active":
      return "success";
    case "pending":
      return "warning";
    case "suspended":
      return "error";
    default:
      return "default";
  }
};

const formatCellValue = (key, user) => {
  const value = user[key];
  if (key === "isActive") {
    return (
      <Chip
        label={value ? "true" : "false"}
        size="small"
        color={value ? "success" : "default"}
        sx={{ fontWeight: 600, fontSize: "0.7rem" }}
      />
    );
  }
  if (key === "organizer_status") {
    const status = value || "pending";
    return (
      <Chip
        label={status}
        size="small"
        color={organizerStatusColor(status)}
        sx={{ textTransform: "lowercase", fontWeight: 600, fontSize: "0.7rem" }}
      />
    );
  }
  return value || "—";
};

const UsersTable = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [dialogMode, setDialogMode] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userForm, setUserForm] = useState(emptyAdminForm);
  const [saving, setSaving] = useState(false);

  const tabConfig = ROLE_TABS[activeTab];
  const columns = TABLE_COLUMNS[tabConfig.role];
  const roleFields = ROLE_FIELDS[tabConfig.role];
  const colSpan = columns.length + 2;
  const token = localStorage.getItem("token");

  const authHeaders = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const fetchUsers = useCallback(async () => {
    if (!token) {
      setError("Please sign in again.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        role: tabConfig.role,
        page: String(page + 1),
        limit: String(rowsPerPage),
      });
      const response = await fetch(`/api/users?${params}`, {
        headers: { ...authHeaders, "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Failed to load users");
      setUsers(data.data || []);
      setTotalUsers(data.count || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, page, rowsPerPage, tabConfig.role, token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter((user) =>
      columns
        .map((col) => user[col.key])
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [users, search, columns]);

  const displayName = (user) =>
    user.organization_name || user.stage_name || user.full_name || user.email;

  const closeDialog = () => {
    setDialogMode(null);
    setSelectedUser(null);
    setUserForm(emptyAdminForm);
  };

  const openCreate = () => {
    setSelectedUser(null);
    setUserForm(emptyAdminForm);
    setDialogMode("create");
  };

  const openView = (user) => {
    setSelectedUser(user);
    setDialogMode("view");
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setUserForm({
      full_name: user.full_name || "",
      email: user.email || "",
      phone: user.phone || "",
      password: "",
      isActive: user.isActive !== false,
    });
    setDialogMode("edit");
  };

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      title: "Delete admin?",
      text: `Remove "${displayName(user)}" permanently?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      ...swalDark,
    });
    if (!result.isConfirmed) return;
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Delete failed");
      Swal.fire({ icon: "success", title: "Deleted", timer: 1400, showConfirmButton: false, ...swalDark });
      fetchUsers();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message, ...swalDark });
    }
  };

  const handleApprove = async (user) => {
    const result = await Swal.fire({
      title: "Approve organizer?",
      text: `Set organizer_status to approved for "${user.organization_name || user.full_name}"?`,
      icon: "question",
      showCancelButton: true,
      ...swalDark,
    });
    if (!result.isConfirmed) return;
    try {
      const response = await fetch(`/api/users/${user.id}/approve`, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Approve failed");
      Swal.fire({ icon: "success", title: "Approved", timer: 1400, showConfirmButton: false, ...swalDark });
      fetchUsers();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message, ...swalDark });
    }
  };

  const handleSuspend = async (user) => {
    const result = await Swal.fire({
      title: "Suspend organizer?",
      text: `Set organizer_status to suspended for "${user.organization_name || user.full_name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      ...swalDark,
    });
    if (!result.isConfirmed) return;
    try {
      const response = await fetch(`/api/users/${user.id}/suspend`, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Suspend failed");
      Swal.fire({ icon: "success", title: "Suspended", timer: 1400, showConfirmButton: false, ...swalDark });
      fetchUsers();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message, ...swalDark });
    }
  };

  const handleSave = async () => {
    if (tabConfig.role !== "admin") return;
    try {
      setSaving(true);
      if (dialogMode === "create") {
        if (!userForm.full_name || !userForm.email || !userForm.password) {
          throw new Error("full_name, email, and password are required");
        }
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "admin",
            full_name: userForm.full_name,
            email: userForm.email,
            phone: userForm.phone,
            password: userForm.password,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Create failed");
      } else if (dialogMode === "edit" && selectedUser) {
        const formData = new FormData();
        formData.append("full_name", userForm.full_name);
        formData.append("phone", userForm.phone || "");
        formData.append("isActive", userForm.isActive);
        const response = await fetch(`/api/users/${selectedUser.id}`, {
          method: "PUT",
          headers: authHeaders,
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Update failed");
      }
      Swal.fire({
        icon: "success",
        title: dialogMode === "create" ? "Admin created" : "Saved",
        timer: 1400,
        showConfirmButton: false,
        ...swalDark,
      });
      closeDialog();
      fetchUsers();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message, ...swalDark });
    } finally {
      setSaving(false);
    }
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
  };

  const renderViewField = (field, user) => {
    const value = user[field.key];

    if (field.type === "image") {
      if (!value) {
        return (
          <FieldBlock key={field.key} label={field.label}>
            <Typography sx={{ color: tickahub.textMuted }}>—</Typography>
          </FieldBlock>
        );
      }
      return (
        <FieldBlock key={field.key} label={field.label}>
          <Box
            component="img"
            src={buildImageUrl(value)}
            alt={field.label}
            sx={{
              maxWidth: 120,
              maxHeight: 120,
              borderRadius: 2,
              border: `1px solid ${tickahub.borderSubtle}`,
              objectFit: "cover",
            }}
          />
        </FieldBlock>
      );
    }

    if (field.type === "boolean") {
      return (
        <FieldBlock key={field.key} label={field.label}>
          <Chip
            label={value ? "true" : "false"}
            size="small"
            color={value ? "success" : "default"}
          />
        </FieldBlock>
      );
    }

    if (field.type === "status") {
      const status = value || "pending";
      return (
        <FieldBlock key={field.key} label={field.label}>
          <Chip label={status} size="small" color={organizerStatusColor(status)} />
        </FieldBlock>
      );
    }

    if (field.type === "datetime") {
      return (
        <FieldBlock key={field.key} label={field.label}>
          <Typography sx={{ color: "#fff", fontSize: "0.9rem" }}>{formatDateTime(value)}</Typography>
        </FieldBlock>
      );
    }

    return (
      <FieldBlock key={field.key} label={field.label}>
        <Typography sx={{ color: "#fff", fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>
          {value || "—"}
        </Typography>
      </FieldBlock>
    );
  };

  const renderEditField = (field) => {
    if (field.viewOnly) return null;

    if (field.type === "boolean") {
      return (
        <FormControlLabel
          key={field.key}
          control={
            <Switch
              checked={userForm.isActive}
              onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: tickahub.cyan },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: tickahub.cyan },
              }}
            />
          }
          label={<Typography sx={{ color: tickahub.textMuted }}>{field.label}</Typography>}
        />
      );
    }

    if (field.type === "textarea") {
      return (
        <TextField
          key={field.key}
          label={field.label}
          fullWidth
          multiline
          minRows={2}
          value={userForm[field.key] || ""}
          onChange={(e) => setUserForm({ ...userForm, [field.key]: e.target.value })}
          sx={fieldSx}
        />
      );
    }

    if (field.key === "password" && dialogMode === "create") return null;

    if (field.readOnlyOnEdit && dialogMode === "edit") return null;
    if (field.key === "role" || field.key === "lastLogin" || field.key === "createdAt") return null;

    return (
      <TextField
        key={field.key}
        label={field.label}
        fullWidth
        type={field.key === "email" ? "email" : "text"}
        value={userForm[field.key] || ""}
        onChange={(e) => setUserForm({ ...userForm, [field.key]: e.target.value })}
        sx={fieldSx}
      />
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", background: backgroundGradient, p: { xs: 2, md: 3 } }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: tickahub.surface,
          border: `1px solid ${tickahub.borderSubtle}`,
        }}
      >
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 3,
            background: `linear-gradient(135deg, ${tickahub.navyLight} 0%, ${tickahub.surface} 100%)`,
            borderBottom: `1px solid ${tickahub.borderSubtle}`,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
                <GroupsIcon sx={{ color: tickahub.gold, fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#fff" }}>
                  User Management
                </Typography>
              </Stack>
              <Typography sx={{ color: tickahub.textMuted }}>{tabConfig.subtitle}</Typography>
            </Box>
            {tabConfig.canCreate && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreate}
                sx={{
                  background: goldGradient,
                  color: tickahub.navy,
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                }}
              >
                New admin
              </Button>
            )}
          </Stack>
        </Box>

        <Box sx={{ px: { xs: 1.5, md: 3 }, pt: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => {
              setActiveTab(v);
              setPage(0);
              setSearch("");
              closeDialog();
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 2,
              "& .MuiTab-root": { textTransform: "none", fontWeight: 600, color: tickahub.textMuted, minHeight: 48 },
              "& .Mui-selected": { color: tickahub.cyan },
              "& .MuiTabs-indicator": { bgcolor: tickahub.cyan, height: 3, borderRadius: 2 },
            }}
          >
            {ROLE_TABS.map((tab) => (
              <Tab key={tab.role} label={tab.label} icon={<tab.icon sx={{ fontSize: 18 }} />} iconPosition="start" />
            ))}
          </Tabs>

          <TextField
            fullWidth
            size="small"
            placeholder={`Search ${tabConfig.label.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: tickahub.textMuted, fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{ ...fieldSx, mb: 2, maxWidth: 420 }}
          />
        </Box>

        <TableContainer sx={{ px: { xs: 0.5, md: 2 }, overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  "& .MuiTableCell-head": {
                    color: tickahub.cyan,
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    fontFamily: "monospace",
                    letterSpacing: "0.02em",
                    borderBottom: `1px solid ${tickahub.borderSubtle}`,
                    bgcolor: tickahub.navyLight,
                    whiteSpace: "nowrap",
                  },
                }}
              >
                <TableCell width={48}>#</TableCell>
                {columns.map((col) => (
                  <TableCell key={col.key}>{col.label}</TableCell>
                ))}
                <TableCell align="right">actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={colSpan} align="center" sx={{ py: 6 }}>
                    <CircularProgress sx={{ color: tickahub.cyan }} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={colSpan} align="center" sx={{ py: 4, color: "#ff6b6b" }}>
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={colSpan} align="center" sx={{ py: 5, color: tickahub.textMuted }}>
                    No {tabConfig.label.toLowerCase()} found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user, idx) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{
                      "& .MuiTableCell-root": {
                        color: "#fff",
                        fontSize: "0.82rem",
                        borderBottom: `1px solid ${tickahub.borderSubtle}`,
                      },
                      "&:hover": { bgcolor: `${tickahub.cyan}08` },
                    }}
                  >
                    <TableCell sx={{ color: tickahub.textMuted }}>{page * rowsPerPage + idx + 1}</TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.key}>{formatCellValue(col.key, user)}</TableCell>
                    ))}
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => openView(user)} sx={{ color: tickahub.cyan }}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {tabConfig.canEdit && (
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => openEdit(user)} sx={{ color: tickahub.gold }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {tabConfig.canApprove &&
                          (user.organizer_status === "pending" || user.organizer_status === "suspended") && (
                            <Tooltip title="Approve">
                              <IconButton size="small" onClick={() => handleApprove(user)} sx={{ color: "#2ecc71" }}>
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        {tabConfig.canApprove &&
                          (user.organizer_status === "approved" || user.organizer_status === "active") && (
                            <Tooltip title="Suspend">
                              <IconButton size="small" onClick={() => handleSuspend(user)} sx={{ color: "#e67e22" }}>
                                <SuspendIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        {tabConfig.canDelete && (
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDelete(user)} sx={{ color: "#e74c3c" }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
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
          count={totalUsers}
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
          }}
        />
      </Paper>

      <Dialog
        open={Boolean(dialogMode)}
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: tickahub.surface,
            border: `1px solid ${tickahub.borderSubtle}`,
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ color: "#fff", fontWeight: 800, borderBottom: `1px solid ${tickahub.borderSubtle}` }}>
          {dialogMode === "view" && `${tabConfig.label} — view`}
          {dialogMode === "edit" && `${tabConfig.label} — edit`}
          {dialogMode === "create" && "Admins — create"}
        </DialogTitle>
        <DialogContent sx={{ pt: "20px !important" }}>
          {dialogMode === "view" && selectedUser && (
            <Box>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Avatar
                  src={buildImageUrl(selectedUser.profile_image)}
                  sx={{ width: 56, height: 56, bgcolor: tickahub.navy, color: tickahub.gold, fontWeight: 700 }}
                >
                  {getInitials(displayName(selectedUser))}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700 }}>
                    {displayName(selectedUser)}
                  </Typography>
                  <Typography sx={{ color: tickahub.textMuted, fontFamily: "monospace", fontSize: "0.85rem" }}>
                    role: {selectedUser.role}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ borderColor: tickahub.borderSubtle, mb: 2 }} />
              <Grid container spacing={2}>
                {roleFields.map((field) => (
                  <Grid item xs={12} sm={field.type === "textarea" || field.type === "image" ? 12 : 6} key={field.key}>
                    {renderViewField(field, selectedUser)}
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {(dialogMode === "create" || dialogMode === "edit") && tabConfig.role === "admin" && (
            <Stack spacing={2} mt={0.5}>
              {dialogMode === "create" &&
                CREATE_ADMIN_FIELDS.map((field) => (
                  <TextField
                    key={field.key}
                    label={field.label}
                    fullWidth
                    required={field.required}
                    type={field.type || "text"}
                    multiline={field.multiline}
                    minRows={field.multiline ? 3 : undefined}
                    value={userForm[field.key] || ""}
                    onChange={(e) => setUserForm({ ...userForm, [field.key]: e.target.value })}
                    sx={fieldSx}
                  />
                ))}
              {dialogMode === "edit" &&
                ROLE_FIELDS.admin
                  .filter((f) => !f.viewOnly && f.key !== "email")
                  .map((field) => renderEditField(field))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, borderTop: `1px solid ${tickahub.borderSubtle}` }}>
          <Button onClick={closeDialog} sx={{ color: tickahub.textMuted, textTransform: "none" }}>
            Close
          </Button>
          {tabConfig.canEdit && (dialogMode === "create" || dialogMode === "edit") && (
            <Button
              onClick={handleSave}
              disabled={saving}
              sx={{
                background: dialogMode === "create" ? goldGradient : cyanGradient,
                color: tickahub.navy,
                fontWeight: 700,
                textTransform: "none",
                px: 3,
              }}
            >
              {saving ? "Saving..." : dialogMode === "create" ? "Create" : "Save changes"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const FieldBlock = ({ label, children }) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 2,
      bgcolor: tickahub.navy,
      border: `1px solid ${tickahub.borderSubtle}`,
      height: "100%",
    }}
  >
    <Typography
      variant="caption"
      sx={{
        color: tickahub.cyan,
        fontFamily: "monospace",
        fontSize: "0.72rem",
        display: "block",
        mb: 0.5,
      }}
    >
      {label}
    </Typography>
    {children}
  </Box>
);

export default UsersTable;
