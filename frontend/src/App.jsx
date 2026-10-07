import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { getToken } from "./api";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import Predict from "./pages/Predict";

function ProtectedLayout() {
  if (!getToken()) return <Navigate to="/login" replace />;
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/orders" element={<Orders />} />
        <Route path="/predict" element={<Predict />} />
      </Route>
      <Route path="*" element={<Navigate to="/orders" replace />} />
    </Routes>
  );
}