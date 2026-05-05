"use client";
import { useState } from "react";

interface AddEndpointModalProps {
  onClose: () => void;
  onSuccess: () => void;
  userEmail?: string;
}

export default function AddEndpointModal({ onClose, onSuccess, userEmail }: AddEndpointModalProps) {
  const [url, setUrl] = useState("");
  const [interval, setInterval] = useState("5");
  const [alertEmail, setAlertEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!url) {
      setError("API URL is required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = { url, alertEmail, userEmail };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apis/add-api`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save endpoint.");
      onSuccess();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">Add New API</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API URL
            </label>
            <input
              className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://yourapi.com/endpoint"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Check Interval
            </label>
            <select
              className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
            >
              <option value="1">Every 1 Minute</option>
              <option value="5">Every 5 Minutes</option>
              <option value="10">Every 10 Minutes</option>
              <option value="30">Every 30 Minutes</option>
              <option value="60">Every 1 Hour</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alert Email
            </label>
            <input
              className="border border-gray-300 rounded px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              type="email"
              value={alertEmail}
              onChange={(e) => setAlertEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="text-sm font-medium px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-6 py-2 rounded transition-colors"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
