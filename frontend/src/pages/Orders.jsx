import { useEffect, useState } from "react";
import { api } from "../api";

const empty = { productName: "", quantity: 1, price: "" };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setOrders(await api("/api/orders"));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const body = {
      productName: form.productName,
      quantity: Number(form.quantity),
      price: Number(form.price),
    };
    try {
      if (editingId) {
        await api(`/api/orders/${editingId}`, { method: "PUT", body });
      } else {
        await api("/api/orders", { method: "POST", body });
      }
      setForm(empty);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(order) {
    setEditingId(order.id);
    setForm({
      productName: order.productName,
      quantity: order.quantity,
      price: order.price,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
  }

  async function remove(id) {
    if (!window.confirm("Delete this order?")) return;
    try {
      await api(`/api/orders/${id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  const input =
    "rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-4 space-y-3">
        <h2 className="text-lg font-semibold">
          {editingId ? `Edit order #${editingId}` : "New order"}
        </h2>

        {error && (
          <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input className={input} name="productName" placeholder="Product name"
                 value={form.productName} onChange={onChange} required />
          <input className={input} name="quantity" type="number" min="1" placeholder="Quantity"
                 value={form.quantity} onChange={onChange} required />
          <input className={input} name="price" type="number" min="0.01" step="0.01"
                 placeholder="Price" value={form.price} onChange={onChange} required />
        </div>

        <div className="flex gap-2">
          <button disabled={saving}
                  className="rounded-lg bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700 disabled:opacity-50">
            {saving ? "Saving..." : editingId ? "Update" : "Add order"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit}
                    className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="6" className="px-4 py-6 text-center text-gray-500">Loading...</td></tr>
            )}
            {!loading && orders.length === 0 && (
              <tr><td colSpan="6" className="px-4 py-6 text-center text-gray-500">No orders yet. Add one above.</td></tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="px-4 py-3">{o.id}</td>
                <td className="px-4 py-3">{o.productName}</td>
                <td className="px-4 py-3">{o.quantity}</td>
                <td className="px-4 py-3">{Number(o.price).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">{o.status}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => startEdit(o)} className="text-indigo-600 hover:underline">Edit</button>
                  <button onClick={() => remove(o.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}