"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/lib/firebase";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import AddEndpointModal from "@/app/components/AddEndpointModal";
import PricingModal from "@/app/components/PricingModal";

interface Endpoint {
  id: string;
  url: string;
  status: string;
  uptime?: number;
  response: number;
  alertEmail?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push("/login");
      } else {
        setUser(u);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchEndpoints = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/apis/get-endpoints`)
      .then((res) => res.json())
      .then((data) => setEndpoints(data));
  };

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleDelete = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apis/${id}`, { method: "DELETE" });
    fetchEndpoints();
  };

  const activeCount = endpoints.filter((e) => e.status === "UP").length;
  const alertCount = endpoints.filter((e) => e.status === "DOWN").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-blue-700 text-white px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">API Monitor</h1>
          <p className="text-sm text-blue-200">Monitor your APIS in real-time.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium px-4 py-2 rounded"
          >
            Add New API
          </button>

          {/* User profile dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 focus:outline-none"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white font-semibold text-sm">
                    {user.displayName?.[0] ?? user.email?.[0] ?? "U"}
                  </div>
                )}
                <span className="text-sm font-medium hidden sm:block">
                  {user.displayName ?? user.email}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded shadow-lg z-10 text-gray-800 text-sm">
                  <div className="px-4 py-3 border-b">
                    <p className="font-semibold truncate">{user.displayName}</p>
                    <p className="text-gray-500 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { setDropdownOpen(false); setShowPricingModal(true); }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-blue-600 font-medium"
                  >
                    ⭐ Upgrade to Pro
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 text-red-500 font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="px-8 py-6 flex gap-6">
        {/* Table */}
        <div className="flex-1 bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b text-gray-600">
                <th className="pb-2 font-semibold">API Endpoint</th>
                <th className="pb-2 font-semibold">Status</th>
                <th className="pb-2 font-semibold">Uptime</th>
                <th className="pb-2 font-semibold">Response Time</th>
                <th className="pb-2 font-semibold">Alert Email</th>
                <th className="pb-2 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="py-3 text-gray-800">{e.url}</td>
                  <td className="py-3">
                    {e.status === "UP" ? (
                      <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                        ✓ UP
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                        ✕ DOWN
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-gray-700">
                    {e.uptime != null ? `${e.uptime}%` : "--"}
                  </td>
                  <td className="py-3 text-gray-700">
                    {e.status === "UP" ? `${e.response} ms` : "--"}
                  </td>
                  <td className="py-3 text-gray-500">
                    {e.alertEmail ?? "--"}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      aria-label="Delete endpoint"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {endpoints.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-400">
                    No endpoints added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sidebar */}
        <div className="w-52 flex flex-col gap-4">
          <div className="bg-white rounded shadow p-4">
            <p className="text-sm text-gray-500">Active Endpoints:</p>
            <p className="text-2xl font-bold text-gray-800">{activeCount}</p>
          </div>
          <div className="bg-white rounded shadow p-4">
            <p className="text-sm text-gray-500">Alerts:</p>
            <p className="text-2xl font-bold text-red-500">
              {alertCount}{" "}
              {alertCount > 0 && (
                <span className="text-sm font-semibold text-red-500">Critical</span>
              )}
            </p>
          </div>
        </div>
      </main>
      {showAddModal && (
        <AddEndpointModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchEndpoints}
          userEmail={user?.email ?? ""}
        />
      )}
      {showPricingModal && (
        <PricingModal
          onClose={() => setShowPricingModal(false)}
          userEmail={user?.email ?? ""}
        />
      )}
    </div>
  );
}
