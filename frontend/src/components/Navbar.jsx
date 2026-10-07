import { NavLink, useNavigate } from "react-router-dom";
import { clearToken } from "../api";

export default function Navbar() {
  const navigate = useNavigate();

  const link = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium ${
      isActive ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-200"
    }`;

  function logout() {
    clearToken();
    navigate("/login");
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg mr-4">GatewayHub</span>
          <NavLink to="/orders" className={link}>Orders</NavLink>
          <NavLink to="/predict" className={link}>Predict</NavLink>
        </div>
        <button onClick={logout}
                className="rounded-lg bg-gray-800 text-white px-3 py-2 text-sm hover:bg-gray-900">
          Log out
        </button>
      </div>
    </nav>
  );
}