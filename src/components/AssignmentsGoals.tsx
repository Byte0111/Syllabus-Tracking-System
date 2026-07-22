import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, AlertCircle, BookOpen, Bookmark, Calendar, ArrowRight, Star, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Assignment, Goal, Book, TimetableSlot } from "../types";

export default function AssignmentsGoals() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);

  // Add items state
  const [newAsgn, setNewAsgn] = useState({ title: "", deadline: "", subject: "Physics", priority: "HIGH" });
  const [newGoal, setNewGoal] = useState({ description: "", deadline: "" });
  const [newBook, setNewBook] = useState({ title: "", author: "", subject: "Physics", progress: 0, bookmark: "" });
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [newSlot, setNewSlot] = useState({ day: "Monday", timeSlot: "", subject: "", type: "Self Study" });
  const [isAddingSlot, setIsAddingSlot] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const r1 = await fetch("/api/assignments");
      const r2 = await fetch("/api/goals");
      const r3 = await fetch("/api/books");
      const r4 = await fetch("/api/timetable");
      setAssignments(await r1.json());
      setGoals(await r2.json());
      setBooks(await r3.json());
      setTimetable(await r4.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAsgn),
      });
      const data = await res.json();
      setAssignments((prev) => [data, ...prev]);
      setNewAsgn({ title: "", deadline: "", subject: "Physics", priority: "HIGH" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAssignment = async (id: number) => {
    try {
      await fetch(`/api/assignments/${id}`, { method: "DELETE" });
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGoal),
      });
      const data = await res.json();
      setGoals((prev) => [...prev, data]);
      setNewGoal({ description: "", deadline: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      await fetch(`/api/goals/${id}`, { method: "DELETE" });
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleGoal = async (id: number) => {
    try {
      const res = await fetch("/api/goals/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      setGoals((prev) => prev.map((g) => (g.id === id ? data : g)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBook),
      });
      const data = await res.json();
      setBooks((prev) => [...prev, data]);
      setNewBook({ title: "", author: "", subject: "Physics", progress: 0, bookmark: "" });
      setIsAddingBook(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBookProgress = async (id: number, progress: number, bookmark: string) => {
    try {
      const res = await fetch(`/api/books/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress, bookmark }),
      });
      const data = await res.json();
      setBooks((prev) => prev.map((b) => (b.id === id ? data : b)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBook = async (id: number) => {
    try {
      await fetch(`/api/books/${id}`, { method: "DELETE" });
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSlot),
      });
      const data = await res.json();
      setTimetable((prev) => [...prev, data]);
      setNewSlot({ day: "Monday", timeSlot: "", subject: "", type: "Self Study" });
      setIsAddingSlot(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSlot = async (id: number) => {
    try {
      await fetch(`/api/timetable/${id}`, { method: "DELETE" });
      setTimetable((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="assignments-goals-calendar">
      {/* Homework & Assignments Tracker */}
      <div className="space-y-6">
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-md space-y-4 text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-slate-800">Homework & Assignments</h3>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">Pending Deadlines</span>
          </div>

          <form onSubmit={handleAddAssignment} className="space-y-3">
            <input
              type="text"
              value={newAsgn.title}
              onChange={(e) => setNewAsgn({ ...newAsgn, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400 font-sans"
              placeholder="e.g. Waves formula sheet submission"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="date"
                value={newAsgn.deadline}
                onChange={(e) => setNewAsgn({ ...newAsgn, deadline: e.target.value })}
                className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-700 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                required
              />
              <select
                value={newAsgn.subject}
                onChange={(e) => setNewAsgn({ ...newAsgn, subject: e.target.value })}
                className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-700 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
              </select>
              <select
                value={newAsgn.priority}
                onChange={(e) => setNewAsgn({ ...newAsgn, priority: e.target.value })}
                className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-700 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-100"
            >
              <Plus className="w-4 h-4" />
              <span>Add Assignment</span>
            </button>
          </form>

          {/* Assignments list */}
          <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
            {assignments.length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-mono text-sm">No assignments logged</div>
            ) : (
              assignments.map((asgn) => (
                <div key={asgn.id} className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-xl flex items-center justify-between transition-all">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display font-bold text-slate-800 text-sm sm:text-base truncate">{asgn.title}</h4>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono mt-1.5">
                      <span className="text-indigo-600 font-bold uppercase tracking-wider">{asgn.subject}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        Due {asgn.deadline}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-3">
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded tracking-wider border ${
                        asgn.priority === "HIGH" 
                          ? "bg-rose-500/10 text-rose-600 border-rose-500/20" 
                          : "bg-slate-200/60 text-slate-600 border-slate-300/30"
                      }`}
                    >
                      {asgn.priority}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded tracking-wider border ${
                        asgn.status === "Completed" 
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}
                    >
                      {asgn.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAssignment(asgn.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Delete Homework"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* NCERT & References Book Tracker */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-md space-y-4 text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-slate-800 flex items-center">
              <BookOpen className="w-4.5 h-4.5 mr-2 text-indigo-600" />
              Study Books & NCERT Tracker
            </h3>
            <button
              onClick={() => setIsAddingBook(!isAddingBook)}
              className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Book</span>
            </button>
          </div>

          {isAddingBook && (
            <form onSubmit={handleAddBook} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3.5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">New Book Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Book Title (e.g., HC Verma Vol 1)"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-800 text-xs focus:border-indigo-500 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Author (e.g., H.C. Verma)"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-800 text-xs focus:border-indigo-500 focus:outline-none"
                />
                <select
                  value={newBook.subject}
                  onChange={(e) => setNewBook({ ...newBook, subject: e.target.value })}
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-800 text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
                <input
                  type="text"
                  placeholder="Starting Bookmark"
                  value={newBook.bookmark}
                  onChange={(e) => setNewBook({ ...newBook, bookmark: e.target.value })}
                  className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-800 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Create Book Entry
              </button>
            </form>
          )}

          <div className="space-y-3">
            {books.length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-mono text-sm">No books tracked yet. Click Add Book to start.</div>
            ) : (
              books.map((b) => (
                <div key={b.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl transition-all space-y-3 relative">
                  <button
                    onClick={() => handleDeleteBook(b.id)}
                    className="absolute top-3 right-3 p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Remove Book"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display font-bold text-slate-800 text-sm sm:text-base truncate pr-6">{b.title}</h4>
                      <span className="text-xs text-slate-500 font-mono mt-0.5 block">{b.author} • {b.subject}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 shrink-0 ml-3">
                      {b.progress}% read
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-300/30">
                    <div className="h-full rounded-full bg-indigo-500 transition-all duration-300" style={{ width: `${b.progress}%` }}></div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-200/50">
                    <div className="flex items-center text-xs text-slate-600 font-mono">
                      <Bookmark className="w-4 h-4 mr-1 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[150px]">
                        Bookmark: <strong className="text-slate-700 font-bold">{b.bookmark || "None"}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="%"
                        className="w-12 bg-white border border-slate-200 p-1 rounded text-center text-xs text-slate-800 font-mono focus:border-indigo-500 focus:outline-none"
                        value={b.progress}
                        onChange={(e) => {
                          const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                          handleUpdateBookProgress(b.id, val, b.bookmark);
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Bookmark..."
                        className="w-24 bg-white border border-slate-200 p-1 rounded text-xs text-slate-800 font-mono focus:border-indigo-500 focus:outline-none"
                        value={b.bookmark}
                        onChange={(e) => {
                          handleUpdateBookProgress(b.id, b.progress, e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Study Goals & Daily Timetable auto scheduler */}
      <div className="space-y-6">
        {/* Goals Tracker */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-md space-y-4 text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-slate-800">Daily Study Goals</h3>
            <span className="text-xs font-mono font-semibold text-slate-500">Milestone parameters</span>
          </div>

          <form onSubmit={handleAddGoal} className="flex gap-2">
            <input
              type="text"
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400 font-sans"
              placeholder="e.g. Finish current electricity past paper"
              required
            />
            <button
              type="submit"
              className="py-3 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all cursor-pointer shrink-0"
            >
              Add Goal
            </button>
          </form>

          <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
            {goals.length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-mono text-sm">No active study goals</div>
            ) : (
              goals.map((g) => (
                <div key={g.id} className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <button onClick={() => toggleGoal(g.id)} className="shrink-0 cursor-pointer text-slate-400 hover:text-slate-600 transition">
                      {g.completed ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                      ) : (
                        <Circle className="w-4.5 h-4.5 text-slate-400 hover:text-slate-600" />
                      )}
                    </button>
                    <span className={`text-sm sm:text-base font-semibold truncate ${g.completed ? "line-through text-slate-400 font-mono" : "text-slate-700"}`}>{g.description}</span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0 ml-3">
                    <span className="text-xs font-mono font-semibold text-slate-500">{g.deadline ? `By ${g.deadline}` : "Today"}</span>
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Timetable schedule module */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-md space-y-4 text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-slate-800 flex items-center">
              Daily Schedule Timetable
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddingSlot(!isAddingSlot)}
                className="text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slot</span>
              </button>
              <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 inline-flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                Auto Scheduler
              </span>
            </div>
          </div>

          {isAddingSlot && (
            <form onSubmit={handleAddSlot} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3.5">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">New Schedule Entry</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Day of Week</label>
                  <select
                    value={newSlot.day}
                    onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-800 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Time Slot (e.g., 08:00 - 09:30)</label>
                  <input
                    type="text"
                    placeholder="e.g. 08:00 - 09:30"
                    value={newSlot.timeSlot}
                    onChange={(e) => setNewSlot({ ...newSlot, timeSlot: e.target.value })}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-800 text-xs focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Subject / Activity</label>
                  <input
                    type="text"
                    placeholder="e.g. Physics Revision"
                    value={newSlot.subject}
                    onChange={(e) => setNewSlot({ ...newSlot, subject: e.target.value })}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-800 text-xs focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Type</label>
                  <select
                    value={newSlot.type}
                    onChange={(e) => setNewSlot({ ...newSlot, type: e.target.value })}
                    className="w-full bg-white border border-slate-200 p-2.5 rounded-xl text-slate-800 text-xs focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Self Study">Self Study</option>
                    <option value="Coaching Class">Coaching Class</option>
                    <option value="Mock Practice">Mock Practice</option>
                    <option value="School Class">School Class</option>
                    <option value="Rest & Play">Rest & Play</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Create Schedule Slot
              </button>
            </form>
          )}

          <div className="space-y-3">
            {timetable.length === 0 ? (
              <div className="py-8 text-center text-slate-400 font-mono text-sm">No schedule slots registered. Click Add Slot to start.</div>
            ) : (
              timetable.map((slot) => (
                <div key={slot.id} className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl flex items-center justify-between relative group">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-black text-indigo-600 uppercase tracking-wider">{slot.day}</span>
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="text-slate-800 font-display font-bold text-sm sm:text-base truncate">{slot.subject}</span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono font-medium">Time-frame: {slot.timeSlot}</div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-3">
                    <span className="text-xs font-mono font-bold text-slate-600 bg-slate-200/60 px-2.5 py-1 rounded-xl border border-slate-300/35">
                      {slot.type}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Delete Slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
