import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Plus, 
  AlertCircle, 
  Calendar, 
  Sparkles,
  Bell
} from "lucide-react";
import { TodoItem } from "../types";

// Synthesizer beep audio generator using modern Web Audio API
const playAlarmSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Play electronic alarm tone pattern
    const playBeep = (startTime: number, frequency: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(frequency, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);
      
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    };
    
    const now = ctx.currentTime;
    playBeep(now, 880);      // High beep
    playBeep(now + 0.4, 880);
    playBeep(now + 0.8, 1046.5); // Higher pitch climax beep
  } catch (e) {
    console.error("Failed to synthesize alarm tone", e);
  }
};

export default function TodoCorner() {
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const saved = localStorage.getItem("student_todos_cache");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [newText, setNewText] = useState("");
  const [newSubject, setNewSubject] = useState<"Physics" | "Chemistry" | "Mathematics" | "Biology" | "General">("General");
  const [newPriority, setNewPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [newDueDate, setNewDueDate] = useState("");
  const [newReminderTime, setNewReminderTime] = useState("");
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("PENDING");
  
  // Real-time triggered alarm popup state
  const [activeAlarmTodo, setActiveAlarmTodo] = useState<TodoItem | null>(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("student_todos_cache", JSON.stringify(todos));
    } catch (e) {}
  }, [todos]);

  // Repeating alarm sound when alarm modal is active
  useEffect(() => {
    if (!activeAlarmTodo) return;

    playAlarmSound();
    const timer = setInterval(() => {
      playAlarmSound();
    }, 3000);

    return () => clearInterval(timer);
  }, [activeAlarmTodo]);

  // Interval loop to monitor alarm trigger match every 5 seconds
  useEffect(() => {
    const checkAlarms = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      const currentTimeString = `${hours}:${mins}`;

      todos.forEach((todo) => {
        if (
          !todo.completed &&
          todo.reminderTime &&
          todo.reminderTime === currentTimeString &&
          !todo.reminderTriggered
        ) {
          setActiveAlarmTodo(todo);
          markReminderAsTriggered(todo.id);
        }
      });
    }, 5000);

    return () => clearInterval(checkAlarms);
  }, [todos]);

  const fetchTodos = async () => {
    try {
      const res = await fetch("/api/todos");
      const data = await res.json();
      if (Array.isArray(data)) {
        setTodos(data);
      }
    } catch (err) {
      console.error("Failed to fetch todos", err);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: newText.trim(),
          subject: newSubject,
          priority: newPriority,
          dueDate: newDueDate || undefined,
          reminderTime: newReminderTime || undefined
        }),
      });
      const data = await res.json();
      setTodos((prev) => [data, ...prev]);
      setNewText("");
      setNewDueDate("");
      setNewReminderTime("");
      setNewSubject("General");
      setNewPriority("MEDIUM");
    } catch (err) {
      console.error("Failed to add todo", err);
    }
  };

  const toggleTodo = async (id: number) => {
    try {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;
      const res = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          completed: !todo.completed,
          reminderTriggered: todo.completed ? false : todo.reminderTriggered
        }),
      });
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error("Failed to toggle todo", err);
    }
  };

  const markReminderAsTriggered = async (id: number) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderTriggered: true }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      }
    } catch (err) {
      console.error("Failed to update reminderTriggered flag", err);
    }
  };

  const resetAlarmTrigger = async (id: number) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderTriggered: false }),
      });
      if (res.ok) {
        const updated = await res.json();
        setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
      }
    } catch (err) {
      console.error("Failed to reset reminderTriggered flag", err);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      await fetch(`/api/todos/${id}`, { method: "DELETE" });
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Failed to delete todo", err);
    }
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === "PENDING") return !t.completed;
    if (filter === "COMPLETED") return t.completed;
    return true;
  });

  const alarmTodos = todos.filter((t) => !t.completed && !!t.reminderTime);

  const getSubjectColor = (sub?: string) => {
    switch (sub) {
      case "Physics":
        return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "Chemistry":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "Mathematics":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "Biology":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getPriorityColor = (prio?: string) => {
    switch (prio) {
      case "HIGH":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "MEDIUM":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "LOW":
        return "bg-slate-50 text-slate-500 border-slate-200";
      default:
        return "bg-slate-50 text-slate-400 border-slate-200";
    }
  };

  return (
    <div className="bg-white border border-emerald-100 p-6 rounded-3xl shadow-md space-y-5 h-full text-slate-800" id="todo-corner-card">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-emerald-950">To-Do</h3>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
          {todos.filter((t) => !t.completed).length} pending
        </span>
      </div>

      {/* Add Todo Form */}
      <form onSubmit={handleAddTodo} className="space-y-3 bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100/30">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="New custom study task..."
          className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-slate-800 text-sm focus:border-emerald-500 focus:outline-none placeholder:text-slate-400 font-sans"
          required
        />

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Subject</label>
            <select
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-700 text-xs focus:outline-none"
            >
              <option value="General">General</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Mathematics">Math</option>
              <option value="Biology">Biology</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Priority</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-700 text-xs focus:outline-none"
            >
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-bold">Due Date</label>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-700 text-xs focus:outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-[9px] font-mono text-emerald-600 uppercase tracking-widest mb-1.5 font-bold">Alarm Time ⏰</label>
            <input
              type="time"
              value={newReminderTime}
              onChange={(e) => setNewReminderTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-700 text-xs focus:outline-none font-mono focus:border-emerald-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center cursor-pointer shadow-md shadow-emerald-600/10"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Custom Task
        </button>
      </form>

      {/* Todo Filters */}
      <div className="flex bg-slate-100 p-1 rounded-xl text-xs border border-slate-200/50">
        {(["PENDING", "COMPLETED", "ALL"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setFilter(opt)}
            className={`flex-1 py-2 rounded-lg text-[10px] font-mono font-bold transition-all uppercase tracking-wider cursor-pointer ${
              filter === opt ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Todo list items */}
      <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
        {filteredTodos.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-mono text-xs border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-1.5 bg-slate-50/50">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            <span>No tasks in this filter</span>
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={`p-3 border rounded-2xl flex items-start justify-between transition-all group ${
                todo.completed
                  ? "bg-slate-50/50 border-slate-100 opacity-60"
                  : "bg-slate-50 border-slate-100/85 hover:bg-emerald-50/10 hover:border-emerald-200/50 shadow-sm"
              }`}
            >
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => toggleTodo(todo.id)}
                  className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-all shrink-0 cursor-pointer"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 fill-emerald-500/10" />
                  ) : (
                    <Circle className="w-4.5 h-4.5 text-slate-400 hover:text-slate-600" />
                  )}
                </button>

                <div className="space-y-1 min-w-0 flex-1">
                  <p className={`text-[13px] font-sans text-slate-700 leading-tight break-words ${todo.completed ? "line-through text-slate-400 font-mono" : "font-medium"}`}>
                    {todo.text}
                  </p>

                  <div className="flex flex-wrap items-center gap-1 pt-0.5">
                    {todo.subject && todo.subject !== "General" && (
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${getSubjectColor(todo.subject)}`}>
                        {todo.subject}
                      </span>
                    )}
                    {todo.priority && (
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${getPriorityColor(todo.priority)}`}>
                        {todo.priority}
                      </span>
                    )}
                    {todo.dueDate && (
                      <span className="text-[9px] font-mono font-medium text-slate-500 flex items-center bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                        <Calendar className="w-2.5 h-2.5 mr-1" />
                        {todo.dueDate}
                      </span>
                    )}
                    {todo.reminderTime && (
                      <span className="text-[9px] font-mono font-bold text-emerald-600 flex items-center bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded animate-pulse">
                        <Bell className="w-2.5 h-2.5 mr-1 text-emerald-500" />
                        Alarm {todo.reminderTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => deleteTodo(todo.id)}
                className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1 rounded transition opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                title="Delete Todo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Active Alarms & Reminders Section */}
      <div className="border-t border-slate-100 pt-4 space-y-2.5 text-slate-800">
        <div className="flex items-center space-x-1.5 text-emerald-800">
          <Bell className="w-4 h-4 text-emerald-600 animate-pulse" />
          <h4 className="font-display font-bold text-xs uppercase tracking-wider">Active Study Alarms</h4>
        </div>
        
        {alarmTodos.length === 0 ? (
          <div className="p-3 text-center text-slate-400 font-mono text-[10px] bg-slate-50 border border-slate-100 rounded-xl">
            No active study alarms set today.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
            {alarmTodos.map((todo) => (
              <div key={`alarm-${todo.id}`} className="flex items-center justify-between p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs gap-2">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <span className="text-[10px] font-mono font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded flex items-center shrink-0">
                    ⏰ {todo.reminderTime}
                  </span>
                  <span className="text-slate-700 font-medium truncate flex-1">{todo.text}</span>
                  {todo.reminderTriggered ? (
                    <span className="text-[9px] font-mono font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1 py-0.5 rounded uppercase shrink-0">
                      Rung 🔔
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded uppercase shrink-0">
                      Active
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  {todo.reminderTriggered && (
                    <button
                      type="button"
                      onClick={() => resetAlarmTrigger(todo.id)}
                      className="text-indigo-600 hover:text-indigo-700 font-mono font-bold text-[9px] cursor-pointer bg-white px-1.5 py-0.5 rounded border border-indigo-200 shadow-sm transition"
                      title="Reset alarm trigger"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => playAlarmSound()}
                    title="Test Sound"
                    className="text-emerald-600 hover:text-emerald-700 font-mono font-bold text-[9px] cursor-pointer bg-white px-1.5 py-0.5 rounded border border-emerald-200 shadow-sm transition"
                  >
                    Test Tone
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real-Time Alarm Interactive Overlay Dialog */}
      {activeAlarmTodo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative overflow-hidden">
            {/* Ping animation loops */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 relative z-10">
                  <span className="text-2xl animate-bounce">⏰</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-slate-800">
              <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600">Study Alarm Alert</h4>
              <h3 className="text-base font-display font-black leading-snug">{activeAlarmTodo.text}</h3>
              {activeAlarmTodo.subject && activeAlarmTodo.subject !== "General" && (
                <span className="inline-block text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">
                  {activeAlarmTodo.subject}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={async () => {
                  await toggleTodo(activeAlarmTodo.id);
                  setActiveAlarmTodo(null);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md"
              >
                Complete Task & Silence
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveAlarmTodo(null);
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Dismiss Alarm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
