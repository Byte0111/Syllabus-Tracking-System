import React, { useState, useEffect } from "react";
import { ShieldAlert, BookOpen, Clock, Award, Calendar, HelpCircle, Activity, Sparkles, Mail, Send, MailCheck } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface ParentDashboardProps {
  currentUser?: any;
}

export default function ParentDashboard({ currentUser }: ParentDashboardProps) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchParentMetrics();
  }, []);

  const fetchParentMetrics = async () => {
    try {
      const res = await fetch("/api/parent/dashboard");
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReportEmail = async () => {
    if (!currentUser) return;
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const parentMail = currentUser.parentEmail || "parent@guardian.com";
      const subject = `📊 Academic Progress Report for Salsa - CBSE Class 12`;
      const htmlBody = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #f8fafc;">
          <div style="background-color: #4f46e5; padding: 18px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px;">Academic Tracker Report</h2>
          </div>
          <p style="color: #334155; font-size: 15px;">Hello,</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">Please find the consolidated performance report for <strong>Salsa</strong> (Class 12 CBSE - Science stream) generated directly from the study panel:</p>
          
          <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <h4 style="margin: 0 0 12px 0; color: #4f46e5; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Performance Highlights</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Syllabus Completed</td>
                <td style="padding: 10px 0; color: #0f172a; font-weight: 700; text-align: right; font-size: 15px;">${metrics.completedSyllabusPercentage}%</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Study Hours logged (This Week)</td>
                <td style="padding: 10px 0; color: #0f172a; font-weight: 700; text-align: right; font-size: 15px;">${metrics.studyHoursThisWeek} Hours</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Mock Exam Score Average</td>
                <td style="padding: 10px 0; color: #0f172a; font-weight: 700; text-align: right; font-size: 15px;">${metrics.examAverage}%</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #fff1f2; border: 1px solid #ffe4e6; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <h4 style="margin: 0 0 8px 0; color: #e11d48; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Urgent Focus Areas</h4>
            <ul style="margin: 0; padding-left: 20px; color: #9f1239; font-size: 13px; line-height: 1.6;">
              ${metrics.weakSubjects.map((sub: string) => `<li><strong>${sub}</strong>: Needs immediate syllabus review and revision practice.</li>`).join("")}
            </ul>
          </div>

          <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">Report compiled securely and dispatched on behalf of ${currentUser.name} via official Gmail API integration.</p>
          </div>
        </div>
      `;

      const res = await fetch("/api/notifications/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          toEmail: parentMail,
          subject,
          htmlBody
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to dispatch email");
      }
      setEmailStatus("Email report successfully dispatched to " + parentMail + " via Gmail API!");
    } catch (err: any) {
      console.error(err);
      setEmailStatus(`Failed: ${err.message || "Is your Google account connected?"}`);
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading || !metrics) {
    return <div className="py-20 text-center text-slate-500 font-mono text-xs animate-pulse">Loading parent insights...</div>;
  }

  // Simulated chart data for child's study hours.
  // We clear the dummy hardcoded values since there are no previous details logged yet.
  const progressData = parseFloat(metrics.studyHoursThisWeek) > 0 ? [
    { week: "Week 1", hours: 0 },
    { week: "Week 2", hours: 0 },
    { week: "Week 3", hours: 0 },
    { week: "Week 4", hours: 0 },
    { week: "Current Week", hours: parseFloat(metrics.studyHoursThisWeek) },
  ] : [];

  return (
    <div className="space-y-6" id="parent-dashboard-section">
      {/* Alert / Notice Banner */}
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm">
        <div className="flex items-start space-x-4">
          <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-indigo-900">Parent Guardian Insights Panel</h4>
            <p className="text-xs text-indigo-800/80 leading-relaxed max-w-2xl font-sans">
              You are viewing the consolidated academic timeline and progress analytics for your ward,{" "}
              <strong className="text-indigo-950">{currentUser.name}</strong> (Class {currentUser.classLevel} {currentUser.stream} - {currentUser.board} Board).
            </p>
          </div>
        </div>

        {currentUser && (
          <div className="flex flex-col items-end shrink-0 gap-2">
            <button
              onClick={handleSendReportEmail}
              disabled={sendingEmail}
              className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl tracking-wider uppercase transition-all shadow-md shadow-indigo-600/10 cursor-pointer shrink-0"
            >
              {sendingEmail ? (
                <Clock className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{sendingEmail ? "Dispatched..." : "Send Report via Gmail"}</span>
            </button>
            {emailStatus && (
              <span className={`text-[10px] font-mono tracking-wide ${emailStatus.startsWith("Failed") ? "text-rose-600" : "text-emerald-600"}`}>
                {emailStatus}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">Study Time (Week)</span>
            <h4 className="text-xl font-display font-bold text-slate-900 mt-0.5">{metrics.studyHoursThisWeek} hrs</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">Mock Test Avg</span>
            <h4 className="text-xl font-display font-bold text-slate-900 mt-0.5">{metrics.examAverage}%</h4>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block">Syllabus Completed</span>
            <h4 className="text-xl font-display font-bold text-slate-900 mt-0.5">{metrics.completedSyllabusPercentage}%</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Progress Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-800">Study Commitment Distribution</h3>
          <p className="text-xs text-slate-500 font-sans">Comparing weekly hour commitments logged in custom focus sessions</p>

          {parseFloat(metrics.studyHoursThisWeek) === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <Clock className="w-7 h-7 text-indigo-400 mb-2 animate-pulse" />
              <p className="text-xs font-bold text-slate-700">No study logs registered yet</p>
              <p className="text-[10px] text-slate-500 max-w-xs mt-1">Once your ward logs study time or finishes focus pomodoros, the commitment distribution will appear here.</p>
            </div>
          ) : (
            <div className="h-48 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 9, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 9, fill: "#64748b" }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", color: "#0f172a" }}
                    itemStyle={{ color: "#4f46e5" }}
                  />
                  <Bar dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Action Items & Weak Subject Alerts */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-rose-600 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              Focus Areas & Weak Subjects
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              These subjects show low accuracy ratings in logged mock tests or significant pending assignment backlogs.
            </p>

            <div className="space-y-2.5 pt-1">
              {metrics.weakSubjects.map((sub: string, index: number) => (
                <div key={index} className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl">
                  <h5 className="text-xs font-bold text-rose-700">{sub}</h5>
                  <span className="text-[9px] font-mono text-rose-600 block mt-0.5 uppercase tracking-wide">Immediate review & mock exercises required</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-4 flex justify-between text-[10px] font-mono text-slate-500">
            <span>Pending Homework: {metrics.pendingAssignments}</span>
            <span>Upcoming Exams: {metrics.upcomingExamsCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
