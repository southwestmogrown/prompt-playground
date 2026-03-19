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
