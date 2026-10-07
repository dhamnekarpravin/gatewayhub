import { useState } from "react";
import { api } from "../api";

export default function Predict() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      setResult(await api("/api/predict", { method: "POST", body: { text } }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const positive = result?.sentiment === "POSITIVE";

  return (
    <div className="max-w-xl mx-auto p-4">
      <form onSubmit={onSubmit} className="bg-white rounded-xl shadow p-4 space-y-3">
        <h2 className="text-lg font-semibold">Sentiment predictor</h2>
        <p className="text-sm text-gray-500">
          Type a sentence and the ML service will say whether it sounds positive or negative.
        </p>

        {error && (
          <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
        )}

        <textarea
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows="4" maxLength={1000} placeholder="e.g. I love this, it works great"
          value={text} onChange={(e) => setText(e.target.value)} required />

        <button disabled={loading || !text.trim()}
                className="rounded-lg bg-indigo-600 text-white px-4 py-2 font-medium hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "Analysing..." : "Predict"}
        </button>
      </form>

      {result && (
        <div className={`mt-4 rounded-xl p-4 shadow ${positive ? "bg-green-50" : "bg-red-50"}`}>
          <p className={`text-xl font-bold ${positive ? "text-green-700" : "text-red-700"}`}>
            {result.sentiment}
          </p>
          <p className="text-sm text-gray-600">
            Confidence: {(result.confidence * 100).toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
}