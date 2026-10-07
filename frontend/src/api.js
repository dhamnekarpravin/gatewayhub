const BASE = import.meta.env.VITE_API_URL;

export const getToken = () => localStorage.getItem("token");
export const setToken = (t) => localStorage.setItem("token", t);
export const clearToken = () => localStorage.removeItem("token");

function errorMessage(data) {
  if (!data) return "Request failed";
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (data.message) return data.message;
  // Django validation errors look like {"username": ["already exists"]}
  return Object.values(data).flat().join(" ");
}

export async function api(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Is the gateway running?");
  }

  if (res.status === 401 && auth) {
    clearToken();
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }
  if (res.status === 429) {
    throw new Error("Too many requests. Please wait a moment.");
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(errorMessage(data));
  return data;
}