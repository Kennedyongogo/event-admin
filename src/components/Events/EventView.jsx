import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Divider,
  alpha,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Event as EventIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  tickahub,
  pageShellSx,
  secondaryButtonSx,
  primaryButtonSx,
  dangerButtonSx,
  SectionCard,
  SectionLabel,
  ViewField,
  PageHeader,
  eventStatusColor,
} from "../shared/tickahubPageStyles";
import { promptApproveEvent, promptRejectEvent, promptDeleteEvent } from "./eventAdminActions";
import VenueMapView from "./VenueMapView";

const EventView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acting, setActing] = useState(false);

  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
    if (imageUrl.startsWith("/uploads/")) return imageUrl;
    return imageUrl;
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      if (result.success) setEvent(result.data);
      else setError(result.message || "Failed to fetch event details");
    } catch (err) {
      setError(`Failed to fetch event: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "—";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const runAction = async (action) => {
    if (!event || acting) return;
    setActing(true);
    try {
      const result = await action(event);
      if (result.ok) {
        if (action === promptDeleteEvent) {
          navigate("/events");
          return;
        }
        await fetchEvent();
      }
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ ...pageShellSx, alignItems: "center", justifyContent: "center", minHeight: 280 }}>
        <CircularProgress sx={{ color: tickahub.cyan }} />
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Box sx={pageShellSx}>
        <Typography sx={{ color: "#ff6b6b", mb: 2 }}>{error || "Event not found"}</Typography>
        <Button variant="outlined" size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate("/events")} sx={secondaryButtonSx}>
          Back to events
        </Button>
      </Box>
    );
  }

  const imageSrc = buildImageUrl(event.image_url || event.image);
  const ticketTiers = Array.isArray(event.ticket_prices) ? event.ticket_prices : [];
  const isPending = event.status === "pending";

  return (
    <Box sx={pageShellSx}>
      <PageHeader
        icon={EventIcon}
        title={event.event_name || event.title}
        subtitle={event.organizer?.organization_name || event.category || "Event review"}
        action={
          <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
            <Chip
              label={event.status}
              size="small"
              sx={{
                bgcolor: `${eventStatusColor(event.status)}22`,
                color: eventStatusColor(event.status),
                fontWeight: 700,
                textTransform: "capitalize",
              }}
            />
            <Button variant="outlined" size="small" startIcon={<ArrowBackIcon />} onClick={() => navigate("/events")} sx={secondaryButtonSx}>
              Back
            </Button>
            {isPending && (
              <>
                <Button
                  variant="contained"
                  size="small"
                  disabled={acting}
                  startIcon={<ApproveIcon />}
                  onClick={() => runAction(promptApproveEvent)}
                  sx={primaryButtonSx}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={acting}
                  startIcon={<RejectIcon />}
                  onClick={() => runAction(promptRejectEvent)}
                  sx={dangerButtonSx}
                >
                  Reject
                </Button>
              </>
            )}
            <Button
              variant="outlined"
              size="small"
              disabled={acting}
              startIcon={<DeleteIcon />}
              onClick={() => runAction(promptDeleteEvent)}
              sx={dangerButtonSx}
            >
              Delete
            </Button>
          </Stack>
        }
      />

      <SectionCard
        sx={{ width: "100%", flex: "none" }}
        headerBg={`linear-gradient(135deg, ${alpha(tickahub.cyan, 0.14)}, transparent)`}
        icon={EventIcon}
        iconColor={tickahub.cyan}
        title={event.event_name || event.title}
        subtitle={event.category || "Full event record"}
      >
        <Stack spacing={2.5} sx={{ width: "100%" }}>
          {imageSrc && (
            <Box
              component="img"
              src={imageSrc}
              alt={event.event_name}
              sx={{ width: "100%", maxHeight: 280, objectFit: "cover", borderRadius: 2, border: `1px solid ${tickahub.borderSubtle}` }}
            />
          )}

          <SectionLabel>Overview</SectionLabel>
          <ViewField label="description" value={event.description} multiline />
          <ViewField label="category" value={event.category} />
          <ViewField label="status" value={event.status} />
          <ViewField label="commission_rate" value={`${event.commission_rate || 0}%`} />

          <Divider sx={{ borderColor: tickahub.borderSubtle }} />
          <SectionLabel accent={tickahub.gold}>Schedule</SectionLabel>
          <ViewField label="event_date" value={formatDate(event.event_date)} />
          <ViewField label="start_time" value={formatTime(event.start_time)} />
          <ViewField label="end_time" value={formatTime(event.end_time)} />

          <Divider sx={{ borderColor: tickahub.borderSubtle }} />
          <SectionLabel>Venue</SectionLabel>
          <ViewField label="venue" value={event.venue} />
          <VenueMapView
            latitude={event.venue_latitude}
            longitude={event.venue_longitude}
            venue={event.venue}
          />

          <Divider sx={{ borderColor: tickahub.borderSubtle }} />
          <SectionLabel accent={tickahub.gold}>Tickets</SectionLabel>
          <ViewField label="tickets_available" value={event.tickets_available ?? "—"} />
          {ticketTiers.length > 0 ? (
            ticketTiers.map((tier, i) => (
              <Box
                key={i}
                sx={{ width: "100%", p: 1.5, borderRadius: 2, bgcolor: tickahub.navy, border: `1px solid ${tickahub.borderSubtle}` }}
              >
                <Typography sx={{ color: tickahub.gold, fontWeight: 700 }}>{tier.category}</Typography>
                <Typography sx={{ color: "#fff", fontWeight: 800, mt: 0.5 }}>
                  KES {parseFloat(tier.price)?.toLocaleString()}
                </Typography>
                {tier.quantity != null && (
                  <Typography variant="caption" sx={{ color: tickahub.textMuted }}>
                    Qty: {tier.quantity}
                  </Typography>
                )}
              </Box>
            ))
          ) : (
            <Typography sx={{ color: tickahub.textMuted, fontSize: "0.85rem" }}>No pricing tiers set</Typography>
          )}

          {event.organizer && (
            <>
              <Divider sx={{ borderColor: tickahub.borderSubtle }} />
              <SectionLabel accent={tickahub.gold}>Organizer</SectionLabel>
              <ViewField label="organization" value={event.organizer.organization_name} />
              <ViewField label="contact" value={event.organizer.full_name} />
              <ViewField label="phone" value={event.organizer.phone} />
              <ViewField label="email" value={event.organizer.email} />
            </>
          )}

          {event.purchases?.length > 0 && (
            <>
              <Divider sx={{ borderColor: tickahub.borderSubtle }} />
              <SectionLabel>Purchases</SectionLabel>
              {event.purchases.map((purchase) => (
                <Box
                  key={purchase.id}
                  sx={{ width: "100%", p: 1.5, borderRadius: 2, bgcolor: tickahub.navy, border: `1px solid ${tickahub.borderSubtle}` }}
                >
                  <Typography sx={{ color: "#fff", fontWeight: 600 }}>
                    Qty {purchase.quantity} · {purchase.status}
                  </Typography>
                  <Typography variant="caption" sx={{ color: tickahub.textMuted }}>
                    {purchase.createdAt ? new Date(purchase.createdAt).toLocaleString() : "—"}
                  </Typography>
                </Box>
              ))}
            </>
          )}

          <Divider sx={{ borderColor: tickahub.borderSubtle }} />
          <Stack spacing={0.5} sx={{ color: tickahub.textMuted, fontSize: "0.75rem" }}>
            <Typography variant="caption">
              Created {event.createdAt ? new Date(event.createdAt).toLocaleString() : "—"}
            </Typography>
            <Typography variant="caption">
              Updated {event.updatedAt ? new Date(event.updatedAt).toLocaleString() : "—"}
            </Typography>
          </Stack>
        </Stack>
      </SectionCard>
    </Box>
  );
};

export default EventView;
