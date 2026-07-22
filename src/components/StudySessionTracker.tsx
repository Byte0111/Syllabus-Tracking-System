import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Clock, BookOpen, AlertCircle, Plus, Flame, CheckCircle, Award, Calendar } from "lucide-react";
import { StudySession } from "../types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { isGoogleConnected, addEventToGoogleCalendar, fetchCalendarEvents } from "../lib/calendar";

export default function StudySessionTracker() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subject, setSubject] = useState<string>("Physics");
  const [chapter, setChapter] = useState<string>("Electric Charges and Fields");
  const [duration, setDuration] = useState<number>(45);
  const [notes, setNotes] = useState<string>("");
  const [pomodoroCount, setPomodoroCount] = useState<number>(0);
  const [syncToCalendar, setSyncToCalendar] = useState<boolean>(true);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);

  const showToastMessage = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Pomodoro States
  const [focusDuration, setFocusDuration] = useState<number>(25); // in minutes
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchSessions();
    if (isGoogleConnected()) {
      fetchGoogleEvents();
    }
  }, []);

  const fetchGoogleEvents = async () => {
    try {
      const events = await fetchCalendarEvents(5);
      setCalendarEvents(events);
    } catch (err) {
      console.error("Failed to fetch Google Calendar events:", err);
    }
  };

  // Synchronize timeLeft when focusDuration changes (only when timer is not running)
  useEffect(() => {
    if (!isTimerRunning) {
      setTimeLeft(focusDuration * 60);
    }
  }, [focusDuration, isTimerRunning]);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            setPomodoroCount((c) => c + 1);
            showToastMessage("Pomodoro session completed! Take a 5-minute break.", "success");
            return focusDuration * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, focusDuration]);

  const fetchSessions = async () => {
    try {
      const isCleared = localStorage.getItem("study_sessions_cleared") === "true";
      if (isCleared) {
        setSessions([]);
        return;
      }
      const res = await fetch(`/api/sessions?t=${Date.now()}`);
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartTimer = () => setIsTimerRunning(true);
  const handlePauseTimer = () => setIsTimerRunning(false);
  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(focusDuration * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, chapter, durationMinutes: duration, pomodoroCount, notes }),
      });
      const newSession = await res.json();
      localStorage.removeItem("study_sessions_cleared");
      setSessions((prev) => [newSession, ...prev]);

      // Sync to Google Calendar
      if (syncToCalendar && isGoogleConnected()) {
        try {
          await addEventToGoogleCalendar({
            summary: `Study: ${subject} - ${chapter}`,
            description: `Study Tracker logged session.\nSubject: ${subject}\nChapter: ${chapter}\nNotes: ${notes || "None"}`,
            startTime: new Date().toISOString(),
            durationMinutes: duration,
          });
          fetchGoogleEvents();
        } catch (calErr: any) {
          console.error("Google Calendar sync error:", calErr);
          showToastMessage("Session logged locally, but Google Calendar sync failed: " + calErr.message, "error");
        }
      }

      setNotes("");
      setPomodoroCount(0);
      showToastMessage("Study session logged successfully!", "success");
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await fetch("/api/sessions", {
        method: "DELETE",
      });
      if (res.ok) {
        setSessions([]);
        localStorage.setItem("study_sessions_cleared", "true");
        showToastMessage("Focus history cleared successfully!", "success");
        setIsConfirmingClear(false);
      } else {
        showToastMessage("Failed to clear focus history.", "error");
      }
    } catch (err) {
      console.error(err);
      showToastMessage("An error occurred while clearing focus history.", "error");
    }
  };

  // Prepare chart data (past 5 sessions)
  const chartData = [...sessions]
    .reverse()
    .slice(-7)
    .map((s) => ({
      name: s.subject,
      minutes: s.durationMinutes,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="study-session-tracker">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-2xl shadow-2xl border flex items-center space-x-2 animate-fade-in ${
          toast.type === "success" 
            ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300" 
            : toast.type === "error" 
            ? "bg-rose-950/90 border-rose-500/30 text-rose-300" 
            : "bg-slate-900/90 border-slate-700 text-slate-200"
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            toast.type === "success" ? "bg-emerald-400" : toast.type === "error" ? "bg-rose-400" : "bg-slate-400"
          }`} />
          <span className="text-xs font-mono font-medium">{toast.message}</span>
        </div>
      )}

      {/* Pomodoro Timer Panel */}
      <div className="bg-[#0b0f19]/80 backdrop-blur-xl text-slate-100 p-6 rounded-3xl shadow-2xl border border-white/[0.08] flex flex-col items-center justify-between min-h-[380px] glow-indigo">
        <div className="w-full flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400/10" />
            <span className="font-display font-medium text-xs tracking-wider uppercase text-white">Focus Engine</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Pomodoros: {pomodoroCount}</span>
        </div>

        <div className="my-6 text-center relative">
          <div className="text-6xl font-display font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 mb-2">
            {formatTime(timeLeft)}
          </div>
          <p className="text-[9px] text-slate-400 font-mono tracking-widest uppercase mb-4">
            {isTimerRunning ? "Deep Focus Engaged" : "Session Suspended"}
          </p>

          <div className="flex items-center justify-center space-x-2 bg-white/5 p-1 px-3 rounded-xl border border-white/[0.05] inline-flex">
            <button
              type="button"
              disabled={isTimerRunning || focusDuration <= 1}
              onClick={() => setFocusDuration((prev) => Math.max(1, prev - 1))}
              className="text-[10px] text-slate-400 hover:text-white disabled:opacity-30 px-1 font-bold cursor-pointer transition font-mono"
              title="Decrease by 1 minute"
            >
              -1m
            </button>
            <button
              type="button"
              disabled={isTimerRunning || focusDuration <= 5}
              onClick={() => setFocusDuration((prev) => Math.max(1, prev - 5))}
              className="text-[10px] text-slate-400 hover:text-white disabled:opacity-30 px-1 font-bold cursor-pointer transition font-mono"
              title="Decrease by 5 minutes"
            >
              -5m
            </button>
            <span className="text-xs font-mono font-bold text-indigo-300 px-1">{focusDuration}m</span>
            <button
              type="button"
              disabled={isTimerRunning}
              onClick={() => setFocusDuration((prev) => prev + 1)}
              className="text-[10px] text-slate-400 hover:text-white disabled:opacity-30 px-1 font-bold cursor-pointer transition font-mono"
              title="Increase by 1 minute"
            >
              +1m
            </button>
            <button
              type="button"
              disabled={isTimerRunning}
              onClick={() => setFocusDuration((prev) => prev + 5)}
              className="text-[10px] text-slate-400 hover:text-white disabled:opacity-30 px-1 font-bold cursor-pointer transition font-mono"
              title="Increase by 5 minutes"
            >
              +5m
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full">
          {isTimerRunning ? (
            <button
              onClick={handlePauseTimer}
              className="flex-1 py-3 px-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <Pause className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Pause Focus</span>
            </button>
          ) : (
            <button
              onClick={handleStartTimer}
              className="flex-1 py-3 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Initiate Focus</span>
            </button>
          )}
          <button
            onClick={handleResetTimer}
            className="p-3 rounded-xl border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Manual Logger & Chart */}
      <div className="lg:col-span-2 bg-white border border-slate-200 p-8 rounded-3xl shadow-xl space-y-6">
        <h3 className="font-display font-bold text-lg tracking-tight text-slate-900">Log Study Time & Focus Analytics</h3>

        <form onSubmit={handleAddSession} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-slate-800 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all cursor-pointer"
            >
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Mathematics</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Chapter / Topic</label>
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-slate-800 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
              placeholder="e.g. Gauss Theorem derivation"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Duration (Minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-slate-800 text-sm font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono transition-all"
              min="5"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Pomodoro Sessions</label>
            <input
              type="number"
              value={pomodoroCount}
              onChange={(e) => setPomodoroCount(parseInt(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-slate-800 text-sm font-semibold focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-mono transition-all"
              min="0"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Takeaways & Milestones</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-slate-800 text-sm font-medium focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
              placeholder="What formulas or definitions were consolidated?"
            />
          </div>

          {isGoogleConnected() && (
            <div className="md:col-span-2 flex items-center space-x-2.5 bg-green-50 p-3.5 rounded-xl border border-green-200">
              <input
                type="checkbox"
                id="syncToCalendar"
                checked={syncToCalendar}
                onChange={(e) => setSyncToCalendar(e.target.checked)}
                className="rounded border-slate-300 bg-white text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <label htmlFor="syncToCalendar" className="text-xs text-slate-700 font-semibold select-none cursor-pointer flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Add study session to my Google Calendar automatically
              </label>
            </div>
          )}

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Publish Session Logs</span>
            </button>
          </div>
        </form>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="space-y-4 border-t border-slate-100 pt-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Weekly distribution index (Minutes)</h4>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#475569", fontWeight: 500 }} />
                  <YAxis tick={{ fontSize: 10, fill: "#475569", fontWeight: 500 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", color: "#0f172a", fontSize: "11px", fontWeight: 500 }}
                    itemStyle={{ color: "#4f46e5" }}
                  />
                  <Bar dataKey="minutes" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Historic Logs */}
      <div className="lg:col-span-3 bg-[#0b0f19]/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-3xl shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
          <h3 className="font-display font-medium text-xs tracking-wider uppercase text-white">Completed Focus History</h3>
          {sessions.length > 0 && (
            isConfirmingClear ? (
              <div className="flex items-center gap-2 animate-fade-in">
                <span className="text-[9px] text-rose-400 font-mono uppercase tracking-wider">Are you sure?</span>
                <button
                  onClick={handleClearHistory}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-[9px] uppercase tracking-wider transition cursor-pointer"
                >
                  Yes, Clear
                </button>
                <button
                  onClick={() => setIsConfirmingClear(false)}
                  className="px-2.5 py-1 rounded-lg border border-white/10 text-slate-400 font-mono text-[9px] uppercase tracking-wider hover:bg-white/5 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsConfirmingClear(true)}
                className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 font-mono text-[10px] tracking-wider uppercase hover:bg-rose-500/10 transition cursor-pointer"
              >
                Clear Focus History
              </button>
            )
          )}
        </div>
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
          {sessions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono">No telemetry logged yet</div>
          ) : (
            sessions.map((sess) => (
              <div key={sess.id} className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl flex items-center justify-between hover:bg-white/[0.04] transition">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20 shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-display font-medium text-white text-xs truncate">{sess.chapter}</h4>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono mt-0.5">
                      <span className="text-indigo-400 uppercase tracking-wider">{sess.subject}</span>
                      <span>•</span>
                      <span className="truncate max-w-[120px]">{sess.notes || "No extra logs"}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className="font-mono text-xs text-white font-semibold">{sess.durationMinutes}m</div>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                    {new Date(sess.startTime).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Google Calendar Agenda Panel */}
      {isGoogleConnected() && (
        <div className="lg:col-span-3 bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-6">
          <div className="flex items-center justify-between border-b border-black pb-3 mb-4">
            <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-black flex items-center gap-2">
              <Calendar className="w-4 h-4 text-black" />
              Google Calendar Agenda (Synced Live)
            </h3>
            <span className="text-[10px] font-mono uppercase bg-green-100 text-green-800 border border-green-300 px-2.5 py-0.5 font-bold">
              Active
            </span>
          </div>

          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {calendarEvents.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs font-mono">
                No upcoming events found on Google Calendar.
              </div>
            ) : (
              calendarEvents.map((evt: any) => {
                const start = evt.start?.dateTime || evt.start?.date;
                const formattedDate = start ? new Date(start).toLocaleString() : "All Day";
                return (
                  <div key={evt.id} className="p-3 bg-[#eaece6] border border-black flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-white transition">
                    <div>
                      <h4 className="font-mono font-bold text-xs text-black">{evt.summary}</h4>
                      <p className="text-[10px] text-slate-600 font-mono mt-1">{evt.description || "No description provided."}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0 text-right">
                      {formattedDate}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
