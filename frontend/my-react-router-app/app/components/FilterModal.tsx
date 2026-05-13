import { useEffect, useRef } from "react";

export interface Filters {
  id: string;
  domainName: string;
  expDateFrom: string;
  expDateTo: string;
  lastRenewedFrom: string;
  lastRenewedTo: string;
  autoRenew: "all" | "yes" | "no";
  status: string[];
}

export const ALL_STATUSES = ["Active", "Expired", "Renewing Soon", "In Progress", "Failed/Error"];

export const defaultFilters: Filters = {
  id: "",
  domainName: "",
  expDateFrom: "",
  expDateTo: "",
  lastRenewedFrom: "",
  lastRenewedTo: "",
  autoRenew: "all",
  status: [...ALL_STATUSES],
};

interface FilterModalProps {
  isOpen: boolean;
  filters: Filters;
  onChange: (f: Filters) => void;
  onClose: () => void;
  onClear: () => void;
}

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-green-100 text-green-800 border-green-300",
  Expired: "bg-red-100 text-red-800 border-red-300",
  "Renewing Soon": "bg-amber-100 text-amber-800 border-amber-300",
  "In Progress":   "bg-purple-200 text-purple-500 border-purple-300",
  "Failed/Error":       "bg-gray-100 text-gray-700 border-gray-300",
};

export default function FilterModal({ isOpen, filters, onChange, onClose, onClear }: FilterModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleStatus = (s: string) => {
    onChange({
      ...filters,
      status: filters.status.includes(s)
        ? filters.status.filter((x) => x !== s)
        : [...filters.status, s],
    });
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  const labelClass =
    "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            <h2 className="text-base font-semibold text-gray-900">Advanced Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* ID */}
          <div>
            <label className={labelClass}>ID</label>
            <input
              type="text"
              value={filters.id}
              onChange={(e) => onChange({ ...filters, id: e.target.value })}
              placeholder="Filter by ID…"
              className={inputClass}
            />
          </div>

          {/* Domain Name */}
          <div>
            <label className={labelClass}>Domain Name</label>
            <input
              type="text"
              value={filters.domainName}
              onChange={(e) => onChange({ ...filters, domainName: e.target.value })}
              placeholder="Search domain name…"
              className={inputClass}
            />
          </div>

          {/* Exp. Date */}
          <div>
            <label className={labelClass}>Exp. Date</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-xs text-gray-400 mb-1">From</span>
                <input
                  type="date"
                  value={filters.expDateFrom}
                  onChange={(e) => onChange({ ...filters, expDateFrom: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">To</span>
                <input
                  type="date"
                  value={filters.expDateTo}
                  onChange={(e) => onChange({ ...filters, expDateTo: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Last Renewed */}
          <div>
            <label className={labelClass}>Last Renewed</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-xs text-gray-400 mb-1">From</span>
                <input
                  type="date"
                  value={filters.lastRenewedFrom}
                  onChange={(e) => onChange({ ...filters, lastRenewedFrom: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <span className="block text-xs text-gray-400 mb-1">To</span>
                <input
                  type="date"
                  value={filters.lastRenewedTo}
                  onChange={(e) => onChange({ ...filters, lastRenewedTo: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Auto Renew */}
          <div>
            <label className={labelClass}>Auto Renew</label>
            <div className="flex gap-2">
              {(["all", "yes", "no"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => onChange({ ...filters, autoRenew: opt })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    filters.autoRenew === opt
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
                  }`}
                >
                  {opt === "all" ? "All" : opt === "yes" ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}>Status</label>
            <div className="flex flex-wrap gap-2">
              {ALL_STATUSES.map((s) => {
                const active = filters.status.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      active
                        ? STATUS_STYLES[s]
                        : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 mt-2">Highlighted = included in results</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All Filters
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
