import { DemoSession } from "./types";

export const DEMO_RUN_LIMIT = Number(process.env.DEMO_RUN_LIMIT ?? 3);

export function getDemoSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem("demo_session");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DemoSession;
  } catch {
    return null;
  }
}

export function initDemoSession(): DemoSession {
  const session: DemoSession = { runsUsed: 0, startedAt: new Date().toISOString() };
  sessionStorage.setItem("demo_session", JSON.stringify(session));
  return session;
}

export function incrementDemoRun(): DemoSession {
  const session = getDemoSession() ?? initDemoSession();
  const updated: DemoSession = { ...session, runsUsed: session.runsUsed + 1 };
  sessionStorage.setItem("demo_session", JSON.stringify(updated));
  return updated;
}

export function isDemoLimitReached(): boolean {
  const session = getDemoSession();
  if (!session) return false;
  return session.runsUsed >= DEMO_RUN_LIMIT;
}

export function saveDraft(systemPrompt: string, userMessage: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem("playground_draft", JSON.stringify({ systemPrompt, userMessage }));
}

export function getDraft(): { systemPrompt: string; userMessage: string } | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem("playground_draft");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("playground_draft");
}

const RESTORE_RUN_KEY = "prism_restore_run";

export function saveRestoreRun(systemPrompt: string, userMessage: string, models: string[]): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(RESTORE_RUN_KEY, JSON.stringify({ systemPrompt, userMessage, models }));
}

export function getRestoreRun(): { systemPrompt: string; userMessage: string; models: string[] } | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(RESTORE_RUN_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearRestoreRun(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(RESTORE_RUN_KEY);
}
