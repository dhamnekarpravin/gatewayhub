import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await api("/api/users/register", { method: "POST", auth: false, body: form });
      }
      const data = await api("/api/users/login", {
        method: "POST",
        auth: false,
        body: { username: form.username, password: form.password },
      });
      setToken(data.access_token);
      navigate("/orders");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white rounded-xl shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center">GatewayHub</h1>
        <p className="text-center text-gray-500">
          {mode === "login" ? "Log in to continue" : "Create your account"}
        </p>

        {error && <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}

        <input className={input} name="username" placeholder="Username"
               value={form.username} onChange={onChange} required />
        {mode === "register" && (
          <input className={input} name="email" type="email" placeholder="Email"
                 value={form.email} onChange={onChange} required />
        )}
        <input className={input} name="password" type="password" placeholder="Password (min 6)"
               value={form.password} onChange={onChange} required minLength={6} />

        <button disabled={loading}
                className="w-full rounded-lg bg-indigo-600 text-white py-2 font-medium hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "Please wait..." : mode === "login" ? "Log in" : "Register"}
        </button>

        <p className="text-center text-sm text-gray-600">
          {mode === "login" ? "No account?" : "Already registered?"}{" "}
          <button type="button" className="text-indigo-600 font-medium"
                  onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
            {mode === "login" ? "Register" : "Log in"}
          </button>
        </p>
      </form>
    </div>
  );
}