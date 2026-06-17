export const getUserRole = () => localStorage.getItem("userRole") || "admin";

export const getDisplayName = (user) => {
  if (!user || typeof user !== "object") return "Admin";
  return user.full_name || user.name || user.email || "Admin";
};

export const getInitials = (name) => {
  if (!name) return "A";
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export const getPhone = (user) => user?.phone || "";

export const getRoleLabel = () => "Admin";
