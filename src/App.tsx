import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Clock,
  Award,
  Shield,
  Users,
  LogOut,
  Lock,
  User,
  Mail,
  Phone,
  School,
  FileText,
  Bookmark,
  Calendar,
  Code,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  UserCheck,
  CheckCircle,
  XCircle,
  X,
  Smartphone,
  Send,
  Sliders,
  MailCheck,
  Bot,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft
} from "lucide-react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { User as UserType } from "./types";

// Import modules
import SyllabusTracker from "./components/SyllabusTracker";
import StudySessionTracker from "./components/StudySessionTracker";
import ExamMockTracker from "./components/ExamMockTracker";
import ParentDashboard from "./components/ParentDashboard";
import AdminDashboard from "./components/AdminDashboard";
import YoutubePlaylist from "./components/YoutubePlaylist";
import NotesSection from "./components/NotesSection";
import AssignmentsGoals from "./components/AssignmentsGoals";
import TodoCorner from "./components/TodoCorner";
import OnlineCourses from "./components/OnlineCourses";

// Import Firebase Client-side Authentication helpers
import { initAuth, googleSignIn, logoutGoogle, setAccessToken } from "./lib/firebase";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pathname, setPathname] = useState<string>(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    setPathname(path);
  };

  // Form States
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isAdminLogin, setIsAdminLogin] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [regName, setRegName] = useState<string>("");
  const [regEmail, setRegEmail] = useState<string>("");
  const [regPassword, setRegPassword] = useState<string>("");
  const [regRole, setRegRole] = useState<string>("ROLE_STUDENT");
  const [regBoard, setRegBoard] = useState<string>("CBSE");
  const [regStream, setRegStream] = useState<string>("Science");
  const [regClass, setRegClass] = useState<string>("12");
  const [regSchool, setRegSchool] = useState<string>("");

  // Tab State
  const [activeTab, setActiveTab] = useState<string>("syllabus");

  // Profile edit states
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>("");
  const [editPhone, setEditPhone] = useState<string>("");
  const [editSchool, setEditSchool] = useState<string>("");
  const [editParentEmail, setEditParentEmail] = useState<string>("");
  const [editAutoNotifyParent, setEditAutoNotifyParent] = useState<boolean>(false);
  const [editAutoNotifySelf, setEditAutoNotifySelf] = useState<boolean>(false);
  const [isConfirmingDeactivate, setIsConfirmingDeactivate] = useState<boolean>(false);

  // Google Sandbox preview state variables
  const [showGoogleSandboxModal, setShowGoogleSandboxModal] = useState<boolean>(false);
  const [sandboxEmail, setSandboxEmail] = useState<string>("");
  const [sandboxName, setSandboxName] = useState<string>("");

  useEffect(() => {
    // Check local storage for persistent mock session
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      const parsed = JSON.parse(storedUser);
      setCurrentUser(parsed);
      setToken(storedToken);
      
      // Initialize edit fields
      setEditName(parsed.name || "");
      setEditPhone(parsed.phone || "");
      setEditSchool(parsed.school === "Not specified" ? "" : (parsed.school || ""));
      setEditParentEmail(parsed.parentEmail || "");
      setEditAutoNotifyParent(!!parsed.autoNotifyParent);
      setEditAutoNotifySelf(!!parsed.autoNotifySelf);

      // Auto routing tab depending on roles
      if (parsed.role === "ROLE_PARENT") setActiveTab("parent");
      else if (parsed.role === "ROLE_ADMIN") setActiveTab("admin");
      else setActiveTab("syllabus");
    }

    // Connect with Firebase client-side OAuth session state listener
    const unsubscribe = initAuth(
      (firebaseUser, accessToken) => {
        // If a Google access token is successfully restored, sync it with the server in memory
        console.log("Restored active Google OAuth credentials in-memory.");
        setAccessToken(accessToken);
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: parsed.email,
              name: parsed.name,
              photoURL: parsed.profileImage,
              accessToken
            })
          }).catch(err => console.error("Could not sync restored Google access token:", err));
        }
      },
      () => {
        console.log("No stored Google API tokens are currently active.");
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleLogin = async (e?: React.FormEvent, customCredentials?: { email: string; pass: string }) => {
    if (e) e.preventDefault();
    setFormError(null);
    const loginEmail = customCredentials ? customCredentials.email : email;
    const loginPassword = customCredentials ? customCredentials.pass : password;

    // 1. Check for Empty fields
    if (!loginEmail || !loginEmail.trim() || !loginPassword || !loginPassword.trim()) {
      setFormError("Empty fields");
      return;
    }

    // 2. Check for Invalid email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginEmail)) {
      setFormError("Invalid email");
      return;
    }

    // 3. Check for Weak password
    if (loginPassword.length < 6) {
      setFormError("Weak password");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.error) {
        setFormError(data.error);
        return;
      }
      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      setEditName(data.user.name || "");
      setEditPhone(data.user.phone || "");
      setEditSchool(data.user.school === "Not specified" ? "" : (data.user.school || ""));
      setEditParentEmail((data.user as any).parentEmail || "");
      setEditAutoNotifyParent(!!(data.user as any).autoNotifyParent);
      setEditAutoNotifySelf(!!(data.user as any).autoNotifySelf);

      // Route based on roles
      if (data.role === "ROLE_PARENT") setActiveTab("parent");
      else if (data.role === "ROLE_ADMIN") setActiveTab("admin");
      else setActiveTab("syllabus");
    } catch (err) {
      setFormError("Authentication connection failed.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setFormError(null);
      let fUser: any;
      let accessToken: string;
      try {
        const result = await googleSignIn();
        if (!result) return;
        fUser = result.user;
        accessToken = result.accessToken;
      } catch (authErr) {
        const errMessage = String(authErr?.message || authErr || "").toLowerCase();
        const errCode = String((authErr as any)?.code || "").toLowerCase();
        const isCancelled = errCode.includes("closed-by-user") || 
                            errCode.includes("cancelled") || 
                            errMessage.includes("cancel") || 
                            errMessage.includes("closed by user") || 
                            errMessage.includes("user-cancelled");

        if (isCancelled) {
          setFormError("Google sign-in was cancelled.");
          return;
        }

        console.warn("Real Google Auth popup failed/blocked in iframe, launching Google Sandbox Sign-in:", authErr);
        // Clear previous input values and show the elegant sandbox input modal
        setSandboxEmail("");
        setSandboxName("");
        setShowGoogleSandboxModal(true);
        return;
      }

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: fUser.email,
          name: fUser.displayName || "Google User",
          photoURL: fUser.photoURL || "",
          accessToken,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setFormError(data.error);
        return;
      }

      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      setEditName(data.user.name || "");
      setEditPhone(data.user.phone || "");
      setEditSchool(data.user.school === "Not specified" ? "" : (data.user.school || ""));
      setEditParentEmail((data.user as any).parentEmail || "");
      setEditAutoNotifyParent(!!(data.user as any).autoNotifyParent);
      setEditAutoNotifySelf(!!(data.user as any).autoNotifySelf);

      if (data.role === "ROLE_PARENT") setActiveTab("parent");
      else if (data.role === "ROLE_ADMIN") setActiveTab("admin");
      else setActiveTab("syllabus");

      setFormError(null);
    } catch (err: any) {
      console.error(err);
      setFormError("Google sign-in connection failed. Please use standard email login.");
    }
  };

  const handleSandboxGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxEmail || !sandboxEmail.trim()) {
      setFormError("Please provide a valid email address.");
      return;
    }

    try {
      setFormError(null);
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: sandboxEmail.trim(),
          name: sandboxName.trim() || "Google Sandbox User",
          photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
          accessToken: "mock-google-access-token",
        }),
      });
      const data = await res.json();
      if (data.error) {
        setFormError(data.error);
        return;
      }

      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      setEditName(data.user.name || "");
      setEditPhone(data.user.phone || "");
      setEditSchool(data.user.school === "Not specified" ? "" : (data.user.school || ""));
      setEditParentEmail((data.user as any).parentEmail || "");
      setEditAutoNotifyParent(!!(data.user as any).autoNotifyParent);
      setEditAutoNotifySelf(!!(data.user as any).autoNotifySelf);

      if (data.role === "ROLE_PARENT") setActiveTab("parent");
      else if (data.role === "ROLE_ADMIN") setActiveTab("admin");
      else setActiveTab("syllabus");

      setFormError(null);
      setShowGoogleSandboxModal(false);
    } catch (err: any) {
      console.error(err);
      setFormError("Google Sandbox authentication failed.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Check for Empty fields
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim() || !regSchool.trim()) {
      setFormError("Empty fields");
      return;
    }

    // 2. Check for Invalid email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setFormError("Invalid email");
      return;
    }

    // 3. Check for Weak password
    if (regPassword.length < 6) {
      setFormError("Weak password");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          role: regRole,
          board: regBoard,
          stream: regStream,
          classLevel: regClass,
          school: regSchool,
        }),
      });
      const data = await res.json();
      if (data.error) {
        if (data.error.toLowerCase().includes("already in use") || data.error.toLowerCase().includes("duplicate")) {
          setFormError("Duplicate username");
        } else {
          setFormError(data.error);
        }
        return;
      }
      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      setIsRegistering(false);
      
      setEditName(data.user.name || "");
      setEditPhone(data.user.phone || "");
      setEditSchool(data.user.school === "Not specified" ? "" : (data.user.school || ""));
      setEditParentEmail((data.user as any).parentEmail || "");
      setEditAutoNotifyParent(!!(data.user as any).autoNotifyParent);
      setEditAutoNotifySelf(!!(data.user as any).autoNotifySelf);

      alert("Registration completed successfully!");
      if (data.role === "ROLE_PARENT") setActiveTab("parent");
      else if (data.role === "ROLE_ADMIN") setActiveTab("admin");
      else setActiveTab("syllabus");
    } catch (err) {
      setFormError("Registration failed. Please check input parameters.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    try {
      await logoutGoogle();
    } catch (e) {}
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setActiveTab("syllabus");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Validate name is not empty
    if (!editName || !editName.trim()) {
      alert("Empty fields");
      return;
    }

    // Validate phone number format (if provided)
    if (editPhone && editPhone.trim()) {
      const phoneRegex = /^[+]?[0-9\s\-]{7,15}$/;
      if (!phoneRegex.test(editPhone)) {
        alert("Invalid phone number");
        return;
      }
    }

    try {
      const res = await fetch(`/api/user/profile/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: editName, 
          phone: editPhone, 
          school: editSchool,
          parentEmail: editParentEmail,
          autoNotifyParent: editAutoNotifyParent,
          autoNotifySelf: editAutoNotifySelf,
          email: currentUser.email,
          role: currentUser.role,
          board: currentUser.board,
          classLevel: currentUser.classLevel,
          stream: currentUser.stream,
          profileImage: currentUser.profileImage,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Failed to update profile.");
        return;
      }
      const data = await res.json();
      setCurrentUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      setIsEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Failed to update profile.");
    }
  };

  const handleDeactivateAccount = () => {
    const conf = window.confirm("Are you sure you want to de-activate your tracker account? This suspends class notifications.");
    if (conf) {
      alert("Account deactivated. Logging out.");
      handleLogout();
    }
  };

  const handleDeleteAccount = () => {
    const conf = window.confirm("CRITICAL: Are you sure you want to permanently delete your academic logs and progress database? This action is irreversible.");
    if (conf) {
      alert("Database records successfully deleted. Logging out.");
      handleLogout();
    }
  };

  if (pathname === "/privacy-policy") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-3xl w-full mx-auto bg-white border border-slate-200/80 rounded-[32px] shadow-xl overflow-hidden flex flex-col p-8 md:p-12 relative animate-fade-in text-left">
          {/* Top Branding Bar */}
          <div className="border-b border-slate-100 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-indigo-600 block">StudyTracker Legal Docs</span>
                <h1 className="font-display font-black text-xl text-slate-900 uppercase tracking-wide">Privacy Policy</h1>
              </div>
            </div>
            
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigateTo("/");
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 hover:underline flex items-center gap-1.5 self-start sm:self-auto"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </a>
          </div>

          <div className="text-xs text-slate-600 space-y-6 leading-relaxed font-sans">
            <p className="font-semibold text-slate-800 text-sm">Effective Date: July 20, 2026</p>
            <p className="text-slate-600">
              Welcome to <strong>StudyTracker</strong>. We are deeply committed to protecting your personal information and your academic tracking data. This Privacy Policy describes how we collect, protect, and handle your information.
            </p>

            <div className="space-y-2 border-t border-slate-100 pt-5">
              <h4 className="font-bold text-slate-800 font-mono text-[11px] uppercase tracking-wider text-indigo-600">1. Information We Collect</h4>
              <p>
                When you use StudyTracker, we collect standard registration data (such as your Name, Email, Password, School/Academy, Class Level, Board, and Stream) to personalize your academic dashboard. We also store user-provided tracker details including syllabus milestones, daily study logs, test performance indicators, goals, and notes.
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-5">
              <h4 className="font-bold text-slate-800 font-mono text-[11px] uppercase tracking-wider text-indigo-600">2. Google API Services & Scopes</h4>
              <p>
                Our application integrates with Google Workspace APIs (specifically Gmail and Google Calendar) to automatically send custom study status updates and log scheduling markers on your behalf. All data accessed through Google OAuth is utilized strictly for these service executions and is never sold, shared, or transferred to third-party marketing entities.
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-5">
              <h4 className="font-bold text-slate-800 font-mono text-[11px] uppercase tracking-wider text-indigo-600">3. Parents & Guardian Notifications</h4>
              <p>
                If configured in your academic profile, our platform will automate the dispatch of daily academic progress reports and test summaries to your specified parent or guardian email address via Gmail. You retain full control over enabling or disabling these notifications at any time.
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-5">
              <h4 className="font-bold text-slate-800 font-mono text-[11px] uppercase tracking-wider text-indigo-600">4. Firebase & Secure Cloud Databases</h4>
              <p>
                We store your user-authored study trackers and credentials securely inside Firebase Firestore and Authentication. We utilize robust firestore security rules to guarantee that only authorized users can query or update their own personal student profiles.
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-5">
              <h4 className="font-bold text-slate-800 font-mono text-[11px] uppercase tracking-wider text-indigo-600">5. Contact Information</h4>
              <p>
                If you have any questions about this Privacy Policy, your rights, or data deletion requests, you may contact our operations coordinator at <a href="mailto:mahimehta220@gmail.com" className="text-indigo-600 font-semibold hover:underline">mahimehta220@gmail.com</a>.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 mt-10 pt-6 flex justify-end">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigateTo("/");
              }}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 cursor-pointer"
            >
              Back to StudyTracker
            </a>
          </div>
        </div>
        
        <footer className="mt-8 text-center text-[10px] text-slate-400 font-mono">
          &copy; {new Date().getFullYear()} StudyTracker. All rights reserved.
        </footer>
      </div>
    );
  }

  if (pathname === "/terms-of-service") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-3xl w-full mx-auto bg-white border border-slate-200/80 rounded-[32px] shadow-xl overflow-hidden flex flex-col p-8 md:p-12 relative animate-fade-in text-left">
          {/* Top Branding Bar */}
          <div className="border-b border-slate-100 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-indigo-600 block">StudyTracker Legal Docs</span>
                <h1 className="font-display font-black text-xl text-slate-900 uppercase tracking-wide">Terms of Service</h1>
              </div>
            </div>
            
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigateTo("/");
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 hover:underline flex items-center gap-1.5 self-start sm:self-auto"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </a>
          </div>

          <div className="text-xs text-slate-600 space-y-6 leading-relaxed font-sans">
            <p className="font-semibold text-slate-800 text-sm">Effective Date: July 20, 2026</p>
            <p className="text-slate-600">
              By accessing or using the <strong>StudyTracker</strong> platform, you agree to comply with and be bound by these Terms of Service. Please read them carefully before using our software features.
            </p>

            <div className="space-y-2 border-t border-slate-100 pt-5">
              <h4 className="font-bold text-slate-800 font-mono text-[11px] uppercase tracking-wider text-indigo-600">1. Account Registration & Safety</h4>
              <p>
                To use StudyTracker, you must create a secure student, parent, or administrator account. You are responsible for maintaining the confidentiality of your credentials and are fully liable for all activities that occur under your registered account.
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-5">
              <h4 className="font-bold text-slate-800 font-mono text-[11px] uppercase tracking-wider text-indigo-600">2. Automated Actions & Google Access</h4>
              <p>
                By activating Gmail report dispatch rules in your academic settings, you explicitly authorize StudyTracker to execute custom automated report sending from your Google-associated email or designated system servers to target parent email addresses. Users must not abuse Google API quotas.
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-5">
              <h4 className="font-bold text-slate-800 font-mono text-[11px] uppercase tracking-wider text-indigo-600">3. Acceptable Use Policy</h4>
              <p>
                You agree to use StudyTracker strictly for academic, study session scheduling, and syllabus milestone management purposes. Any unauthorized scraping, malicious automated testing, reverse-engineering of endpoints, or transmission of abusive emails/spam is strictly prohibited and will result in permanent account termination.
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-5">
              <h4 className="font-bold text-slate-800 font-mono text-[11px] uppercase tracking-wider text-indigo-600">4. Disclaimer of Warranties</h4>
              <p>
                StudyTracker is provided on an "as-is" and "as-available" basis without warranty of any kind, either express or implied. We do not guarantee uninterrupted server uptime, flawless synchronization with all device calendars, or zero-latency report notification dispatch.
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-5">
              <h4 className="font-bold text-slate-800 font-mono text-[11px] uppercase tracking-wider text-indigo-600">5. Governing Law & Contact</h4>
              <p>
                These Terms of Service are governed by applicable privacy regulations and standard student protection guidelines. For clarity inquiries, contact our operations desk at <a href="mailto:mahimehta220@gmail.com" className="text-indigo-600 font-semibold hover:underline">mahimehta220@gmail.com</a>.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 mt-10 pt-6 flex justify-end">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigateTo("/");
              }}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 cursor-pointer"
            >
              Back to StudyTracker
            </a>
          </div>
        </div>
        
        <footer className="mt-8 text-center text-[10px] text-slate-400 font-mono">
          &copy; {new Date().getFullYear()} StudyTracker. All rights reserved.
        </footer>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative font-sans bg-pink-50">

        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight text-slate-900 uppercase whitespace-nowrap">
              Syllabus-tracker
            </h1>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-xl shadow-slate-100/30">
            {/* Form switcher tab bar */}
            <div className="flex bg-slate-100/80 p-1 rounded-2xl mb-6 border border-slate-200/50">
              <button
                onClick={() => {
                  setIsRegistering(false);
                  setIsAdminLogin(false);
                  setFormError(null);
                  setShowPassword(false);
                }}
                className={`flex-1 py-2.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-center transition-all cursor-pointer rounded-xl ${
                  !isRegistering && !isAdminLogin
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsRegistering(true);
                  setIsAdminLogin(false);
                  setFormError(null);
                  setShowPassword(false);
                }}
                className={`flex-1 py-2.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-center transition-all cursor-pointer rounded-xl ${
                  isRegistering && !isAdminLogin
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Register
              </button>
              <button
                onClick={() => {
                  setIsRegistering(false);
                  setIsAdminLogin(true);
                  setFormError(null);
                  setShowPassword(false);
                }}
                className={`flex-1 py-2.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-center transition-all cursor-pointer rounded-xl flex items-center justify-center gap-1.5 ${
                  isAdminLogin
                    ? "bg-white text-indigo-600 shadow-sm font-bold"
                    : "text-slate-500 hover:text-indigo-600"
                }`}
              >
                Admin
              </button>
            </div>

            {formError && (
              <div className="mb-5 p-3 bg-rose-50 border border-rose-100/80 rounded-2xl flex items-center space-x-2 text-rose-600 animate-fade-in">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-semibold font-mono tracking-tight">{formError}</span>
              </div>
            )}

            {isAdminLogin ? (
              /* SECURE ADMIN LOGIN FORM */
              <form onSubmit={(e) => handleLogin(e)} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setFormError(null); }}
                      style={{ paddingLeft: "2.75rem" }}
                      className="w-full pl-11 pr-4 py-3 bg-white/80 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all placeholder:text-slate-400"
                      placeholder="admin@tracker.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Passkey / Security Word</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setFormError(null); }}
                      style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                      className="w-full pl-11 pr-11 py-3 bg-white/80 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all placeholder:text-slate-400"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer flex items-center justify-center"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-2xl font-semibold bg-indigo-600 hover:bg-indigo-500 text-white text-xs tracking-wider uppercase transition-all cursor-pointer shadow-md shadow-indigo-100"
                >
                  Establish Secure Session
                </button>
              </form>
            ) : !isRegistering ? (
                /* LOGIN FORM */
                <form onSubmit={(e) => handleLogin(e)} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setFormError(null); }}
                        style={{ paddingLeft: "2.75rem" }}
                        className="w-full pl-11 pr-4 py-3 bg-white/80 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all placeholder:text-slate-400"
                        placeholder="yourname@domain.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secret Key / Password</label>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setFormError(null); }}
                        style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                        className="w-full pl-11 pr-11 py-3 bg-white/80 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all placeholder:text-slate-400"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer flex items-center justify-center"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-2xl font-semibold bg-slate-900 hover:bg-slate-800 text-white text-xs tracking-wider uppercase transition-all cursor-pointer"
                  >
                    Authenticate Gateway
                  </button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-100" />
                    </div>
                    <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-widest">
                      <span className="bg-[#ffffff] px-3 text-slate-400">or connect via</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full py-3 px-4 rounded-2xl font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#4285F4"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </form>
              ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
                      placeholder="Salsa"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => { setRegEmail(e.target.value); setFormError(null); }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
                      placeholder="yourname@domain.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Password</label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={regPassword}
                      onChange={(e) => { setRegPassword(e.target.value); setFormError(null); }}
                      className="w-full pl-3 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
                      placeholder="password123"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer flex items-center justify-center"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Role Type</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="ROLE_STUDENT">Student</option>
                      <option value="ROLE_PARENT">Parent / Guardian</option>
                      <option value="ROLE_ADMIN">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Board</label>
                    <select
                      value={regBoard}
                      onChange={(e) => setRegBoard(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="State Board">State Board</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">School Name</label>
                    <input
                      type="text"
                      value={regSchool}
                      onChange={(e) => setRegSchool(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
                      placeholder="DPS International"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Class Level</label>
                    <select
                      value={regClass}
                      onChange={(e) => setRegClass(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="11">Class 11</option>
                      <option value="12">Class 12</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl font-bold bg-indigo-600 text-slate-100 text-xs tracking-wider uppercase hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/10"
                >
                  Register Account
                </button>
              </form>
            )}
          </div>
          {/* Elegant Footer with Contact and Copyright */}
          <footer className="mt-8 text-center space-y-2 text-xs text-slate-500 font-sans border-t border-slate-200/50 pt-6">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
              <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">Contact Us</span>
              <span className="hidden sm:inline text-slate-300">|</span>
              <a 
                href="https://www.linkedin.com/in/mahi3110" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-500 hover:underline transition font-medium"
              >
                LinkedIn
              </a>
              <span className="text-slate-300">•</span>
              <a 
                href="mailto:mahimehta220@gmail.com"
                className="text-indigo-600 hover:text-indigo-500 hover:underline transition font-medium"
              >
                mahimehta220@gmail.com
              </a>
            </div>
            
            <div className="flex justify-center items-center gap-3 text-[10px] text-slate-400 font-medium">
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-600 hover:underline transition"
              >
                Privacy Policy
              </a>
              <span className="text-slate-300">•</span>
              <a
                href="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-600 hover:underline transition"
              >
                Terms of Service
              </a>
            </div>

            <p className="text-[10px] text-slate-400 font-medium">
              &copy; {new Date().getFullYear()} StudyTracker. All rights reserved.
            </p>
          </footer>

          {/* Google Sandbox Modal */}
          {showGoogleSandboxModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col space-y-4 animate-scale-in text-left">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    Google Sign-In Preview
                  </h3>
                  <button 
                    type="button"
                    onClick={() => setShowGoogleSandboxModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  The standard Google Authentication popup is blocked by the platform's preview iframe context. 
                  You can test Google Sign-In by selecting one of the options below:
                </p>
                
                <div className="bg-amber-50 border border-amber-100/70 rounded-2xl p-3.5 space-y-2 text-left">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Option 1: Open in a New Tab
                  </h4>
                  <p className="text-[11px] text-amber-700/95 leading-relaxed font-sans">
                    Opening the app in a new tab bypasses iframe sandbox restrictions, allowing the real Google pop-up to work perfectly!
                  </p>
                  <button
                    type="button"
                    onClick={() => window.open(window.location.href, "_blank")}
                    className="w-full mt-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Open App in New Tab ↗
                  </button>
                </div>

                <form onSubmit={handleSandboxGoogleLogin} className="space-y-3 pt-1 text-left">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    Option 2: Simulate Google Login
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal font-sans">
                    Enter any name and email to mock a fresh or existing Google account sign-in in this sandbox.
                  </p>
                  
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={sandboxName}
                      onChange={(e) => setSandboxName(e.target.value)}
                      placeholder="Your Name (e.g. John Doe)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
                    />
                    <input
                      type="email"
                      value={sandboxEmail}
                      onChange={(e) => setSandboxEmail(e.target.value)}
                      placeholder="Email Address (e.g. john@example.com)"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white text-xs tracking-wider uppercase transition shadow-md shadow-indigo-600/15 cursor-pointer"
                  >
                    Simulate Google Login
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-800 font-sans relative overflow-x-hidden">
      {/* Absolute Decorative Glows */}
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[30%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[130px] pointer-events-none" />

      {/* Elegant Header Panel */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 py-5 px-6 sticky top-0 z-50 shadow-sm shadow-slate-100/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & details */}
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-indigo-600/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-semibold text-sm tracking-[0.2em] uppercase text-slate-800">ONEFORALL</span>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <div className="flex items-center space-x-5">
            <span className="text-xs font-sans text-slate-600 flex items-center bg-slate-100/80 border border-slate-200/40 py-1.5 px-4 rounded-full font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2.5 animate-pulse" />
              {currentUser.name} (
              {currentUser.role === "ROLE_ADMIN" ? "Admin" : currentUser.role === "ROLE_PARENT" ? "Parent" : "Student"})
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
        {/* Small profile quick-view card */}
        <div className="bg-[#0b0f19]/60 backdrop-blur-md border border-white/[0.06] p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 glow-indigo">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0 shadow-[0_0_15px_rgba(236,72,153,0.15)] relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Bot className="w-6.5 h-6.5 relative z-10 text-pink-400 transition-all duration-300 group-hover:scale-110 group-hover:animate-bounce" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-medium text-sm text-white tracking-wide">{currentUser.name}</h3>
              <div className="text-xs text-slate-400 space-y-1 mt-0.5 font-sans">
                <span>{currentUser.email} • {currentUser.phone || "No phone added"}</span>
                {(currentUser as any).parentEmail && (
                  <span className="block text-slate-300 font-medium">
                    Parent Guardian: <span className="text-indigo-400">{(currentUser as any).parentEmail}</span>
                    {((currentUser as any).autoNotifyParent || (currentUser as any).autoNotifySelf) && " (Auto-Alerts Engaged)"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setEditName(currentUser.name);
                setEditPhone(currentUser.phone || "");
                setEditSchool(currentUser.school === "Not specified" ? "" : (currentUser.school || ""));
                setEditParentEmail((currentUser as any).parentEmail || "");
                setEditAutoNotifyParent(!!(currentUser as any).autoNotifyParent);
                setEditAutoNotifySelf(!!(currentUser as any).autoNotifySelf);
                setIsEditingProfile(true);
              }}
              className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 font-mono text-[10px] tracking-wider uppercase hover:bg-white/[0.03] hover:border-indigo-500/30 transition cursor-pointer"
            >
              Update Profile
            </button>
          </div>
        </div>

        {/* Profile Details (Separate Page Modal / Overlay) */}
        {isEditingProfile && (
          <div className="fixed inset-0 z-[150] bg-slate-50 flex flex-col p-4 md:p-8 lg:p-12 overflow-y-auto animate-fade-in">
            {/* Background subtle glowing patterns */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom,rgba(236,72,153,0.05),transparent_50%)] pointer-events-none" />

            <div className="bg-white border border-slate-200/80 rounded-[32px] shadow-xl max-w-2xl w-full mx-auto my-auto relative overflow-hidden animate-scale-in p-6 md:p-10 flex flex-col">
              {/* Close option with a X icon on top right */}
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-20 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="border-b border-slate-100 pb-5 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shadow-sm">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-indigo-500">
                      Academic Profile
                    </span>
                    <h3 className="font-display font-black text-lg text-slate-800 uppercase tracking-wider">
                      Profile Details
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-sans">
                  Update your profile credentials and manage your Gmail alert automation rules.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none font-sans transition shadow-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">Phone Number</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none font-sans transition shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">School / Academy</label>
                  <input
                    type="text"
                    value={editSchool}
                    onChange={(e) => setEditSchool(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none font-sans transition shadow-sm"
                  />
                </div>

                <div className="border-t border-slate-100 pt-5 mt-6 space-y-4">
                  <h4 className="text-[11px] font-mono font-bold tracking-wider text-slate-700 flex items-center uppercase">
                    <Mail className="w-4 h-4 text-emerald-500 mr-2" />
                    Gmail Notification Alerts
                  </h4>
                  
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">Parent / Guardian Email Address</label>
                    <input
                      type="email"
                      value={editParentEmail}
                      onChange={(e) => setEditParentEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-slate-800 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none font-sans transition shadow-sm"
                      placeholder="parent@guardian.com"
                    />
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={editAutoNotifySelf}
                        onChange={(e) => setEditAutoNotifySelf(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                      />
                      <span className="text-xs text-slate-600 font-medium group-hover:text-slate-800 transition">Auto-email a copy of new study logs to myself</span>
                    </label>

                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={editAutoNotifyParent}
                        onChange={(e) => setEditAutoNotifyParent(e.target.checked)}
                        className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                      />
                      <span className="text-xs text-slate-600 font-medium group-hover:text-slate-800 transition">Auto-email academic reports to parent email address</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 pt-6 border-t border-slate-100">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition cursor-pointer shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs tracking-wider uppercase transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dynamic Navigation Tabs based on Role */}
        <div className="flex border-b border-white/[0.06] pb-px overflow-x-auto whitespace-nowrap scrollbar-none">
          {currentUser.role === "ROLE_STUDENT" && (
            <>
              <button
                onClick={() => setActiveTab("syllabus")}
                className={`pb-4 px-5 font-display font-medium text-xs uppercase tracking-[0.2em] border-b-2 transition-all cursor-pointer ${
                  activeTab === "syllabus" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                Syllabus Tracker
              </button>
              <button
                onClick={() => setActiveTab("study-sessions")}
                className={`pb-4 px-5 font-display font-medium text-xs uppercase tracking-[0.2em] border-b-2 transition-all cursor-pointer ${
                  activeTab === "study-sessions" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                Pomodoro Focus
              </button>
              <button
                onClick={() => setActiveTab("exams")}
                className={`pb-4 px-5 font-display font-medium text-xs uppercase tracking-[0.2em] border-b-2 transition-all cursor-pointer ${
                  activeTab === "exams" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                Exam & Mock Score
              </button>
              <button
                onClick={() => setActiveTab("assignments-goals")}
                className={`pb-4 px-5 font-display font-medium text-xs uppercase tracking-[0.2em] border-b-2 transition-all cursor-pointer ${
                  activeTab === "assignments-goals" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                Homework & Goals
              </button>
              <button
                onClick={() => setActiveTab("online-courses")}
                className={`pb-4 px-5 font-display font-medium text-xs uppercase tracking-[0.2em] border-b-2 transition-all cursor-pointer ${
                  activeTab === "online-courses" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                Online Courses
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`pb-4 px-5 font-display font-medium text-xs uppercase tracking-[0.2em] border-b-2 transition-all cursor-pointer ${
                  activeTab === "notes" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                Study Notes
              </button>
            </>
          )}

          {currentUser.role === "ROLE_PARENT" && (
            <button
              onClick={() => setActiveTab("parent")}
              className={`pb-4 px-5 font-display font-medium text-xs uppercase tracking-[0.2em] border-b-2 transition-all cursor-pointer ${
                activeTab === "parent" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              Child Analytics Dashboard
            </button>
          )}

          {currentUser.role === "ROLE_ADMIN" && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`pb-4 px-5 font-display font-medium text-xs uppercase tracking-[0.2em] border-b-2 transition-all cursor-pointer ${
                activeTab === "admin" ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              Institutional Overview (Admin)
            </button>
          )}
        </div>

        {/* Tab Panel Views */}
        <div className="transition-all duration-300">
          {currentUser.role === "ROLE_STUDENT" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2">
                {activeTab === "syllabus" && <SyllabusTracker />}
                {activeTab === "study-sessions" && <StudySessionTracker />}
                {activeTab === "exams" && <ExamMockTracker />}
                {activeTab === "assignments-goals" && <AssignmentsGoals />}
                {activeTab === "online-courses" && <OnlineCourses />}
                {activeTab === "notes" && <NotesSection />}
              </div>
              <div className="lg:col-span-1 space-y-6">
                <TodoCorner />
                <YoutubePlaylist />
              </div>
            </div>
          ) : (
            <>
              {activeTab === "syllabus" && <SyllabusTracker />}
              {activeTab === "study-sessions" && <StudySessionTracker />}
              {activeTab === "exams" && <ExamMockTracker />}
              {activeTab === "assignments-goals" && <AssignmentsGoals />}
              {activeTab === "online-courses" && <OnlineCourses />}
              {activeTab === "notes" && <NotesSection />}
              {activeTab === "parent" && <ParentDashboard currentUser={currentUser} />}
              {activeTab === "admin" && <AdminDashboard />}
            </>
          )}
        </div>

        {/* Elegant Footer with Contact and Copyright */}
        <footer className="mt-16 border-t border-slate-200/50 pt-8 pb-8 text-center space-y-2 text-xs text-slate-500 font-sans">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400">Contact Us</span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <a 
              href="https://www.linkedin.com/in/mahi3110" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-500 hover:underline transition font-medium"
            >
              LinkedIn
            </a>
            <span className="text-slate-300">•</span>
            <a 
              href="mailto:mahimehta220@gmail.com"
              className="text-indigo-600 hover:text-indigo-500 hover:underline transition font-medium"
            >
              mahimehta220@gmail.com
            </a>
          </div>

          <div className="flex justify-center items-center gap-3 text-[10px] text-slate-400 font-medium">
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 hover:underline transition"
            >
              Privacy Policy
            </a>
            <span className="text-slate-300">•</span>
            <a
              href="/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 hover:underline transition"
            >
              Terms of Service
            </a>
          </div>

          <p className="text-[10px] text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} StudyTracker. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
