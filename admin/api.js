// services/api.js
// Placeholder for API calls — replace base URL and token as needed

const BASE_URL = import.meta.env.VITE_API_URL || "https://api.tranzo.io";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getUsers: () => request("/admin/users"),
  getStats: () => request("/admin/stats"),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: "DELETE" }),
  updateSettings: (data) =>
    request("/admin/settings", { method: "PUT", body: JSON.stringify(data) }),
};
