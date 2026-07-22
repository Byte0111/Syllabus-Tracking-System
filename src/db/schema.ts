import { pgTable, serial, text, boolean, integer, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull().default("secret123"),
  role: text("role").notNull().default("ROLE_STUDENT"),
  status: text("status").notNull().default("ACTIVE"),
  school: text("school").notNull().default(""),
  board: text("board").notNull().default(""),
  classLevel: text("class_level").notNull().default(""),
  stream: text("stream").notNull().default(""),
  phone: text("phone"),
  profileImage: text("profile_image"),
  parentId: integer("parent_id"),
  parentEmail: text("parent_email"),
  autoNotifyParent: boolean("auto_notify_parent").notNull().default(false),
  autoNotifySelf: boolean("auto_notify_self").notNull().default(false),
});

export const personalNotes = pgTable("personal_notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  favorite: boolean("favorite").notNull().default(false),
  links: jsonb("links").$type<string[]>().notNull().default([]),
  fileName: text("file_name"),
  fileSize: text("file_size"),
  fileData: text("file_data"),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  deadline: text("deadline").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const timetableSlots = pgTable("timetable_slots", {
  id: serial("id").primaryKey(),
  day: text("day").notNull(),
  timeSlot: text("time_slot").notNull(),
  subject: text("subject").notNull(),
  type: text("type").notNull(),
});

export const todosTable = pgTable("todos", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  completed: boolean("completed").notNull().default(false),
  subject: text("subject").notNull().default("General"),
  priority: text("priority").notNull().default("MEDIUM"),
  dueDate: text("due_date"),
  reminderTime: text("reminder_time"),
  reminderTriggered: boolean("reminder_triggered").notNull().default(false),
});

export const syllabusChaptersTable = pgTable("syllabus_chapters", {
  id: serial("id").primaryKey(),
  classLevel: text("class_level").notNull().default("11"),
  subject: text("subject").notNull(),
  unit: text("unit").notNull(),
  chapter: text("chapter").notNull(),
  status: text("status").notNull().default("NOT_STARTED"),
  revisionCount: integer("revision_count").notNull().default(0),
  completionPercentage: integer("completion_percentage").notNull().default(0),
  estimatedTimeHours: integer("estimated_time_hours").notNull().default(10),
  timeSpentHours: integer("time_spent_hours").notNull().default(0),
  hasLearned: boolean("has_learned").notNull().default(false),
  hasRevision: boolean("has_revision").notNull().default(false),
  hasPyqs: boolean("has_pyqs").notNull().default(false),
  hasNotes: boolean("has_notes").notNull().default(false),
  hasTest: boolean("has_test").notNull().default(false),
  hasShortNotes: boolean("has_short_notes").notNull().default(false),
  customSubtopics: jsonb("custom_subtopics").$type<any[]>().notNull().default([]),
  excludedCheckpoints: jsonb("excluded_checkpoints").$type<string[]>().notNull().default([]),
  courseType: text("course_type").notNull().default("NCERT"),
});
