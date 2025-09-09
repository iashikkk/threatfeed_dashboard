"use client";
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function App() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [dark, setDark] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [selectedTrend, setSelectedTrend] = useState(null);

  // Dark mode toggle
  useEffect(() => {
    document.body.classList.toggle("dark", dark);
  }, [dark]);

  // Severity tagging
  const getSeverity = (type) => {
    if (type === "ip") return "High";
    if (type === "subnet") return "Medium";
    if (type === "url") return "Low";
    return "Unknown";
  };

  // Fetch IOCs
  async function fetchIOCs() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/iocs.json");
      if (!res.ok) throw new Error("Failed to fetch IOCs");
      const json = await res.json();
      const deduped = Array.from(new Map(json.map((i) => [i.value, i])).values());
      const tagged = deduped.map((i) => ({ ...i, severity: getSeverity(i.type) }));
      setData(tagged);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchIOCs();
    let interval;
    if (autoRefresh) interval = setInterval(fetchIOCs, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filters
  useEffect(() => {
    let result = [...data];
    if (search) {
      result = result.filter(
        (i) =>
          i.value.toLowerCase().includes(search.toLowerCase()) ||
          i.source.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (typeFilter !== "all") result = result.filter((i) => i.type === typeFilter);
    if (sort === "latest") result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    else if (sort === "oldest") result.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    else if (sort === "alpha") result.sort((a, b) => a.value.localeCompare(b.value));
    setFiltered(result);
    setPage(1);
  }, [data, search, typeFilter, sort]);

  // Summary counts
  const ipCount = data.filter((i) => i.type === "ip").length;
  const subnetCount = data.filter((i) => i.type === "subnet").length;
  const urlCount = data.filter((i) => i.type === "url").length;
  const COLORS = ["#2563eb", "#f59e0b", "#10b981"];

  // Chart Data
  let chartData = [];
  if (typeFilter === "all") {
    chartData = [
      { name: "IPs", value: ipCount },
      { name: "Subnets", value: subnetCount },
      { name: "URLs", value: urlCount },
    ];
  } else if (typeFilter === "ip") chartData = [{ name: "IPs", value: ipCount }];
  else if (typeFilter === "subnet") chartData = [{ name: "Subnets", value: subnetCount }];
  else if (typeFilter === "url") chartData = [{ name: "URLs", value: urlCount }];

  // Trend Data (zig-zag)
  const grouped = data.reduce((acc, ioc) => {
    const date = new Date(ioc.timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = { time: date, ip: 0, subnet: 0, url: 0 };
    acc[date][ioc.type] += 1;
    return acc;
  }, {});

  let trendData = Object.values(grouped);
  trendData = trendData.map((d, idx, arr) => {
    if (idx === 0)
      return {
        ...d,
        ipTrend: "—",
        subnetTrend: "—",
        urlTrend: "—",
        ipZig: d.ip,
        subnetZig: d.subnet,
        urlZig: d.url,
      };
    const prev = arr[idx - 1];
    const zig = () => Math.random() * 0.3 - 0.15; // -0.15 to +0.15
    return {
      ...d,
      ipTrend: d.ip > prev.ip ? "🔼" : d.ip < prev.ip ? "🔽" : "—",
      subnetTrend: d.subnet > prev.subnet ? "🔼" : d.subnet < prev.subnet ? "🔽" : "—",
      urlTrend: d.url > prev.url ? "🔼" : d.url < prev.url ? "🔽" : "—",
      ipZig: d.ip + zig(),
      subnetZig: d.subnet + zig(),
      urlZig: d.url + zig(),
    };
  });

  // Pagination
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  // Export CSV
  const exportCSV = () => {
    const headers = ["Value", "Type", "Source", "Timestamp", "Severity"];
    const rows = filtered.map((i) => [i.value, i.type, i.source, i.timestamp, i.severity]);
    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "ioc_feed.csv";
    link.click();
  };

  // Export JSON
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ioc_feed.json";
    link.click();
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="topbar">
        <h1>⚡ ThreatFeed Dashboard</h1>
        <div>
          <input
            type="text"
            placeholder="🔍 Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={fetchIOCs}>🔄 Refresh</button>
          <button onClick={exportCSV}>⬇ Export CSV</button>
          <button onClick={exportJSON}>⬇ Export JSON</button>
          <button onClick={() => setShowSettings(true)}>⚙ Settings</button>
        </div>
      </header>

      {/* Settings */}
      <div className={`settings-panel ${showSettings ? "open" : ""}`}>
        <div className="settings-header">
          <h2>⚙ Settings</h2>
          <button onClick={() => setShowSettings(false)}>✖</button>
        </div>
        <div className="settings-body">
          <div className="setting-option">
            <label>
              <input type="checkbox" checked={dark} onChange={() => setDark(!dark)} /> Dark Mode
            </label>
          </div>
          <div className="setting-option">
            <label>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={() => setAutoRefresh(!autoRefresh)}
              />{" "}
              Auto Refresh (10s)
            </label>
          </div>
          <div className="setting-option">
            <label>Items per page:</label>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
          <div className="setting-option">
            <label>Filter by Type:</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="ip">IP</option>
              <option value="subnet">Subnet</option>
              <option value="url">URL</option>
            </select>
          </div>
          <div className="setting-option">
            <label>Sort by:</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      <main className="main">
        {/* Sidebar Charts */}
        <aside className="sidebar">
          <div className="card">
            <h3>📊 IOC Summary</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3>📈 IOC Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="linear" dataKey="ipZig" stroke="#2563eb" name="IPs" />
                <Line type="linear" dataKey="subnetZig" stroke="#f59e0b" name="Subnets" />
                <Line type="linear" dataKey="urlZig" stroke="#10b981" name="URLs" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </aside>

        {/* IOC Feed Table */}
        <section className="content">
          <div className="card">
            <h3>🧾 IOC Feed</h3>
            {loading && <p>Loading...</p>}
            {error && <p className="error">Error: {error}</p>}
            {!loading && !error && (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Value</th>
                      <th>Type</th>
                      <th>Source</th>
                      <th>Timestamp</th>
                      <th>Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((ioc, idx) => (
                      <tr key={idx}>
                        <td>{ioc.value}</td>
                        <td>{ioc.type}</td>
                        <td>{ioc.source}</td>
                        <td>{new Date(ioc.timestamp).toLocaleString()}</td>
                        <td>{ioc.severity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                ⬅ Prev
              </button>
              <span>
                Page {page} of {totalPages || 1}
              </span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                Next ➡
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
