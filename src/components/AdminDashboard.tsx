import React, { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Activity,
  Power,
  CheckCircle,
  RefreshCw,
  Zap,
  Database,
  Monitor,
  ShieldAlert,
  ArrowUpRight,
  Search
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<string>("dashboard"); // "dashboard", "students", "activity"
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [boardFilter, setBoardFilter] = useState<string>("ALL");
  const [streamFilter, setStreamFilter] = useState<string>("ALL");

  useEffect(() => {
    fetchAdminStats();
    fetchStudents();

    // Set up auto-refresh every 5 seconds for telemetry logs
    const interval = setInterval(() => {
      fetchAdminStats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getUserHeaders = () => {
    const user = localStorage.getItem("user");
    if (!user) return {};
    try {
      const parsed = JSON.parse(user);
      return {
        "X-User-Email": parsed.email || "",
        "X-User-Name": parsed.name || "",
        "X-User-Role": parsed.role || ""
      };
    } catch {
      return {};
    }
  };

  const fetchAdminStats = async () => {
    try {
      const res = await fetch("/api/admin/dashboard", {
        headers: getUserHeaders()
      });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/admin/users", {
        headers: getUserHeaders()
      });
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error("Failed to load registered users:", err);
    }
  };

  const toggleStudentStatus = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/toggle-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getUserHeaders()
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchStudents();
        fetchAdminStats(); // Refresh log activity and counts
      }
    } catch (err) {
      console.error("Failed to toggle student status:", err);
    }
  };

  if (loading || !stats) {
    return (
      <div className="py-24 text-center text-slate-500 font-mono text-sm animate-pulse flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        <span>Syncing Live Command Telemetry & Diagnostics...</span>
      </div>
    );
  }

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBoard = boardFilter === "ALL" || s.board === boardFilter;
    const matchesStream = streamFilter === "ALL" || s.stream === streamFilter;
    return matchesSearch && matchesBoard && matchesStream;
  });

  return (
    <div className="space-y-6" id="admin-operations-section">
      {/* Top Bar Header with Tabs */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 border border-slate-100 rounded-3xl shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 font-display">Institution Command Center</h2>
            <p className="text-xs text-slate-500 font-sans">Real-time database insights, caching stats & learning loops telemetry</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button
            onClick={() => setActiveSubTab("dashboard")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer ${
              activeSubTab === "dashboard"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Diagnostics Dashboard
          </button>
          <button
            onClick={() => setActiveSubTab("students")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer ${
              activeSubTab === "students"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            User Registries
          </button>
          <button
            onClick={() => setActiveSubTab("activity")}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer ${
              activeSubTab === "activity"
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Audit Trails
          </button>
        </div>
      </div>

      {/* Subtab: Diagnostics Dashboard */}
      {activeSubTab === "dashboard" && (
        <div className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric: Registered Users */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Registered Profiles</span>
                  <h4 className="text-3xl font-bold font-display text-slate-800 tracking-tight">{stats.totalUsers}</h4>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100/50">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                <span className="text-[10px] text-slate-500 flex items-center font-semibold font-sans">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                  Students: {stats.totalStudents} • Parents: {stats.totalParents}
                </span>
              </div>
            </div>

            {/* Metric: Study Notes */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Real Study Notes</span>
                  <h4 className="text-3xl font-bold font-display text-emerald-600 tracking-tight">{stats.totalNotesCount}</h4>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100/50">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                <span className="text-[10px] text-slate-500 flex items-center font-semibold font-sans">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                  Synced with Cloud SQL
                </span>
              </div>
            </div>

            {/* Metric: Timetable slots */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Academic Goals Set</span>
                  <h4 className="text-3xl font-bold font-display text-slate-800 tracking-tight">{stats.totalGoalsCount}</h4>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100/50">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                <span className="text-[10px] text-slate-500 flex items-center font-semibold font-sans">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                  Interactive progress tracked
                </span>
              </div>
            </div>

            {/* Metric: Active Sessions */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Live Telemetry</span>
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h4 className="text-3xl font-bold font-display text-slate-800 tracking-tight">{stats.activeUsersCount} Online</h4>
                  </div>
                </div>
                <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100/50">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                <span className="text-[10px] text-slate-500 flex items-center font-semibold font-sans">
                  <Monitor className="w-3.5 h-3.5 text-indigo-500 mr-1" />
                  Auto-updated on user actions
                </span>
              </div>
            </div>
          </div>

          {/* Graphs Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Study Activity growth area chart */}
            <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider font-display">Study Activity & content Growth</h3>
                  <p className="text-xs text-slate-500 font-sans">Aggregated learning materials creation and session logging trends</p>
                </div>
                <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/50 p-1 rounded-xl">
                  <span className="text-[10px] font-mono font-bold bg-white text-slate-700 px-2 py-1 rounded shadow-xs">2026</span>
                  <span className="text-[10px] font-mono text-slate-400 px-2">Live SQL</span>
                </div>
              </div>

              <div className="h-[280px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorNotes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorGoals" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} fontStyle="mono" />
                    <YAxis stroke="#94a3b8" fontSize={10} fontStyle="mono" />
                    <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #f1f5f9", borderRadius: "12px", fontSize: "11px", fontFamily: "sans-serif" }} />
                    <Legend wrapperStyle={{ fontSize: "11px", fontFamily: "sans-serif", paddingTop: "10px" }} />
                    <Area type="monotone" dataKey="notes" name="Study Notes Created" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorNotes)" />
                    <Area type="monotone" dataKey="goals" name="Learning Goals Set" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorGoals)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance metrics & platform health (Shows Caching stats) */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider font-display">Developer Diagnostics</h3>
                  <p className="text-xs text-slate-500 font-sans">Active caching and container execution parameters</p>
                </div>
                <Database className="w-4.5 h-4.5 text-slate-400" />
              </div>

              <div className="space-y-4 font-mono">
                {/* Cache hit rate */}
                <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600 uppercase tracking-wider">Memory Cache Hit Rate</span>
                    <span className="text-emerald-600">
                      {stats.cacheStats?.hitRate ?? 100}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${stats.cacheStats?.hitRate ?? 100}%` }}
                    />
                  </div>
                </div>

                {/* API Cache stats */}
                <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600 uppercase tracking-wider">Active Cache Entries</span>
                    <span className="text-indigo-600">{stats.cacheStats?.size ?? 0} keys</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans">Hits: {stats.cacheStats?.hits ?? 0} • Misses: {stats.cacheStats?.misses ?? 0}</p>
                </div>

                {/* Database Latency */}
                <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600 uppercase tracking-wider">SQL Connection pool</span>
                    <span className="text-indigo-600">Healthy</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans">Cloud SQL PostgreSQL (us-west1) • ORM: Drizzle</p>
                </div>

                {/* Security integrity status */}
                <div className="p-3 bg-indigo-50 border border-indigo-100/40 rounded-2xl flex items-center space-x-3 text-indigo-900">
                  <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold font-sans">Secure Caching Layer Active</p>
                    <p className="text-[9px] text-indigo-600 mt-0.5 font-sans">Cache-aside invalidation binds notes, goals & schedules</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Grid: Live active sessions and Recent operations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live active sessions table */}
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
              <div>
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider font-display">Active User Sessions</h3>
                    <p className="text-xs text-slate-500 font-sans">Live telemetry captured from micro-frontend interactions</p>
                  </div>
                  <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full font-mono">
                    {stats.activeSessions.length} active
                  </span>
                </div>

                <div className="divide-y divide-slate-100 overflow-y-auto max-h-[300px]">
                  {stats.activeSessions.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 font-mono text-xs">No active live sessions tracked</div>
                  ) : (
                    stats.activeSessions.map((session: any, idx: number) => (
                      <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-slate-800 text-sm font-display">{session.user}</h4>
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                          <p className="text-xs text-indigo-600 font-mono mt-0.5">{session.task}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">{session.device} • {session.email}</p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                          {session.role}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-mono">Telemetry polling interval: 5000ms</span>
              </div>
            </div>

            {/* Recent activities log stream */}
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between">
              <div>
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider font-display">System Operations Log</h3>
                    <p className="text-xs text-slate-500 font-sans">Live audit logs of user activities, logins, and database commits</p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 overflow-y-auto max-h-[300px]">
                  {stats.recentActivities.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 font-mono text-xs">No active logs present</div>
                  ) : (
                    stats.recentActivities.map((activity: any) => (
                      <div key={activity.id} className="p-4 hover:bg-slate-50 transition flex items-start gap-3">
                        <span 
                          className={`text-[8px] font-bold font-mono px-2 py-0.5 rounded uppercase tracking-wider shrink-0 mt-0.5 ${
                            activity.type === "NOTE_CREATE" || activity.type === "NOTE_DELETE"
                              ? "bg-indigo-100 text-indigo-700"
                              : activity.type === "GOAL_CREATE" || activity.type === "GOAL_UPDATE"
                              ? "bg-emerald-100 text-emerald-700"
                              : activity.type === "POLICY_CHANGE"
                              ? "bg-rose-100 text-rose-700"
                              : activity.type === "LOGIN" || activity.type === "USER_JOIN"
                              ? "bg-sky-100 text-sky-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {activity.type}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-700 font-sans">{activity.desc}</p>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono mt-1">
                            <span>User: {activity.user}</span>
                            <span>•</span>
                            <span>IP: {activity.ip}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap">{activity.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <span className="text-[10px] text-slate-400 font-mono">Logger: Active system telemetry listening...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab: Student Registry */}
      {activeSubTab === "students" && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm space-y-4">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider font-display">Student & User Registry</h3>
              <p className="text-xs text-slate-500 font-sans">Manage student system permissions and dashboard profile statuses</p>
            </div>
            
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search profiles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={boardFilter}
                onChange={(e) => setBoardFilter(e.target.value)}
                className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Boards</option>
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
              </select>

              <select
                value={streamFilter}
                onChange={(e) => setStreamFilter(e.target.value)}
                className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Streams</option>
                <option value="Science">Science</option>
                <option value="Commerce">Commerce</option>
                <option value="Arts">Arts</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-mono text-sm">No user profiles found.</div>
            ) : (
              filteredStudents.map((student) => (
                <div key={student.id} className="p-5 flex items-center justify-between hover:bg-slate-50/40 transition gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center space-x-2.5">
                      <h4 className="font-bold text-slate-800 text-sm font-display">{student.name}</h4>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded tracking-wider border ${
                          student.status === "ACTIVE" 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                            : "bg-rose-50 text-rose-600 border-rose-100"
                        }`}
                      >
                        {student.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-sans">{student.email} • {student.role}</p>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span className="text-indigo-600 font-bold uppercase tracking-wider">{student.board}</span>
                      <span>•</span>
                      <span>Stream: {student.stream}</span>
                      <span>•</span>
                      <span>Class {student.classLevel}</span>
                    </div>
                  </div>

                  {student.role !== "ROLE_ADMIN" && (
                    <button
                      onClick={() => toggleStudentStatus(student.id)}
                      className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-[10px] font-mono tracking-wider uppercase border transition cursor-pointer shrink-0 ${
                        student.status === "ACTIVE"
                          ? "text-rose-600 border-rose-200 bg-rose-50/50 hover:bg-rose-50"
                          : "text-emerald-600 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50"
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{student.status === "ACTIVE" ? "Suspend" : "Reinstate"}</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Subtab: Audit Trails */}
      {activeSubTab === "activity" && (
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm space-y-4">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider font-display">System Audit Logs</h3>
              <p className="text-xs text-slate-500 font-sans">Complete sequence of actions tracked in real-time across database nodes</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {stats.recentActivities.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-mono text-sm">No activity logs recorded.</div>
            ) : (
              stats.recentActivities.map((activity: any) => (
                <div key={activity.id} className="p-4 hover:bg-slate-50 transition flex items-start gap-4">
                  <span 
                    className={`text-[8px] font-bold font-mono px-2 py-1 rounded uppercase tracking-wider shrink-0 mt-0.5 border ${
                      activity.type === "NOTE_CREATE" || activity.type === "NOTE_DELETE"
                        ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
                        : activity.type === "GOAL_CREATE" || activity.type === "GOAL_UPDATE"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                        : activity.type === "POLICY_CHANGE"
                        ? "bg-rose-50 text-rose-600 border-rose-100"
                        : "bg-slate-100 text-slate-600 border-slate-200/40"
                    }`}
                  >
                    {activity.type}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm text-slate-800 font-sans font-medium">{activity.desc}</p>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
                      <span>Actor: <strong className="text-slate-600">{activity.user}</strong></span>
                      <span>•</span>
                      <span>IP Address: {activity.ip}</span>
                      <span>•</span>
                      <span>Audit Time: {activity.time}</span>
                    </div>
                  </div>
                </div>
              )))}
          </div>
        </div>
      )}
    </div>
  );
}
