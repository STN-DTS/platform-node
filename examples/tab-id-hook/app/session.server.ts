type SessionData = {
  count: number;
  lastUpdated: string;
};

// A naive in-memory session storage
// In a real app, this would be Redis, a database, etc.
const sessionStore = new Map<string, SessionData>();

export async function getSession(tabId: string): Promise<SessionData> {
  if (!sessionStore.has(tabId)) {
    sessionStore.set(tabId, {
      count: 0,
      lastUpdated: new Date().toISOString(),
    });
  }
  return sessionStore.get(tabId)!;
}

export function hasSession(tabId: string): boolean {
  return sessionStore.has(tabId);
}

export async function updateSession(
  tabId: string,
  data: Partial<SessionData>
): Promise<SessionData> {
  const current = await getSession(tabId);
  const updated = {
    ...current,
    ...data,
    lastUpdated: new Date().toISOString(),
  };
  sessionStore.set(tabId, updated);
  return updated;
}
