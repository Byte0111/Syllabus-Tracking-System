import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen, 
  RefreshCw, 
  Layers, 
  Plus, 
  PlusCircle, 
  CheckSquare, 
  ChevronDown, 
  ChevronUp,
  Trash2
} from "lucide-react";
import { SyllabusChapter } from "../types";

interface ChapterRowProps {
  item: SyllabusChapter;
  toggleComplete: (id: number, currentStatus: string) => Promise<void>;
  toggleSubtopic: (id: number, subtopic: string, customSubtopicId?: string) => Promise<void>;
  onAddSubtopic: (id: number, label: string) => Promise<void>;
  onDeleteSubtopic: (id: number, customSubtopicId: string) => Promise<void>;
  onToggleExcludeSubtopic: (id: number, subtopic: string) => Promise<void>;
  onDeleteChapter: (id: number) => Promise<void>;
}

const CoachingChapterRow: React.FC<ChapterRowProps> = ({ 
  item, 
  toggleComplete, 
  toggleSubtopic, 
  onAddSubtopic,
  onDeleteSubtopic,
  onToggleExcludeSubtopic,
  onDeleteChapter
}) => {
  const [newSubtopicText, setNewSubtopicText] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const subtopicItems = [
    { key: "hasLearned", label: "Learned / Covered", desc: "Chapter fully studied", letter: "L" },
    { key: "hasRevision", label: "Revised", desc: "1st revision done", letter: "R" },
    { key: "hasPyqs", label: "PYQs Done", desc: "Previous year questions", letter: "P" },
    { key: "hasNotes", label: "Notes Made", desc: "Written / digital notes", letter: "N" },
    { key: "hasTest", label: "Test Given", desc: "Chapter test attempted", letter: "T" },
    { key: "hasShortNotes", label: "Short Notes / Flashcards", desc: "Quick revision ready", letter: "S" }
  ];

  const excluded = item.excludedCheckpoints || [];
  const activeSubtopicItems = subtopicItems.filter(s => !excluded.includes(s.key));
  const excludedSubtopicItems = subtopicItems.filter(s => excluded.includes(s.key));

  const isCompleted = item.status === "COMPLETED";

  // Calculate checked / total
  let checkedCount = 0;
  let totalCount = activeSubtopicItems.length;
  activeSubtopicItems.forEach(s => {
    if ((item as any)[s.key]) checkedCount++;
  });
  if (item.customSubtopics) {
    totalCount += item.customSubtopics.length;
    item.customSubtopics.forEach(s => {
      if (s.checked) checkedCount++;
    });
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtopicText.trim()) return;
    onAddSubtopic(item.id, newSubtopicText.trim());
    setNewSubtopicText("");
    setShowAddForm(false);
  };

  return (
    <div 
      className={`border-b border-white/[0.04] transition-all duration-300 ${
        isCompleted 
          ? "bg-pink-950/10 border-l-4 border-pink-500" 
          : item.completionPercentage > 0
          ? "bg-slate-900/40 border-l-4 border-pink-400/30"
          : "border-l-4 border-transparent hover:bg-white/[0.01]"
      }`}
    >
      {/* Chapter summary row */}
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <button
              onClick={() => toggleComplete(item.id, item.status)}
              className="mt-0.5 transition-all hover:scale-110 active:scale-95 cursor-pointer text-slate-500 hover:text-pink-400 shrink-0"
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-pink-500 fill-pink-500/10 filter drop-shadow-[0_0_4px_rgba(236,72,153,0.3)]" />
              ) : (
                <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
              )}
            </button>

            <div className="space-y-1 flex-1 min-w-0 text-left">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono font-extrabold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded tracking-wider border border-pink-500/20">
                  {item.subject}
                </span>
                <span className="text-[11px] font-medium text-slate-400 max-w-[150px] truncate">{item.unit}</span>
                {item.classLevel && (
                  <span className="text-[9px] font-mono text-slate-500">Class {item.classLevel}</span>
                )}
              </div>

              <h5 className={`font-display font-semibold text-sm leading-tight ${isCompleted ? "text-slate-400 line-through decoration-slate-600" : "text-white"}`}>
                {item.chapter}
              </h5>

              {/* Fractional indicators */}
              <div className="flex items-center space-x-2 pt-1">
                <div className="flex space-x-1">
                  {activeSubtopicItems.map((sub) => {
                    const checked = !!(item as any)[sub.key];
                    return (
                      <span
                        key={sub.key}
                        title={sub.label}
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-extrabold transition-all ${
                          checked
                            ? "bg-white text-slate-950 shadow-[0_0_8px_rgba(255,255,255,0.8)] border border-white"
                            : "bg-white/20 border border-white/35 text-white"
                        }`}
                      >
                        {sub.letter}
                      </span>
                    );
                  })}
                </div>
                <span className="text-xs font-mono text-white font-bold bg-slate-950/40 px-1.5 py-0.5 rounded border border-white/5">
                  {checkedCount}/{totalCount} Completed ({item.completionPercentage}%)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border shrink-0 ${
                  isCompleted
                    ? "bg-pink-500/15 text-pink-400 border-pink-500/35"
                    : item.status === "IN_PROGRESS"
                    ? "bg-pink-500/5 text-pink-300 border-pink-500/20"
                    : "bg-slate-900/60 text-slate-500 border-white/[0.04]"
                }`}
              >
                {item.status.replace("_", " ")}
              </span>

              {confirmDelete ? (
                <div className="flex items-center gap-1 bg-rose-950/80 p-1 rounded-lg border border-rose-500/30 animate-fade-in z-10 shadow-lg">
                  <button
                    onClick={() => {
                      onDeleteChapter(item.id);
                      setConfirmDelete(false);
                    }}
                    className="text-[9px] font-mono font-bold uppercase text-white bg-rose-600 hover:bg-rose-500 px-2 py-0.5 rounded cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-[9px] font-mono text-slate-400 hover:text-white px-1 py-0.5 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                  title="Delete Chapter"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition flex items-center gap-1 text-[11px] font-mono"
            >
              {isExpanded ? (
                <>
                  <span>Hide Details</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Show Checkpoints ({checkedCount})</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-slate-800/60 h-1.5 rounded-full overflow-hidden border border-slate-700/40">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted 
                ? "bg-gradient-to-r from-emerald-400 to-green-500" 
                : "bg-gradient-to-r from-emerald-500 to-green-400"
            }`}
            style={{ width: `${item.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Expanded checkable subtopics and logs (White & Pink Aesthetic) */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 animate-fade-in bg-slate-950/30">
          <div className="bg-white border border-pink-100 rounded-xl p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-pink-50/50 pb-2">
              <span className="text-xs font-sans font-extrabold uppercase tracking-wider text-pink-800 flex items-center gap-1.5 bg-pink-50/70 px-3 py-1 rounded-md border border-pink-100/50">
                <CheckSquare className="w-3.5 h-3.5 text-pink-600" />
                Coaching Checkpoints
              </span>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-[10px] font-mono font-bold uppercase tracking-wider text-pink-600 hover:text-pink-700 transition flex items-center gap-1 cursor-pointer bg-pink-50 px-2 py-1 rounded-md"
              >
                <Plus className="w-3 h-3" /> Add custom topic
              </button>
            </div>

            {/* Dynamic Custom Subtopic Form */}
            {showAddForm && (
              <form onSubmit={handleAddSubmit} className="flex gap-2 bg-pink-50/50 p-2 rounded-lg border border-pink-200">
                <input
                  type="text"
                  value={newSubtopicText}
                  onChange={(e) => setNewSubtopicText(e.target.value)}
                  className="flex-1 bg-white border border-pink-200 text-xs px-2.5 py-1.5 rounded-md text-slate-800 focus:outline-none focus:border-pink-500 font-sans placeholder:text-slate-400"
                  placeholder="e.g. Practice sheet completed"
                  required
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-pink-600 hover:bg-pink-500 text-white px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition cursor-pointer"
                >
                  Add
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 gap-1.5">
              {/* Standard Checkable subtopics */}
              {activeSubtopicItems.map((sub) => {
                const checked = !!(item as any)[sub.key];
                return (
                  <div
                    key={sub.key}
                    onClick={() => toggleSubtopic(item.id, sub.key)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                      checked
                        ? "bg-pink-50 text-pink-700 border-pink-200/60 hover:bg-pink-100/60 shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100/50"
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${checked ? "bg-pink-500" : "bg-slate-300"}`}></span>
                      <div className="flex flex-col min-w-0 text-left">
                        <span className={`text-[11px] font-bold leading-tight ${checked ? "text-pink-800" : "text-slate-800"}`}>{sub.label}</span>
                        <span className="text-[9px] font-mono text-slate-400 truncate">{sub.desc}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleExcludeSubtopic(item.id, sub.key);
                        }}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Checkpoint"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${checked ? "border-pink-500 bg-pink-500 text-white" : "border-slate-300 bg-white"}`}>
                        {checked && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Render Custom subtopics */}
              {item.customSubtopics && item.customSubtopics.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => toggleSubtopic(item.id, "", sub.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                    sub.checked
                      ? "bg-pink-50 text-pink-700 border-pink-200/60 hover:bg-pink-100/60 shadow-sm"
                      : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100/50"
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${sub.checked ? "bg-pink-500" : "bg-slate-300"}`}></span>
                    <div className="flex flex-col min-w-0 text-left">
                      <span className={`text-[11px] font-bold leading-tight ${sub.checked ? "text-pink-800" : "text-slate-800"}`}>{sub.label}</span>
                      <span className="text-[9px] font-mono text-slate-400">Custom checkpoint</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSubtopic(item.id, sub.id);
                      }}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded hover:bg-rose-50 transition cursor-pointer"
                      title="Delete Custom Checkpoint"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${sub.checked ? "border-pink-500 bg-pink-500 text-white" : "border-slate-300 bg-white"}`}>
                      {sub.checked && <span className="w-1.5 h-1.5 bg-white rounded-full"></span>}
                    </div>
                  </div>
                </div>
              ))}

              {/* Excluded default checkpoints section */}
              {excludedSubtopicItems.length > 0 && (
                <div className="mt-2.5 p-2 bg-slate-50 border border-slate-100 rounded-lg space-y-1 text-left">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Deleted Default Checkpoints</span>
                  <div className="flex flex-wrap gap-1">
                    {excludedSubtopicItems.map(sub => (
                      <div key={sub.key} className="flex items-center gap-1.5 bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] text-slate-600">
                        <span>{sub.label}</span>
                        <button
                          onClick={() => onToggleExcludeSubtopic(item.id, sub.key)}
                          className="text-pink-600 hover:text-pink-700 font-mono font-bold cursor-pointer hover:underline text-[9px]"
                        >
                          Restore
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function OnlineCourses() {
  const [syllabus, setSyllabus] = useState<SyllabusChapter[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeSubject, setActiveSubject] = useState<string>("All");

  // Form states for adding coaching chapter
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newSubject, setNewSubject] = useState("Physics");
  const [newUnit, setNewUnit] = useState("");
  const [newChapter, setNewChapter] = useState("");
  const [newEstHours, setNewEstHours] = useState(10);
  const [newClassLevel, setNewClassLevel] = useState<"11" | "12">("11");

  useEffect(() => {
    fetchSyllabus();
  }, []);

  const fetchSyllabus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/syllabus");
      const data = await res.json();
      setSyllabus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleComplete = async (id: number, currentStatus: string) => {
    try {
      const isCompleted = currentStatus === "COMPLETED";
      const res = await fetch("/api/syllabus/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: !isCompleted }),
      });
      const updated = await res.json();
      setSyllabus((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSubtopic = async (id: number, subtopic: string, customSubtopicId?: string) => {
    try {
      const res = await fetch("/api/syllabus/toggle-subtopic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, subtopic, customSubtopicId }),
      });
      const updated = await res.json();
      setSyllabus((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (err) {
      console.error(err);
    }
  };

  const onAddSubtopic = async (chapterId: number, label: string) => {
    try {
      const res = await fetch("/api/syllabus/add-subtopic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: chapterId, label }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSyllabus((prev) => prev.map((item) => (item.id === chapterId ? updated : item)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onDeleteSubtopic = async (chapterId: number, customSubtopicId: string) => {
    try {
      const res = await fetch("/api/syllabus/delete-subtopic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: chapterId, customSubtopicId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSyllabus((prev) => prev.map((item) => (item.id === chapterId ? updated : item)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onToggleExcludeSubtopic = async (chapterId: number, subtopic: string) => {
    try {
      const res = await fetch("/api/syllabus/toggle-exclude-subtopic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: chapterId, subtopic }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSyllabus((prev) => prev.map((item) => (item.id === chapterId ? updated : item)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnit.trim() || !newChapter.trim()) return;
    try {
      const res = await fetch("/api/syllabus/add-chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newSubject,
          unit: newUnit.trim(),
          chapter: newChapter.trim(),
          classLevel: newClassLevel,
          courseType: "ONLINE",
          estimatedTimeHours: Number(newEstHours) || 10
        })
      });
      if (res.ok) {
        const added = await res.json();
        setSyllabus(prev => [...prev, added]);
        setNewUnit("");
        setNewChapter("");
        setShowAddChapter(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const onDeleteChapter = async (id: number) => {
    try {
      const res = await fetch("/api/syllabus/delete-chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setSyllabus(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter to Coaching/Online Courses
  const onlineSyllabus = syllabus.filter(
    (s) => s.courseType === "ONLINE" && (activeSubject === "All" || s.subject === activeSubject)
  );

  const subjects = ["All", "Physics", "Chemistry", "Mathematics", "Biology"];

  return (
    <div className="bg-[#0b0f19]/60 backdrop-blur-md border border-white/[0.06] rounded-3xl shadow-xl overflow-hidden flex flex-col" id="online-coaching-sidebar-card">
      <div className="px-5 py-4 bg-pink-500/5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="text-left">
          <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse"></span>
            Online Courses (PW, Allen)
          </h3>
          <p className="text-xs text-slate-400 mt-1">Coaching-level checklists & competitive preparation</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddChapter(!showAddChapter)}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-950 rounded-xl text-sm font-sans font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 text-slate-950" /> Add Chapter
          </button>
          <span className="text-xs font-mono font-bold text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-lg border border-pink-500/15">
            {onlineSyllabus.filter(s => s.status === "COMPLETED").length} / {onlineSyllabus.length} Completed
          </span>
        </div>
      </div>

      {/* Expandable Add Chapter Form */}
      {showAddChapter && (
        <form onSubmit={handleAddChapter} className="p-5 bg-white border-b border-slate-200 space-y-4 animate-fade-in text-left text-slate-900 shadow-inner">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">Subject</label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-lg text-slate-900 text-sm focus:border-green-500 focus:outline-none"
              >
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Biology">Biology</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">Class Level</label>
              <select
                value={newClassLevel}
                onChange={(e) => setNewClassLevel(e.target.value as "11" | "12")}
                className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-lg text-slate-900 text-sm focus:border-green-500 focus:outline-none"
              >
                <option value="11">Class 11</option>
                <option value="12">Class 12</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">Unit Name</label>
            <input
              type="text"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-lg text-slate-900 text-sm focus:border-green-500 focus:outline-none"
              placeholder="e.g. Kinematics or Organic Chemistry"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">Chapter Name</label>
            <input
              type="text"
              value={newChapter}
              onChange={(e) => setNewChapter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-lg text-slate-900 text-sm focus:border-green-500 focus:outline-none"
              placeholder="e.g. Projectile Motion"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider">Est. Study Hours</label>
            <input
              type="number"
              value={newEstHours}
              onChange={(e) => setNewEstHours(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-lg text-slate-900 text-sm focus:border-green-500 focus:outline-none font-mono"
              placeholder="10"
              min="1"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setShowAddChapter(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg uppercase tracking-wider font-mono font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm rounded-lg uppercase tracking-wider font-mono font-bold transition-all shadow-md"
            >
              Save Chapter
            </button>
          </div>
        </form>
      )}

      {/* Mini Subject Filter */}
      <div className="px-5 py-3 border-b border-white/[0.03] flex gap-1.5 overflow-x-auto scrollbar-none whitespace-nowrap bg-slate-950/25">
        {subjects.map((sub) => (
          <button
            key={sub}
            onClick={() => setActiveSubject(sub)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer uppercase tracking-wider ${
              activeSubject === sub 
                ? "bg-pink-600 text-white shadow-sm border border-pink-500/30" 
                : "bg-white/[0.02] text-slate-400 hover:bg-white/[0.05] border border-white/[0.03]"
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 font-mono animate-pulse">
          Loading online coaching courses...
        </div>
      ) : (
        <div className="divide-y divide-white/[0.03] max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {onlineSyllabus.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 font-mono">No online chapters listed. Feel free to add some!</div>
          ) : (
            onlineSyllabus.map((item) => (
              <CoachingChapterRow 
                key={item.id} 
                item={item} 
                toggleComplete={toggleComplete} 
                toggleSubtopic={toggleSubtopic} 
                onAddSubtopic={onAddSubtopic}
                onDeleteSubtopic={onDeleteSubtopic}
                onToggleExcludeSubtopic={onToggleExcludeSubtopic}
                onDeleteChapter={onDeleteChapter}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
