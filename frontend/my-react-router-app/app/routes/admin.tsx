import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import FilterModal, { type Filters, defaultFilters, ALL_STATUSES } from "~/components/FilterModal";
import logo from "../utils/Seal_of_Mississippi.png";

export function meta() {
  return [{ title: "CRS - Admin" }];
}

interface AdminDomain {
  id: number;
  domainName: string;
  expDate: string;
  lastRenewed: string;
  status: "Active" | "Expired" | "Renewing Soon" | "In Progress" | "Failed/Error";
}

interface CertLog {
  logId: number;
  timestamp: string;
  certificate_id: string;
  domain: string;
  step: string;
  level: "INFO" | "WARNING" | "ERROR";
  message: string;
}

function DomainHistoryModal({
  domain,
  logs,
  onClose,
}: {
  domain: AdminDomain | null;
  logs: CertLog[];
  onClose: () => void;
}) {
  if (!domain) return null;

  const domainLogs = logs
    .filter((l) => l.domain === domain.domainName)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-scroll"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
      
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{domain.domainName}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Certificate #{domain.id} · {domainLogs.length} log {domainLogs.length === 1 ? "entry" : "entries"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Domain summary row */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-6 text-xs text-gray-600">
          <span><span className="font-semibold text-gray-700">Status:</span> <StatusBadge status={domain.status} /></span>
          <span><span className="font-semibold text-gray-700">Exp. Date:</span> {domain.expDate}</span>
          <span><span className="font-semibold text-gray-700">Last Renewed:</span> {domain.lastRenewed}</span>
        </div>

        {/* Log table */}
        <div className="overflow-y-auto flex-1">
          {domainLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm font-medium">No activity logs found for this domain</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap text-xs">Timestamp</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap text-xs">Step</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs">Level</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 text-xs">Message</th>
                </tr>
              </thead>
              <tbody>
                {domainLogs.map((log, i) => (
                  <tr
                    key={log.logId}
                    className={`border-b border-gray-100 last:border-0 ${i % 2 === 1 ? "bg-gray-50/50" : "bg-white"}`}
                  >
                    <td className="px-4 py-3 text-gray-500 tabular-nums text-xs whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{log.step}</td>
                    <td className="px-4 py-3"><LevelBadge level={log.level} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

type SortField = keyof AdminDomain;
type SortDir = "asc" | "desc" | null;

type DisplayStatus = "Active" | "Expired" | "Renewing Soon" | "In Progress" | "Failed/Error";

function getDisplayStatus(cert: { status: string; expiration_date: string }, currentDate: string): DisplayStatus {
  const today = new Date(currentDate + "T00:00:00");
  const expiration = new Date(cert.expiration_date + "T00:00:00");

  const daysToExpiry = Math.ceil(
    (expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const daysToRenewalWindow = daysToExpiry - 30;

  if (daysToExpiry <= 0) return "Expired";

  if (cert.status === "FAILED" || cert.status === "ESCALATED") {
    return "Failed/Error";
  }

  if (
    cert.status === "READY_FOR_RENEWAL" ||
    cert.status === "IN_PROGRESS" ||
    cert.status === "READY_FOR_INSTALL" ||
    cert.status === "READY_FOR_VALIDATION"
  ) {
    return "In Progress";
  }

  if (cert.status === "ACTIVE" && daysToRenewalWindow <= 7) {
    return "Renewing Soon";
  }

  return "Active";
}

const STATUS_BADGE: Record<AdminDomain["status"], string> = {
  Active:           "bg-green-100 text-green-800",
  Expired:          "bg-red-100 text-red-800",
  "Renewing Soon":  "bg-amber-100 text-amber-800",
  "In Progress":    "bg-purple-200 text-purple-500",
  "Failed/Error":        "bg-gray-100 text-gray-600",
};

function StatusBadge({ status }: { status: AdminDomain["status"] }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_BADGE[status]}`}>
      {status}
    </span>
  );
}

const LEVEL_BADGE: Record<CertLog["level"], string> = {
  INFO:    "bg-blue-100 text-blue-800",
  WARNING: "bg-amber-100 text-amber-800",
  ERROR:   "bg-red-100 text-red-800",
};

function LevelBadge({ level }: { level: CertLog["level"] }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${LEVEL_BADGE[level]}`}>
      {level}
    </span>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) {
    return (
      <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }
  return dir === "asc" ? (
    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

const COLUMNS: { key: SortField; label: string }[] = [
  { key: "id",          label: "ID" },
  { key: "domainName",  label: "Domain Name" },
  { key: "expDate",     label: "Exp. Date" },
  { key: "lastRenewed", label: "Last Renewed" },
  { key: "status",      label: "Status" },
];

const CERT_PREVIEW_COUNT = 20;
const LOG_PREVIEW_COUNT  = 20;


export default function Admin() {
  const navigate = useNavigate();
  const [sortField, setSortField]           = useState<SortField | null>(null);
  const [sortDir, setSortDir]               = useState<SortDir>(null);
  const [filters, setFilters]               = useState<Filters>(defaultFilters);
  const [filterOpen, setFilterOpen]         = useState(false);
  const [certsExpanded, setCertsExpanded]   = useState(false);
  const [logsExpanded, setLogsExpanded]     = useState(false);
  const [domains, setDomains]               = useState<AdminDomain[]>([]);
  const [logs, setLogs]                     = useState<CertLog[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [loadingLogs, setLoadingLogs]       = useState(true);
  const [selectedDomain, setSelectedDomain] = useState<AdminDomain | null>(null);

  useEffect(() => {
    if (!sessionStorage.getItem("crs_auth")) {
      navigate("/");
    } else if (sessionStorage.getItem("crs_role") !== "admin") {
      navigate("/dashboard");
    }
  }, [navigate]);

  useEffect(() => {
    Promise.all([
      fetch("/api/inventory").then((r) => r.json()),
      fetch("/api/simulation").then((r) => r.json()),
    ])
      .then(([data, simulation]: [
        { certificate_id: string; domain: string; expiration_date: string; last_renewed: string; status: string }[],
        { current_date: string; current_cycle: number }
      ]) => {
        setDomains(data.map((cert) => ({
          id: parseInt(cert.certificate_id),
          domainName: cert.domain,
          expDate: cert.expiration_date,
          lastRenewed: cert.last_renewed,
          status: getDisplayStatus(cert, simulation.current_date),
        })));
      })
      .catch(console.error)
      .finally(() => setLoadingDomains(false));
  }, []);

  useEffect(() => {
    fetch("/api/logs")
      .then((r) => r.json())
      .then((data: { timestamp: string; certificate_id: string; domain: string; step: string; level: string; message: string }[]) => {
        setLogs(data.map((entry, i) => ({
          logId: i + 1,
          timestamp: entry.timestamp,
          certificate_id: entry.certificate_id,
          domain: entry.domain,
          step: entry.step,
          level: (entry.level as CertLog["level"]) ?? "INFO",
          message: entry.message,
        })));
      })
      .catch(console.error)
      .finally(() => setLoadingLogs(false));
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortField(null);
      setSortDir(null);
    }
  };

  const filteredData = useMemo(() => {
    return domains.filter((d: AdminDomain) => {
      if (filters.id         && !String(d.id).includes(filters.id))                                     return false;
      if (filters.domainName && !d.domainName.toLowerCase().includes(filters.domainName.toLowerCase())) return false;
      if (filters.expDateFrom     && d.expDate     < filters.expDateFrom)     return false;
      if (filters.expDateTo       && d.expDate     > filters.expDateTo)       return false;
      if (filters.lastRenewedFrom && d.lastRenewed < filters.lastRenewedFrom) return false;
      if (filters.lastRenewedTo   && d.lastRenewed > filters.lastRenewedTo)   return false;
      if (!filters.status.includes(d.status)) return false;
      return true;
    });
  }, [domains, filters]);

  const displayData = useMemo(() => {
    if (!sortField || !sortDir) return filteredData;
    return [...filteredData].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      let cmp = 0;
      if (typeof av === "number") cmp = av - (bv as number);
      else cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredData, sortField, sortDir]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.id)                                        n++;
    if (filters.domainName)                                n++;
    if (filters.expDateFrom || filters.expDateTo)          n++;
    if (filters.lastRenewedFrom || filters.lastRenewedTo)  n++;
    if (filters.status.length < ALL_STATUSES.length)       n++;
    return n;
  }, [filters]);

  const colFilterActive: Partial<Record<SortField, boolean>> = {
    id:          !!filters.id,
    domainName:  !!filters.domainName,
    expDate:     !!(filters.expDateFrom || filters.expDateTo),
    lastRenewed: !!(filters.lastRenewedFrom || filters.lastRenewedTo),
    status:      filters.status.length < ALL_STATUSES.length,
  };

  const visibleCerts = certsExpanded ? displayData : displayData.slice(0, CERT_PREVIEW_COUNT);
  const visibleLogs  = logsExpanded  ? logs        : logs.slice(0, LOG_PREVIEW_COUNT);

  const handleExportCSV = () => {
    const rows = [
      ["ID", "Domain Name", "Exp. Date", "Last Renewed", "Status"],
      ...displayData.map((d) => [d.id, d.domainName, d.expDate, d.lastRenewed, d.status]),
    ];
    const csv  = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "domains-admin.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    const { default: jsPDF }     = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text("CRS Domain Registry — Admin Report", 14, 16);

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated: ${new Date().toLocaleString()}  |  ${displayData.length} records`, 14, 23);

    autoTable(doc, {
      startY: 29,
      head: [["ID", "Domain Name", "Exp. Date", "Last Renewed", "Status"]],
      body: displayData.map((d) => [d.id, d.domainName, d.expDate, d.lastRenewed, d.status]),
      headStyles:         { fillColor: [37, 99, 235], fontSize: 8 },
      bodyStyles:         { fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save("domains-admin.pdf");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("crs_auth");
    sessionStorage.removeItem("crs_role");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
              <img src={logo} alt="CRS Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="text-gray-900 font-semibold text-lg">ReCert</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-800 text-white tracking-wide">
              ADMIN
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* Certs table */}
        <section>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Certificates:</h2>
              <p className="text-gray-400 text-sm mt-0.5">
                {certsExpanded
                  ? `Showing all ${displayData.length} domains`
                  : `Showing ${Math.min(CERT_PREVIEW_COUNT, displayData.length)} of ${displayData.length} domains`}
                {activeFilterCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCertsExpanded((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:border-gray-400 transition-colors"
              >
                {certsExpanded ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    Collapse
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    Expand Full List
                  </>
                )}
              </button>

              <button
                onClick={() => setFilterOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  activeFilterCount > 0
                    ? "bg-gray-600 text-white border-gray-600 hover:bg-gray-700"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-blue-600 text-xs font-bold leading-none">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:border-gray-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>

              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:border-gray-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Export PDF
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {COLUMNS.map(({ key, label }) => (
                      <th key={key} className="px-4 py-3 text-left whitespace-nowrap">
                        <button
                          onClick={() => handleSort(key)}
                          className="group flex items-center gap-1.5 font-semibold text-gray-800 hover:text-gray-500 transition-colors"
                        >
                          {label}
                          {colFilterActive[key] && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" title="Filter active" />
                          )}
                          <SortIcon active={sortField === key} dir={sortDir} />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {loadingDomains ? (
                    <tr>
                      <td colSpan={COLUMNS.length} className="px-4 py-16 text-center text-gray-400 text-sm">
                        Loading certificates…
                      </td>
                    </tr>
                  ) : displayData.length === 0 ? (
                    <tr>
                      <td colSpan={COLUMNS.length} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm font-medium">No domains match the current filters</p>
                          <button onClick={() => setFilters(defaultFilters)} className="text-xs text-blue-600 hover:underline">
                            Clear filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    visibleCerts.map((domain, i) => (
                      <tr
                        key={domain.id}
                        className={`border-b border-gray-100 last:border-0 hover:bg-blue-50/40 transition-colors ${
                          i % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{domain.id}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedDomain(domain)}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-left"
                          >
                            {domain.domainName}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-600 tabular-nums">{domain.expDate}</td>
                        <td className="px-4 py-3 text-gray-600 tabular-nums">{domain.lastRenewed}</td>
                        <td className="px-4 py-3"><StatusBadge status={domain.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {certsExpanded
                  ? `${displayData.length} total records${activeFilterCount > 0 ? ` (filtered from ${domains.length})` : ""}`
                  : `${Math.min(CERT_PREVIEW_COUNT, displayData.length)} of ${displayData.length} records shown${activeFilterCount > 0 ? ` (filtered from ${domains.length})` : ""}`}
              </span>
              {(certsExpanded || displayData.length > CERT_PREVIEW_COUNT) && (
                <button
                  onClick={() => setCertsExpanded((v) => !v)}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium"
                >
                  {certsExpanded ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Collapse
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      View {displayData.length - CERT_PREVIEW_COUNT} more records
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Admin-only activity log */}
        <section>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Certificate Activity Log</h2>
              <p className="text-gray-400 text-sm mt-0.5">
                {logsExpanded
                  ? `Showing all ${logs.length} entries`
                  : `Showing latest ${Math.min(LOG_PREVIEW_COUNT, logs.length)} of ${logs.length} entries`}
              </p>
            </div>

            <button
              onClick={() => setLogsExpanded((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:border-gray-400 transition-colors self-start sm:self-auto"
            >
              {logsExpanded ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Collapse
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Expand Full History
                </>
              )}
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left whitespace-nowrap font-semibold text-gray-800">Log ID</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap font-semibold text-gray-800">Timestamp</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap font-semibold text-gray-800">Domain</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap font-semibold text-gray-800">Cert ID</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap font-semibold text-gray-800">Step</th>
                    <th className="px-4 py-3 text-left whitespace-nowrap font-semibold text-gray-800">Level</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingLogs ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center text-gray-400 text-sm">
                        Loading logs…
                      </td>
                    </tr>
                  ) : (
                    visibleLogs.map((log, i) => (
                      <tr
                        key={log.logId}
                        className={`border-b border-gray-100 last:border-0 hover:bg-blue-50/40 transition-colors ${
                          i % 2 === 1 ? "bg-gray-50/50" : "bg-white"
                        }`}
                      >
                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{log.logId}</td>
                        <td className="px-4 py-3 text-gray-500 tabular-nums text-xs whitespace-nowrap">{log.timestamp}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{log.domain}</td>
                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">{log.certificate_id}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{log.step}</td>
                        <td className="px-4 py-3"><LevelBadge level={log.level} /></td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{log.message}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {logsExpanded
                  ? `${logs.length} total entries`
                  : `${Math.min(LOG_PREVIEW_COUNT, logs.length)} of ${logs.length} entries shown`}
              </span>
              {(logsExpanded || logs.length > LOG_PREVIEW_COUNT) && (
                <button
                  onClick={() => setLogsExpanded((v) => !v)}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium"
                >
                  {logsExpanded ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Collapse
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      View {logs.length - LOG_PREVIEW_COUNT} more entries
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      <DomainHistoryModal
        domain={selectedDomain}
        logs={logs}
        onClose={() => setSelectedDomain(null)}
      />

      <FilterModal
        isOpen={filterOpen}
        filters={filters}
        onChange={setFilters}
        onClose={() => setFilterOpen(false)}
        onClear={() => setFilters(defaultFilters)}
      />
    </div>
  );
}
