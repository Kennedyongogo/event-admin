export function parseLineupFromApi(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === "string") return { name: item, role: "" };
    return {
      name: item?.name ?? "",
      role: item?.role ?? "",
    };
  });
}
