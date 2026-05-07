"use client";

interface PricingModalProps {
  onClose: () => void;
  userEmail: string;
}

export default function PricingModal({ onClose, userEmail }: PricingModalProps) {
  const handleProCheckout = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        }
      );
      if (!res.ok) throw new Error("Failed to create checkout session");
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Could not start checkout. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl mx-4 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-white text-center mb-2">Choose Your Plan</h2>
        <p className="text-slate-400 text-center text-sm mb-8">
          Upgrade anytime. Cancel anytime.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Free plan */}
          <div className="flex flex-col rounded-xl border border-slate-700 bg-slate-800/60 p-6">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Free</p>
            <p className="text-4xl font-extrabold text-white mb-1">£0</p>
            <p className="text-slate-500 text-xs mb-6">Forever free</p>
            <ul className="space-y-2 text-sm text-slate-300 flex-1 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> 1 API endpoint
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> 5-minute check interval
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Email alerts
              </li>
            </ul>
            <button
              onClick={onClose}
              className="w-full rounded-lg border border-slate-600 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Current plan
            </button>
          </div>

          {/* Pro plan */}
          <div className="flex flex-col rounded-xl border border-blue-500 bg-blue-900/40 p-6 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Popular
            </span>
            <p className="text-blue-300 text-sm font-medium uppercase tracking-wider mb-1">Pro</p>
            <p className="text-4xl font-extrabold text-white mb-1">£5</p>
            <p className="text-slate-500 text-xs mb-6">per month</p>
            <ul className="space-y-2 text-sm text-slate-300 flex-1 mb-6">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> 10 API endpoints
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> 1-minute check interval
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Email alerts
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Priority support
              </li>
            </ul>
            <button
              onClick={handleProCheckout}
              className="w-full rounded-lg bg-blue-500 hover:bg-blue-400 py-2 text-sm font-semibold text-white transition-colors"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
