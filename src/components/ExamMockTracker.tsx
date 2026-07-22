import React, { useState, useEffect } from "react";
import { Award, Target, HelpCircle, TrendingUp, Sparkles, BookOpen, Clock, Plus, Hourglass, Settings, Trash2, Calendar, X, PlusCircle } from "lucide-react";
import { Exam } from "../types";

export default function ExamMockTracker() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [examName, setExamName] = useState<string>("");
  const [examType, setExamType] = useState<string>("MOCK_TEST");
  const [customExamType, setCustomExamType] = useState<string>("");
  const [subject, setSubject] = useState<string>("Physics");
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [marksObtained, setMarksObtained] = useState<number>(75);
  const [rank, setRank] = useState<number>(5);
  const [accuracy, setAccuracy] = useState<number>(85);
  const [weakTopics, setWeakTopics] = useState<string>("");
  const [strongTopics, setStrongTopics] = useState<string>("");

  const [countdowns, setCountdowns] = useState<{ id: string; name: string; date: string; color: string }[]>(() => {
    const saved = localStorage.getItem("study_countdowns");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter((cd: any) => cd.id !== "1" && cd.id !== "2") : [];
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [isManagingCountdowns, setIsManagingCountdowns] = useState<boolean>(false);
  const [newCdName, setNewCdName] = useState<string>("");
  const [newCdDate, setNewCdDate] = useState<string>("");
  const [newCdColor, setNewCdColor] = useState<string>("indigo");

  useEffect(() => {
    localStorage.setItem("study_countdowns", JSON.stringify(countdowns));
  }, [countdowns]);

  const handleAddCountdown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCdName.trim() || !newCdDate) {
      alert("Please provide both exam name and target date.");
      return;
    }
    const newCd = {
      id: Date.now().toString(),
      name: newCdName.trim(),
      date: newCdDate,
      color: newCdColor
    };
    setCountdowns((prev) => [...prev, newCd]);
    setNewCdName("");
    setNewCdDate("");
    setNewCdColor("indigo");
  };

  const handleDeleteCountdown = (id: string) => {
    setCountdowns((prev) => prev.filter((cd) => cd.id !== id));
  };

  const getDaysToGo = (targetDateStr: string) => {
    const now = new Date();
    // Reset hours to get accurate calendar days difference
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(targetDateStr);
    const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    
    const diffTime = targetDay.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await fetch("/api/exams");
      const data = await res.json();
      setExams(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedType = examType === "CUSTOM" ? customExamType : examType;
    if (examType === "CUSTOM" && !customExamType.trim()) {
      alert("Please enter a custom exam type name.");
      return;
    }
    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examName,
          examType: resolvedType,
          subject,
          maxMarks,
          marksObtained,
          rank,
          accuracy,
          weakTopics,
          strongTopics,
        }),
      });
      const newExam = await res.json();
      setExams((prev) => [newExam, ...prev]);
      setExamName("");
      setCustomExamType("");
      setExamType("MOCK_TEST");
      setWeakTopics("");
      setStrongTopics("");
      alert("Exam result recorded successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  // Stats calculation
  const mockTests = exams.filter((e) => e.examType === "MOCK_TEST");
  const avgAccuracy = mockTests.length > 0 ? Math.round(mockTests.reduce((acc, curr) => acc + (curr.accuracy || 0), 0) / mockTests.length) : 0;
  const highestScore = exams.length > 0 ? Math.max(...exams.map((e) => e.percentage)) : 0;
  const avgPercent = exams.length > 0 ? Math.round(exams.reduce((acc, curr) => acc + curr.percentage, 0) / exams.length) : 0;

  return (
    <div className="space-y-6" id="exam-mock-tracker">
      {/* Target JEE / NEET Exam Countdown */}
      <div className="bg-[#0b0f19]/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl flex flex-col gap-6 border border-white/[0.08] glow-indigo">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="space-y-1 text-left">
            <span className="text-[9px] bg-indigo-500/15 text-indigo-300 font-mono tracking-widest uppercase px-3 py-1 rounded-full border border-indigo-500/20 inline-flex items-center gap-1.5">
              <Hourglass className="w-3.5 h-3.5 animate-spin-slow" />
              Target Countdown Indicators
            </span>
            <h3 className="text-xl font-display font-bold text-white tracking-tight mt-1.5">Upcoming Milestones & Exams</h3>
            <p className="text-xs text-slate-400">Track and count down remaining days to your major academic boards & mock exams</p>
          </div>
          
          <button
            onClick={() => setIsManagingCountdowns(!isManagingCountdowns)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/10 text-slate-300 font-mono text-[10px] tracking-wider uppercase hover:bg-white/[0.04] transition cursor-pointer self-start sm:self-center"
          >
            {isManagingCountdowns ? <X className="w-3.5 h-3.5" /> : <Settings className="w-3.5 h-3.5" />}
            <span>{isManagingCountdowns ? "Close Manager" : "Manage Timers"}</span>
          </button>
        </div>

        {/* Dynamic Countdown Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {countdowns.map((cd) => {
            const daysLeft = getDaysToGo(cd.date);
            
            // Map colors beautifully
            let colorClasses = {
              bg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
              title: "text-indigo-400",
              badge: "bg-indigo-500/10 text-indigo-300",
              bar: "bg-indigo-500"
            };
            if (cd.color === "amber") {
              colorClasses = {
                bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
                title: "text-amber-400",
                badge: "bg-amber-500/10 text-amber-300",
                bar: "bg-amber-500"
              };
            } else if (cd.color === "emerald") {
              colorClasses = {
                bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                title: "text-emerald-400",
                badge: "bg-emerald-500/10 text-emerald-300",
                bar: "bg-emerald-500"
              };
            } else if (cd.color === "rose") {
              colorClasses = {
                bg: "bg-rose-500/10 border-rose-500/20 text-rose-400",
                title: "text-rose-400",
                badge: "bg-rose-500/10 text-rose-300",
                bar: "bg-rose-500"
              };
            } else if (cd.color === "sky") {
              colorClasses = {
                bg: "bg-sky-500/10 border-sky-500/20 text-sky-400",
                title: "text-sky-400",
                badge: "bg-sky-500/10 text-sky-300",
                bar: "bg-sky-500"
              };
            }

            return (
              <div key={cd.id} className={`text-center p-4 bg-slate-950/70 rounded-2xl border flex flex-col justify-between min-h-[110px] relative group overflow-hidden ${colorClasses.bg}`}>
                {isManagingCountdowns && (
                  <button
                    onClick={() => handleDeleteCountdown(cd.id)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-red-950/50 hover:bg-red-900 border border-red-500/30 text-red-300 hover:text-white transition opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Delete countdown"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                <div className="my-auto space-y-1">
                  <h4 className="text-2xl font-mono font-black tracking-tight">
                    {daysLeft > 0 ? (
                      daysLeft
                    ) : daysLeft === 0 ? (
                      <span className="text-lg uppercase">Today!</span>
                    ) : (
                      <span className="text-xs uppercase opacity-75">Passed</span>
                    )}
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-widest block line-clamp-2 max-w-full px-1">
                    {cd.name}
                  </span>
                </div>
                <div className="mt-2 pt-1.5 border-t border-white/5 text-[9px] font-mono text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
                  <Calendar className="w-2.5 h-2.5" />
                  {new Date(cd.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}

          {/* Quick empty placeholder button when there are few countdowns */}
          {countdowns.length < 5 && !isManagingCountdowns && (
            <button
              onClick={() => setIsManagingCountdowns(true)}
              className="border-2 border-dashed border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 rounded-2xl flex flex-col items-center justify-center p-4 min-h-[110px] text-slate-500 hover:text-indigo-400 transition cursor-pointer gap-2 animate-pulse"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Add Custom</span>
            </button>
          )}
        </div>

        {/* Expandable Countdown Management form */}
        {isManagingCountdowns && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 animate-fade-in text-left shadow-lg">
            <h4 className="text-sm font-display font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <PlusCircle className="w-4.5 h-4.5 text-indigo-600" />
              Create Custom Milestone Target Countdown
            </h4>
            
            <form onSubmit={handleAddCountdown} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
              <div className="sm:col-span-5 space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Exam / Milestone Name</label>
                <input
                  type="text"
                  value={newCdName}
                  onChange={(e) => setNewCdName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="e.g. Term 1 Physics Exam, JEE Advanced"
                  required
                />
              </div>

              <div className="sm:col-span-3 space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Target Date</label>
                <input
                  type="date"
                  value={newCdDate}
                  onChange={(e) => setNewCdDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-slate-800 text-sm focus:border-indigo-500 focus:outline-none font-mono focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">Vibe Color</label>
                <select
                  value={newCdColor}
                  onChange={(e) => setNewCdColor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="indigo">Indigo</option>
                  <option value="amber">Amber</option>
                  <option value="emerald">Emerald</option>
                  <option value="rose">Rose</option>
                  <option value="sky">Sky Blue</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition cursor-pointer"
                >
                  Save Timer
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0b0f19]/60 backdrop-blur-md border border-white/[0.06] p-5 rounded-2xl shadow-xl flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">Average Accuracy</span>
            <h4 className="text-xl font-display font-semibold text-white mt-0.5">{avgAccuracy}%</h4>
          </div>
        </div>

        <div className="bg-[#0b0f19]/60 backdrop-blur-md border border-white/[0.06] p-5 rounded-2xl shadow-xl flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">Highest Performance</span>
            <h4 className="text-xl font-display font-semibold text-white mt-0.5">{highestScore}%</h4>
          </div>
        </div>

        <div className="bg-[#0b0f19]/60 backdrop-blur-md border border-white/[0.06] p-5 rounded-2xl shadow-xl flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">Average Score</span>
            <h4 className="text-xl font-display font-semibold text-white mt-0.5">{avgPercent}%</h4>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Form and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mock Exam Result logger form */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-md space-y-4 text-slate-800">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-slate-800">Log Test Result</h3>
          </div>

          <form onSubmit={handleAddExam} className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Exam / Mock Name</label>
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800 text-xs font-sans placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="e.g. JEE Mock Exam 4"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Type</label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-700 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="MOCK_TEST">Mock Test</option>
                  <option value="SCHOOL">School Exam</option>
                  <option value="COACHING">Coaching Test</option>
                  <option value="BOARD">Board Exam</option>
                  <option value="CUSTOM">Custom Type...</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-700 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>
            </div>

            {examType === "CUSTOM" && (
              <div className="space-y-1 animate-fade-in">
                <label className="block text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Custom Exam Type Name</label>
                <input
                  type="text"
                  value={customExamType}
                  onChange={(e) => setCustomExamType(e.target.value)}
                  className="w-full bg-slate-50 border border-emerald-200 p-2.5 rounded-xl text-slate-800 text-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 font-sans"
                  placeholder="e.g. Allen Minor, PWC Term Exam..."
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Marks Obtained</label>
                <input
                  type="number"
                  value={marksObtained}
                  onChange={(e) => setMarksObtained(parseFloat(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Max Marks</label>
                <input
                  type="number"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(parseFloat(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Rank Secured</label>
                <input
                  type="number"
                  value={rank}
                  onChange={(e) => setRank(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Accuracy (%)</label>
                <input
                  type="number"
                  value={accuracy}
                  onChange={(e) => setAccuracy(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Weak Topics</label>
              <input
                type="text"
                value={weakTopics}
                onChange={(e) => setWeakTopics(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
                placeholder="Topics needing review"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Strong Topics</label>
              <input
                type="text"
                value={strongTopics}
                onChange={(e) => setStrongTopics(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-slate-400"
                placeholder="Comfortable topics"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Performance</span>
            </button>
          </form>
        </div>

        {/* Exam Results Table & Countdown */}
        <div className="lg:col-span-2 bg-[#0b0f19]/60 backdrop-blur-md border border-white/[0.06] rounded-3xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 bg-white/[0.01] border-b border-white/[0.06] flex items-center justify-between">
            <h3 className="font-display font-medium text-xs uppercase tracking-wider text-white">Past Exam Performance & Mock Scores</h3>
            <span className="text-[10px] font-mono text-slate-400">{exams.length} exams analyzed</span>
          </div>

          <div className="divide-y divide-white/[0.05]">
            {exams.length === 0 ? (
              <div className="py-20 text-center text-slate-500 font-mono text-xs">No exam metrics logged yet</div>
            ) : (
              exams.map((exam) => (
                <div key={exam.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.01] transition-all">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded tracking-wider ${
                          exam.examType === "MOCK_TEST"
                            ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                            : "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                        }`}
                      >
                        {exam.examType.replace("_", " ")}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">{exam.subject}</span>
                    </div>
                    
                    <h4 className="font-display font-bold text-white text-base sm:text-lg tracking-tight">{exam.examName}</h4>
                    
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-200 text-sm sm:text-base font-sans">
                        <span className="bg-slate-850 px-2.5 py-1 rounded-lg border border-white/5 font-mono">
                          Score: <strong className="text-white text-base">{exam.marksObtained}</strong> / <span className="text-slate-400">{exam.maxMarks}</span>
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="font-medium">
                          Rank: <strong className="text-amber-400 text-base">{exam.rank || "N/A"}</strong>
                        </span>
                        {exam.accuracy && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                              Accuracy: {exam.accuracy}%
                            </span>
                          </>
                        )}
                      </div>
                      
                      {exam.weakTopics && (
                        <p className="text-xs sm:text-sm text-slate-300 font-medium flex flex-wrap items-center gap-1.5">
                          <span className="text-rose-400 uppercase tracking-widest text-[10px] font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Weak topics:</span> 
                          <span className="font-mono bg-slate-900/50 px-2 py-1 rounded text-slate-200">{exam.weakTopics}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between shrink-0 sm:ml-4">
                    <div className="text-left sm:text-right bg-indigo-950/20 p-3 rounded-2xl border border-indigo-500/10 min-w-[100px] text-center sm:text-right">
                      <div className="text-2xl sm:text-3xl font-display font-extrabold text-indigo-400 tracking-tight">{exam.percentage}%</div>
                      <span className="text-xs font-mono text-slate-400 mt-1 block">
                        {new Date(exam.examDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
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
