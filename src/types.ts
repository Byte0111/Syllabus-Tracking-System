export type UserRole = "ROLE_ADMIN" | "ROLE_STUDENT" | "ROLE_PARENT" | "ROLE_TEACHER";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  school: string;
  board: string;
  classLevel: string;
  stream: string;
  phone?: string;
  profileImage?: string;
  parentId?: number;
}

export interface CustomSubtopic {
  id: string;
  label: string;
  checked: boolean;
}

export interface SyllabusChapter {
  id: number;
  subject: string;
  unit: string;
  chapter: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  revisionCount: number;
  completionPercentage: number;
  estimatedTimeHours: number;
  timeSpentHours: number;
  classLevel: "11" | "12";
  hasLearned?: boolean;
  hasRevision?: boolean;
  hasPyqs?: boolean;
  hasNotes?: boolean;
  hasTest?: boolean;
  hasShortNotes?: boolean;
  customSubtopics?: CustomSubtopic[];
  courseType?: "NCERT" | "ONLINE";
  excludedCheckpoints?: string[];
}

export interface StudySession {
  id: number;
  subject: string;
  chapter: string;
  durationMinutes: number;
  pomodoroCount: number;
  notes: string;
  startTime: string;
}

export interface Exam {
  id: number;
  examName: string;
  examType: string;
  subject: string;
  examDate: string;
  durationMinutes: number;
  maxMarks: number;
  marksObtained: number;
  percentage: number;
  rank?: number;
  accuracy?: number;
  negativeMarks?: number;
  weakTopics?: string;
  strongTopics?: string;
}

export interface OnlineClass {
  id: number;
  courseName: string;
  teacher: string;
  platform: string;
  classLink: string;
  date: string;
  time: string;
  duration: number;
  status: "Upcoming" | "Completed" | "Missed";
  notes?: string;
}

export interface Assignment {
  id: number;
  title: string;
  deadline: string;
  subject: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "Pending" | "Completed" | "Late";
  notes?: string;
}

export interface PersonalNote {
  id: number;
  title: string;
  content: string;
  tags: string[];
  favorite: boolean;
  links: string[];
  fileName?: string;
  fileSize?: string;
  fileData?: string;
}

export interface Goal {
  id: number;
  description: string;
  deadline: string;
  completed: boolean;
}

export interface TimetableSlot {
  id: number;
  day: string;
  timeSlot: string;
  subject: string;
  type: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  subject: string;
  progress: number;
  bookmark: string;
  active: boolean;
}

export interface FileNode {
  name: string;
  type: "file" | "directory";
  path: string;
  children?: FileNode[];
}

export interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
  subject?: "Physics" | "Chemistry" | "Mathematics" | "Biology" | "General";
  priority?: "HIGH" | "MEDIUM" | "LOW";
  dueDate?: string;
  reminderTime?: string;
  reminderTriggered?: boolean;
}
