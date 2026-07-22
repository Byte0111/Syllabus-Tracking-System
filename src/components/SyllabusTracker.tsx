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
  ArrowLeft, 
  Trash2, 
  ChevronRight 
} from "lucide-react";
import { SyllabusChapter } from "../types";

interface ChapterRowProps {
  item: SyllabusChapter;
  toggleComplete: (id: number, currentStatus: string) => Promise<void>;
  onSelectChapter: (id: number) => void;
}

const ChapterRow: React.FC<ChapterRowProps> = ({ item, toggleComplete, onSelectChapter }) => {
  const subtopicItems = [
    { key: "hasLearned", label: "Learned / Covered", desc: "Chapter fully studied", letter: "L" },
    { key: "hasRevision", label: "Revised", desc: "1st revision done", letter: "R" },
    { key: "hasPyqs", label: "PYQs Done", desc: "Previous year questions", letter: "P" },
    { key: "hasNotes", label: "Notes Made", desc: "Written / digital notes", letter: "N" },
    { key: "hasTest", label: "Test Given", desc: "Chapter test attempted", letter: "T" },
    { key: "hasShortNotes", label: "Short Notes / Flashcards", desc: "Quick revision ready", letter: "S" }
  ];

  const isCompleted = item.status === "COMPLETED";

  // Calculate checked / total
  let checkedCount = 0;
  let totalCount = 6;
  subtopicItems.forEach(s => {
    if ((item as any)[s.key]) checkedCount++;
  });
  if (item.customSubtopics) {
    totalCount += item.customSubtopics.length;
    item.customSubtopics.forEach(s => {
      if (s.checked) checkedCount++;
    });
  }

  return (
    <div 
      onClick={() => onSelectChapter(item.id)}
      className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 cursor-pointer border-b border-pink-100/30 ${
        isCompleted 
          ? "bg-emerald-50/30 border-l-4 border-emerald-500 hover:bg-emerald-50/50" 
          : item.completionPercentage > 0
          ? "bg-pink-50/20 border-l-4 border-pink-500/30 hover:bg-pink-50/40"
          : "border-l-4 border-transparent hover:bg-slate-50/50"
      }`}
    >
      <div className="flex items-start space-x-3 flex-1 min-w-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleComplete(item.id, item.status);
          }}
          className="mt-1 transition-all hover:scale-110 active:scale-95 cursor-pointer text-slate-500 hover:text-emerald-400"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/10 filter drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]" />
          ) : (
            <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
          )}
        </button>

        <div className="space-y-1.5 flex-1 min-w-0 text-left">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/15 px-2.5 py-0.5 rounded tracking-wider border border-indigo-500/20">
              {item.subject}
            </span>
            {item.classLevel && (
              <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded tracking-wider border border-amber-500/20">
                Class {item.classLevel}
              </span>
            )}
            <span className="text-xs font-semibold text-slate-300 max-w-[150px] truncate">{item.unit}</span>
          </div>

          <h5 className={`font-display font-semibold text-sm sm:text-base leading-snug transition-all ${isCompleted ? "text-slate-300 line-through decoration-slate-600" : "text-white"}`}>
            {item.chapter}
          </h5>

          {/* Quick Indicator L R P N T S Badges with fractional completion */}
          <div className="flex items-center space-x-2 pt-1">
            <div className="flex space-x-0.5">
              {subtopicItems.map((sub) => {
                const checked = !!(item as any)[sub.key];
                return (
                  <span
                    key={sub.key}
                    title={sub.label}
                    className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-extrabold transition-all ${
                      checked
                        ? "bg-pink-500 text-white shadow-[0_0_6px_rgba(236,72,153,0.3)]"
                        : "bg-slate-100 border border-slate-200 text-slate-400"
                    }`}
                  >
                    {sub.letter}
                  </span>
                );
              })}
            </div>
            <span className="text-[9px] font-mono text-slate-500 font-bold ml-1 shrink-0">
              {checkedCount}/{totalCount}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar & Status Pill */}
      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
        <div className="flex flex-col items-end gap-2 min-w-[110px] text-right">
          <div className="w-full">
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-1 font-mono uppercase tracking-wider">
              <span>Progress</span>
              <span className={item.completionPercentage === 100 ? "text-pink-400 font-black text-sm" : "text-pink-300 font-black text-xs"}>
                {item.completionPercentage}%
              </span>
            </div>
            {/* Beautiful non-black container with vibrant pink filling progress bar */}
            <div className="w-full bg-pink-100/40 h-4.5 rounded-full overflow-hidden border border-pink-200/20 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted 
                    ? "bg-gradient-to-r from-pink-400 via-pink-500 to-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]" 
                    : item.completionPercentage > 0 
                    ? "bg-gradient-to-r from-pink-500 to-rose-400 shadow-[0_0_6px_rgba(236,72,153,0.3)]" 
                    : "bg-transparent"
                }`}
                style={{ width: `${item.completionPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-widest border shrink-0 ${
                isCompleted
                  ? "bg-pink-500/15 text-pink-400 border-pink-500/35 shadow-[0_0_6px_rgba(236,72,153,0.1)]"
                  : item.status === "IN_PROGRESS"
                  ? "bg-pink-500/5 text-pink-300 border-pink-500/20"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              }`}
            >
              {item.status.replace("_", " ")}
            </span>
          </div>
        </div>

        <div className="text-slate-500 hover:text-white p-1 rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

interface ChapterCheckpointsDetailProps {
  item: SyllabusChapter;
  toggleComplete: (id: number, currentStatus: string) => Promise<void>;
  toggleSubtopic: (id: number, subtopic: string, customSubtopicId?: string) => Promise<void>;
  onAddSubtopic: (chapterId: number, label: string) => Promise<void>;
  onDeleteSubtopic: (chapterId: number, customSubtopicId: string) => Promise<void>;
  onToggleExcludeSubtopic: (chapterId: number, subtopic: string) => Promise<void>;
  onResetCheckpoints: (chapterId: number) => Promise<void>;
  onBack: () => void;
}

const ChapterCheckpointsDetail: React.FC<ChapterCheckpointsDetailProps> = ({
  item,
  toggleComplete,
  toggleSubtopic,
  onAddSubtopic,
  onDeleteSubtopic,
  onToggleExcludeSubtopic,
  onResetCheckpoints,
  onBack
}) => {
  const [newSubtopicText, setNewSubtopicText] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

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
    <div className="bg-[#0b0f19]/80 border border-white/[0.06] rounded-3xl p-6 shadow-2xl animate-fade-in space-y-6">
      {/* Detail Page Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-sm font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Course Modules
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-extrabold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
            {item.subject}
          </span>
          {item.classLevel && (
            <span className="text-xs font-mono font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              Class {item.classLevel}
            </span>
          )}
          <span className="text-xs font-mono text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-lg border border-pink-500/20">
            {item.unit}
          </span>
        </div>
      </div>

      {/* Main Chapter Focus Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white border border-pink-100/80 p-5 rounded-2xl shadow-sm">
        <div className="space-y-1 text-left">
          <span className="text-[10px] font-mono text-pink-500 font-bold tracking-widest uppercase">Currently Managing</span>
          <h2 className="text-lg sm:text-xl font-display font-bold text-slate-800 leading-tight">
            {item.chapter}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Est. Study Time: <span className="font-mono text-slate-700 font-bold">{item.estimatedTimeHours} hrs</span> • Spent: <span className="font-mono text-slate-700 font-bold">{item.timeSpentHours} hrs</span>
          </p>
        </div>

        {/* Big visual progress circle / badge */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Overall Completion</span>
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-3xl font-mono font-extrabold text-pink-400">{item.completionPercentage}%</span>
              <span className="text-xs sm:text-sm text-slate-500">({checkedCount}/{totalCount})</span>
            </div>
          </div>

          <button
            onClick={() => toggleComplete(item.id, item.status)}
            className={`px-5 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer border ${
              isCompleted 
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25" 
                : "bg-pink-600 hover:bg-pink-500 text-white border-transparent shadow-[0_0_12px_rgba(236,72,153,0.3)]"
            }`}
          >
            {isCompleted ? "Completed" : "Mark Completed"}
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-pink-100/50 h-5 rounded-full overflow-hidden border border-pink-200/40 shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isCompleted 
              ? "bg-gradient-to-r from-pink-400 via-pink-500 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.6)]" 
              : item.completionPercentage > 0 
              ? "bg-gradient-to-r from-pink-500 to-rose-400 shadow-[0_0_8px_rgba(236,72,153,0.4)]" 
              : "bg-transparent"
          }`}
          style={{ width: `${item.completionPercentage}%` }}
        ></div>
      </div>

      {/* Checklist section styled beautifully */}
      <div className="bg-white border border-pink-100/80 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs sm:text-sm font-sans font-extrabold uppercase tracking-wider text-pink-800 flex items-center gap-2 bg-pink-50/75 px-3.5 py-1.5 rounded-xl border border-pink-100/50 mr-auto">
            <CheckSquare className="w-4.5 h-4.5 text-pink-600" />
            Standard NCERT Board Checkpoint Matrix
          </span>
          <div className="flex items-center gap-2">
            {confirmReset ? (
              <div className="flex items-center gap-1.5 bg-rose-50 p-1 rounded-xl border border-rose-200 animate-fade-in">
                <button
                  onClick={() => {
                    onResetCheckpoints(item.id);
                    setConfirmReset(false);
                  }}
                  className="text-xs font-mono font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-xl shadow-sm"
                >
                  Confirm Reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="text-xs font-mono font-bold uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="text-xs font-mono font-bold uppercase tracking-wider text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer bg-rose-50 hover:bg-rose-100 border border-rose-200/50 px-3.5 py-2 rounded-xl"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear / Delete All
              </button>
            )}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-mono font-bold uppercase tracking-wider text-pink-600 hover:text-pink-700 transition-colors flex items-center gap-1.5 cursor-pointer bg-pink-50 hover:bg-pink-100 border border-pink-200/50 px-3.5 py-2 rounded-xl"
            >
              <Plus className="w-3.5 h-3.5" /> Add dynamic checkpoint
            </button>
          </div>
        </div>

        {/* Add dynamic checkpoint form */}
        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="flex gap-2 animate-fade-in bg-pink-50/50 p-2.5 rounded-xl border border-pink-200">
            <input
              type="text"
              value={newSubtopicText}
              onChange={(e) => setNewSubtopicText(e.target.value)}
              className="flex-1 bg-white border border-pink-200 text-sm px-3.5 py-2.5 rounded-lg text-slate-800 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-400 font-sans placeholder:text-slate-400"
              placeholder="e.g. Practiced previous year school board test papers"
              required
              autoFocus
            />
            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-500 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Add
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Render active standard checkable subtopics */}
          {activeSubtopicItems.map((sub) => {
            const checked = !!(item as any)[sub.key];
            return (
              <div
                key={sub.key}
                onClick={() => toggleSubtopic(item.id, sub.key)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group ${
                  checked
                    ? "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100/80 shadow-[0_2px_10px_rgba(244,63,94,0.06)]"
                    : "bg-slate-50 text-slate-700 border-slate-100/80 hover:bg-slate-100/80 shadow-sm"
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full ${checked ? "bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]" : "bg-slate-300"}`}></span>
                  <div className="flex flex-col min-w-0 text-left">
                    <span className={`text-xs sm:text-sm font-bold leading-tight ${checked ? "text-pink-800 font-extrabold" : "text-slate-800"}`}>{sub.label}</span>
                    <span className={`text-[10px] sm:text-xs font-mono ${checked ? "text-pink-600/80" : "text-slate-500"}`}>{sub.desc}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pl-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleExcludeSubtopic(item.id, sub.key);
                    }}
                    className="text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50 transition cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Delete Checkpoint"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center transition-all ${checked ? "border-pink-500 bg-pink-500 text-white shadow-[0_0_6px_rgba(236,72,153,0.3)]" : "border-slate-300 bg-white"}`}>
                    {checked && <span className="w-2.5 h-2.5 bg-white rounded-full"></span>}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Render custom subtopics with deletion buttons! */}
          {item.customSubtopics && item.customSubtopics.map((sub) => (
            <div
              key={sub.id}
              onClick={() => toggleSubtopic(item.id, "", sub.id)}
              className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100/80 shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full ${sub.checked ? "bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]" : "bg-slate-300"}`}></span>
                <div className="flex flex-col min-w-0 text-left">
                  <span className={`text-xs sm:text-sm font-bold leading-tight ${sub.checked ? "text-pink-800 font-extrabold" : "text-slate-800"}`}>{sub.label}</span>
                  <span className={`text-[10px] sm:text-xs font-mono ${sub.checked ? "text-pink-600/80" : "text-slate-500"}`}>Custom Checkpoint</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 pl-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSubtopic(item.id, sub.id);
                  }}
                  className="text-slate-400 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                  title="Delete Custom Checkpoint"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center transition-all ${sub.checked ? "border-pink-500 bg-pink-500 text-white shadow-[0_0_6px_rgba(236,72,153,0.3)]" : "border-slate-300 bg-white"}`}>
                  {sub.checked && <span className="w-2.5 h-2.5 bg-white rounded-full"></span>}
                </div>
              </div>
            </div>
          ))}

          {/* Inline placeholder to add subtopic quickly */}
          <div
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-between p-4 rounded-xl border border-dashed border-pink-300 bg-pink-50/50 hover:bg-pink-100/50 text-pink-600 transition-all cursor-pointer group"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <PlusCircle className="w-5.5 h-5.5 text-pink-500 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-xs sm:text-sm font-bold leading-tight text-pink-700">Add dynamic checkpoint</span>
                <span className="text-[10px] sm:text-xs text-pink-500/80 font-mono">Create custom subtopic objective</span>
              </div>
            </div>
          </div>

          {/* Render excluded subtopics if there are any */}
          {excludedSubtopicItems.length > 0 && (
            <div className="col-span-1 md:col-span-2 mt-4 bg-slate-900/40 p-4 rounded-2xl border border-white/5 space-y-2 text-left">
              <h5 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Deleted Default Checkpoints</h5>
              <div className="flex flex-wrap gap-2">
                {excludedSubtopicItems.map(sub => (
                  <div key={sub.key} className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-white/5 text-slate-300 text-xs">
                    <span className="font-sans font-medium">{sub.label}</span>
                    <button
                      onClick={() => onToggleExcludeSubtopic(item.id, sub.key)}
                      className="text-pink-400 hover:text-pink-300 text-[10px] font-mono font-bold cursor-pointer hover:underline"
                    >
                      [Restore]
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function SyllabusTracker() {
  const [syllabus, setSyllabus] = useState<SyllabusChapter[]>(() => {
    try {
      const saved = localStorage.getItem("student_syllabus_cache");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [activeSubject, setActiveSubject] = useState<string>("All");
  const [activeClass, setActiveClass] = useState<"All" | "11" | "12">("All");
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);

  const selectedChapter = syllabus.find((s) => s.id === selectedChapterId) || null;

  // Local helper to calculate chapter progress optimistically
  const calculateLocalChapterProgress = (chapter: SyllabusChapter) => {
    let checkedCount = 0;
    let totalCount = 0;
    const excluded = chapter.excludedCheckpoints || [];

    const subtopicKeys = ["hasLearned", "hasRevision", "hasPyqs", "hasNotes", "hasTest", "hasShortNotes"];
    subtopicKeys.forEach((key) => {
      if (!excluded.includes(key)) {
        totalCount++;
        if ((chapter as any)[key]) checkedCount++;
      }
    });

    if (chapter.customSubtopics) {
      totalCount += chapter.customSubtopics.length;
      chapter.customSubtopics.forEach((sub) => {
        if (sub.checked) checkedCount++;
      });
    }

    const percentage = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
    chapter.completionPercentage = percentage;
    if (percentage === 100) {
      chapter.status = "COMPLETED";
      chapter.revisionCount = Math.max(chapter.revisionCount || 0, 1);
    } else if (percentage > 0) {
      chapter.status = "IN_PROGRESS";
    } else {
      chapter.status = "NOT_STARTED";
    }
  };

  const onDeleteSubtopic = async (chapterId: number, customSubtopicId: string) => {
    // 1. Optimistic Update
    setSyllabus((prev) =>
      prev.map((item) => {
        if (item.id !== chapterId) return item;
        const copy = JSON.parse(JSON.stringify(item)) as SyllabusChapter;
        if (copy.customSubtopics) {
          copy.customSubtopics = copy.customSubtopics.filter((sub) => sub.id !== customSubtopicId);
        }
        calculateLocalChapterProgress(copy);
        return copy;
      })
    );

    // 2. Network sync
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
      fetchSyllabus();
    }
  };

  const onToggleExcludeSubtopic = async (chapterId: number, subtopic: string) => {
    // 1. Optimistic Update
    setSyllabus((prev) =>
      prev.map((item) => {
        if (item.id !== chapterId) return item;
        const copy = JSON.parse(JSON.stringify(item)) as SyllabusChapter;
        if (!copy.excludedCheckpoints) {
          copy.excludedCheckpoints = [];
        }
        const idx = copy.excludedCheckpoints.indexOf(subtopic);
        if (idx > -1) {
          copy.excludedCheckpoints.splice(idx, 1);
        } else {
          copy.excludedCheckpoints.push(subtopic);
          (copy as any)[subtopic] = false;
        }
        calculateLocalChapterProgress(copy);
        return copy;
      })
    );

    // 2. Network sync
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
      fetchSyllabus();
    }
  };

  const onResetCheckpoints = async (chapterId: number) => {
    // 1. Optimistic Update
    setSyllabus((prev) =>
      prev.map((item) => {
        if (item.id !== chapterId) return item;
        const copy = JSON.parse(JSON.stringify(item)) as SyllabusChapter;
        copy.hasLearned = false;
        copy.hasRevision = false;
        copy.hasPyqs = false;
        copy.hasNotes = false;
        copy.hasTest = false;
        copy.hasShortNotes = false;
        copy.customSubtopics = [];
        copy.excludedCheckpoints = [];
        calculateLocalChapterProgress(copy);
        return copy;
      })
    );

    // 2. Network sync
    try {
      const res = await fetch("/api/syllabus/reset-checkpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: chapterId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSyllabus((prev) => prev.map((item) => (item.id === chapterId ? updated : item)));
      }
    } catch (err) {
      console.error(err);
      fetchSyllabus();
    }
  };

  // Add Chapter Form State
  const [showAddChapterForm, setShowAddChapterForm] = useState<boolean>(false);
  const [newSubject, setNewSubject] = useState<string>("Physics");
  const [newClassLevel, setNewClassLevel] = useState<"11" | "12">("11");
  const [newUnit, setNewUnit] = useState<string>("");
  const [newChapterName, setNewChapterName] = useState<string>("");
  const [newCourseType, setNewCourseType] = useState<"NCERT" | "ONLINE">("NCERT");
  const [newEstHours, setNewEstHours] = useState<number>(12);

  useEffect(() => {
    fetchSyllabus();
  }, []);

  useEffect(() => {
    try {
      if (syllabus && syllabus.length > 0) {
        localStorage.setItem("student_syllabus_cache", JSON.stringify(syllabus));
      }
    } catch (e) {}
  }, [syllabus]);

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
    const isCompleted = currentStatus === "COMPLETED";
    const nextCompletedState = !isCompleted;

    // 1. Optimistic Update
    setSyllabus((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const copy = JSON.parse(JSON.stringify(item)) as SyllabusChapter;
        copy.hasLearned = nextCompletedState;
        copy.hasRevision = nextCompletedState;
        copy.hasPyqs = nextCompletedState;
        copy.hasNotes = nextCompletedState;
        copy.hasTest = nextCompletedState;
        copy.hasShortNotes = nextCompletedState;
        if (copy.customSubtopics) {
          copy.customSubtopics.forEach((sub) => {
            sub.checked = nextCompletedState;
          });
        }
        calculateLocalChapterProgress(copy);
        return copy;
      })
    );

    // 2. Network sync
    try {
      const res = await fetch("/api/syllabus/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: nextCompletedState }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSyllabus((prev) => prev.map((item) => (item.id === id ? updated : item)));
      }
    } catch (err) {
      console.error(err);
      fetchSyllabus();
    }
  };

  const toggleSubtopic = async (id: number, subtopic: string, customSubtopicId?: string) => {
    // 1. Optimistic Update
    setSyllabus((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const copy = JSON.parse(JSON.stringify(item)) as SyllabusChapter;
        if (customSubtopicId) {
          if (copy.customSubtopics) {
            const sub = copy.customSubtopics.find((s) => s.id === customSubtopicId);
            if (sub) {
              sub.checked = !sub.checked;
            }
          }
        } else {
          (copy as any)[subtopic] = !(copy as any)[subtopic];
        }
        calculateLocalChapterProgress(copy);
        return copy;
      })
    );

    // 2. Network sync
    try {
      const res = await fetch("/api/syllabus/toggle-subtopic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, subtopic, customSubtopicId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSyllabus((prev) => prev.map((item) => (item.id === id ? updated : item)));
      }
    } catch (err) {
      console.error(err);
      fetchSyllabus();
    }
  };

  const onAddSubtopic = async (chapterId: number, label: string) => {
    const tempId = `custom_temp_${Date.now()}`;
    // 1. Optimistic Update
    setSyllabus((prev) =>
      prev.map((item) => {
        if (item.id !== chapterId) return item;
        const copy = JSON.parse(JSON.stringify(item)) as SyllabusChapter;
        if (!copy.customSubtopics) {
          copy.customSubtopics = [];
        }
        copy.customSubtopics.push({ id: tempId, label, checked: false });
        calculateLocalChapterProgress(copy);
        return copy;
      })
    );

    // 2. Network sync
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
      fetchSyllabus();
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnit.trim() || !newChapterName.trim()) {
      return;
    }
    try {
      const res = await fetch("/api/syllabus/add-chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newSubject,
          unit: newUnit.trim(),
          chapter: newChapterName.trim(),
          classLevel: newClassLevel,
          courseType: "NCERT", // Defaulting core syllabus page to NCERT board chapters
          estimatedTimeHours: Number(newEstHours) || 12
        }),
      });
      if (res.ok) {
        const added = await res.json();
        setSyllabus((prev) => [...prev, added]);
        setNewUnit("");
        setNewChapterName("");
        setShowAddChapterForm(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const subjects = ["All", "Physics", "Chemistry", "Mathematics", "Biology"];
  
  // Filter core syllabus list
  const filteredSyllabus = syllabus.filter((s) => {
    const matchSubject = activeSubject === "All" || s.subject === activeSubject;
    const matchClass = activeClass === "All" || s.classLevel === activeClass;
    return matchSubject && matchClass;
  });

  // Separate into NCERT and Online Coaching duplicates
  const ncertSyllabus = filteredSyllabus.filter((s) => s.courseType === "NCERT" || !s.courseType);
  const onlineSyllabus = filteredSyllabus.filter((s) => s.courseType === "ONLINE");

  // Computing combined metrics based on core NCERT syllabus
  const totalChaptersCount = ncertSyllabus.length;
  const completedChaptersCount = ncertSyllabus.filter((s) => s.status === "COMPLETED").length;
  const inProgressChaptersCount = ncertSyllabus.filter((s) => s.status === "IN_PROGRESS").length;
  const combinedCompletionRate = totalChaptersCount > 0 ? Math.round((completedChaptersCount / totalChaptersCount) * 100) : 0;
  const totalHoursLogged = ncertSyllabus.reduce((acc, curr) => acc + curr.timeSpentHours, 0);

  if (selectedChapter) {
    return (
      <div className="space-y-6 animate-fade-in" id="syllabus-tracker-section">
        <ChapterCheckpointsDetail
          item={selectedChapter}
          toggleComplete={toggleComplete}
          toggleSubtopic={toggleSubtopic}
          onAddSubtopic={onAddSubtopic}
          onDeleteSubtopic={onDeleteSubtopic}
          onToggleExcludeSubtopic={onToggleExcludeSubtopic}
          onResetCheckpoints={onResetCheckpoints}
          onBack={() => setSelectedChapterId(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6" id="syllabus-tracker-section">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0b0f19]/60 backdrop-blur-md border border-white/[0.06] p-5 rounded-2xl shadow-xl flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]">
            <CheckCircle2 className="w-5.5 h-5.5 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs text-slate-300 font-mono font-bold tracking-wider uppercase block">Completed Chapters</span>
            <h4 className="text-2xl sm:text-3xl font-display font-black text-emerald-400 mt-0.5 shadow-sm">
              {completedChaptersCount} <span className="text-sm text-slate-400 font-sans font-medium">/ {totalChaptersCount}</span>
            </h4>
          </div>
        </div>

        <div className="bg-[#0b0f19]/60 backdrop-blur-md border border-white/[0.06] p-5 rounded-2xl shadow-xl flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-300 border border-emerald-500/25">
            <BookOpen className="w-5.5 h-5.5 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs text-slate-300 font-mono font-bold tracking-wider uppercase block">In Progress</span>
            <h4 className="text-2xl sm:text-3xl font-display font-black text-emerald-300 mt-0.5">
              {inProgressChaptersCount} <span className="text-sm text-slate-400 font-sans font-medium">Chapters</span>
            </h4>
          </div>
        </div>

        <div className="bg-[#0b0f19]/60 backdrop-blur-md border border-white/[0.06] p-5 rounded-2xl shadow-xl flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
            <Clock className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-xs text-slate-300 font-mono font-bold tracking-wider uppercase block">Study Hours Spent</span>
            <h4 className="text-2xl sm:text-3xl font-display font-black text-white mt-0.5">
              {totalHoursLogged} <span className="text-sm text-slate-400 font-sans font-medium">hrs</span>
            </h4>
          </div>
        </div>

        <div className="bg-[#0b0f19]/60 backdrop-blur-md border border-white/[0.06] p-5 rounded-2xl shadow-xl flex items-center space-x-4">
          <button
            onClick={fetchSyllabus}
            disabled={loading}
            className="p-3 bg-emerald-500/15 rounded-xl text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)] hover:bg-emerald-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50 group"
            title="Click to Refresh Progress"
          >
            <RefreshCw className={`w-5.5 h-5.5 text-emerald-400 transition-transform ${loading ? "animate-spin" : "group-hover:rotate-180 duration-500"}`} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-mono font-bold tracking-wider uppercase block">Overall Progress</span>
            </div>
            <h4 className="text-2xl sm:text-3xl font-display font-black text-emerald-400 mt-0.5">{combinedCompletionRate}%</h4>
          </div>
        </div>
      </div>

      {/* Filters, Controls and Dynamic Chapter Addition */}
      <div className="space-y-4 border-b border-white/[0.06] pb-5">
        {/* Class Level Filter & Add Chapter Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex bg-white/[0.02] p-1 rounded-xl text-xs border border-white/[0.05]">
              {(["All", "11", "12"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setActiveClass(lvl)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider cursor-pointer ${
                    activeClass === lvl 
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {lvl === "All" ? "All Classes" : `Class ${lvl}`}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddChapterForm(!showAddChapterForm)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/20"
            >
              <PlusCircle className="w-4 h-4" />
              Add New Chapter
            </button>
          </div>

          {activeClass !== "All" && (
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20 inline-flex items-center gap-1.5 shadow-[0_0_8px_rgba(16,185,129,0.05)]">
              <Layers className="w-3.5 h-3.5" />
              Class {activeClass} Selected
            </span>
          )}
        </div>

        {/* Dynamic add chapter form */}
        {showAddChapterForm && (
          <div className="bg-[#0b0f19]/90 border border-white/10 p-5 rounded-2xl shadow-xl animate-fade-in space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-display font-medium text-white uppercase tracking-wider">Configure New Course Chapter</h4>
            </div>

            <form onSubmit={handleAddChapter} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider">Subject</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-slate-300 text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider">Class Level</label>
                <select
                  value={newClassLevel}
                  onChange={(e) => setNewClassLevel(e.target.value as "11" | "12")}
                  className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-slate-300 text-xs focus:border-emerald-500 focus:outline-none"
                >
                  <option value="11">Class 11</option>
                  <option value="12">Class 12</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider">Unit Name</label>
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-slate-200 text-xs focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Electrostatics or Mechanics"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider">Chapter Name / Title</label>
                <input
                  type="text"
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-slate-200 text-xs focus:border-emerald-500 focus:outline-none"
                  placeholder="e.g. Electric Charges and Fields"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider">Est. Study Hours</label>
                <input
                  type="number"
                  value={newEstHours}
                  onChange={(e) => setNewEstHours(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-white/10 p-2.5 rounded-xl text-slate-200 text-xs focus:border-emerald-500 focus:outline-none font-mono"
                  placeholder="12"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddChapterForm(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold uppercase transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-950/20 cursor-pointer"
                >
                  Save Chapter Module
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Subject Filter Bar */}
        <div className="flex flex-wrap gap-2">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setActiveSubject(sub)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSubject === sub 
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10 border border-emerald-500/30" 
                  : "bg-white/[0.02] text-slate-300 hover:bg-white/[0.06] border border-white/[0.05]"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-[#0b0f19]/60 backdrop-blur-md border border-white/[0.06] rounded-3xl p-20 text-center text-slate-500 font-mono text-xs animate-pulse">
          Loading course modules...
        </div>
      ) : (
        <div className="space-y-6">
          {/* NCERT SCHOOL SYLLABUS - Now Full Width */}
          <div className="bg-[#0b0f19]/60 backdrop-blur-md border border-white/[0.06] rounded-3xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-emerald-500/5 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <h3 className="font-display font-medium text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  NCERT Core Board Syllabus
                </h3>
                <p className="text-[9px] text-slate-400 mt-1">Primary school syllabus tracker & board exam criteria</p>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                {ncertSyllabus.filter(s => s.status === "COMPLETED").length} / {ncertSyllabus.length} Done
              </span>
            </div>

            <div className="divide-y divide-white/[0.04] max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {ncertSyllabus.length === 0 ? (
                <div className="p-10 text-center text-xs text-slate-500 font-mono">No matching board chapters found.</div>
              ) : (
                ncertSyllabus.map((item) => (
                  <ChapterRow 
                    key={item.id} 
                    item={item} 
                    toggleComplete={toggleComplete} 
                    onSelectChapter={setSelectedChapterId}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
