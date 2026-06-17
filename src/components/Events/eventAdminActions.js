import Swal from "sweetalert2";
import { swalDark } from "../shared/tickahubPageStyles";

const authHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const parseError = async (response) => {
  try {
    const data = await response.json();
    return data.message || `Request failed (${response.status})`;
  } catch {
    return `Request failed (${response.status})`;
  }
};

export async function promptApproveEvent(event) {
  const result = await Swal.fire({
    title: "Approve event?",
    html: `
      <p style="margin:0 0 12px;color:rgba(255,255,255,0.7);font-size:14px">
        Confirm approval for <strong>${event.event_name || event.title}</strong> and set platform commission.
      </p>
      <input id="swal-commission" class="swal2-input" type="number" min="0" max="50" step="0.1" value="${event.commission_rate ?? 10}" />
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Approve",
    cancelButtonText: "Cancel",
    preConfirm: () => {
      const val = parseFloat(document.getElementById("swal-commission")?.value);
      if (Number.isNaN(val) || val < 0 || val > 50) {
        Swal.showValidationMessage("Commission must be between 0 and 50");
        return false;
      }
      return val;
    },
    ...swalDark,
  });

  if (!result.isConfirmed) return { ok: false };

  const response = await fetch(`/api/events/${event.id}/approve`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ commission_rate: result.value }),
  });

  if (!response.ok) {
    const message = await parseError(response);
    await Swal.fire({ title: "Approval failed", text: message, icon: "error", ...swalDark });
    return { ok: false, message };
  }

  await Swal.fire({
    title: "Event approved",
    text: `Commission set to ${result.value}%.`,
    icon: "success",
    timer: 1800,
    showConfirmButton: false,
    ...swalDark,
  });
  return { ok: true };
}

export async function promptRejectEvent(event) {
  const result = await Swal.fire({
    title: "Reject event?",
    text: `"${event.event_name || event.title}" will be marked as rejected.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Reject",
    confirmButtonColor: "#ff6b6b",
    ...swalDark,
  });

  if (!result.isConfirmed) return { ok: false };

  const response = await fetch(`/api/events/${event.id}/reject`, {
    method: "PUT",
    headers: authHeaders(),
  });

  if (!response.ok) {
    const message = await parseError(response);
    await Swal.fire({ title: "Rejection failed", text: message, icon: "error", ...swalDark });
    return { ok: false, message };
  }

  await Swal.fire({
    title: "Event rejected",
    icon: "success",
    timer: 1500,
    showConfirmButton: false,
    ...swalDark,
  });
  return { ok: true };
}

export async function promptDeleteEvent(event) {
  const result = await Swal.fire({
    title: "Delete event?",
    text: `"${event.event_name || event.title}" will be permanently removed.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    confirmButtonColor: "#ff6b6b",
    ...swalDark,
  });

  if (!result.isConfirmed) return { ok: false };

  const response = await fetch(`/api/events/${event.id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!response.ok) {
    const message = await parseError(response);
    await Swal.fire({ title: "Delete failed", text: message, icon: "error", ...swalDark });
    return { ok: false, message };
  }

  await Swal.fire({
    title: "Event deleted",
    icon: "success",
    timer: 1500,
    showConfirmButton: false,
    ...swalDark,
  });
  return { ok: true };
}
