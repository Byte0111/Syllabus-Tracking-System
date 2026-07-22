import { getAccessToken } from "./firebase";

export interface CalendarEvent {
  summary: string;
  description: string;
  startTime: string; // ISO String
  durationMinutes: number;
}

// Check if user is logged into Google Calendar (has token)
export function isGoogleConnected(): boolean {
  return !!getAccessToken();
}

// Fetch calendar events
export async function fetchCalendarEvents(maxResults = 10) {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Google Calendar not connected. Please sign in with Google.");
  }

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&maxResults=${maxResults}&timeMin=${new Date().toISOString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || "Failed to fetch Google Calendar events");
  }

  const data = await res.json();
  return data.items || [];
}

// Add an event to Google Calendar
export async function addEventToGoogleCalendar(event: CalendarEvent) {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Google Calendar not connected. Please sign in with Google.");
  }

  const startDateTime = new Date(event.startTime);
  const endDateTime = new Date(startDateTime.getTime() + event.durationMinutes * 60 * 1000);

  const body = {
    summary: event.summary,
    description: event.description,
    start: {
      dateTime: startDateTime.toISOString(),
    },
    end: {
      dateTime: endDateTime.toISOString(),
    },
  };

  const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || "Failed to create Google Calendar event");
  }

  return await res.json();
}
