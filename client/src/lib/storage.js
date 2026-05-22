const SESSION_KEY = "station-diary-session";
const ACTIVE_SHELL_KEY = "station-diary-active-shell";

export function saveSession(data) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ACTIVE_SHELL_KEY);
}

export function getToken() {
  return getSession()?.token || null;
}

export function getUser() {
  return getSession()?.user || null;
}

/**
 * Super admin doesn't belong to a single shell, but they need to view per-shell
 * pages (diary, stock). We persist a chosen "active shell" they're viewing as.
 */
export function getActiveShell() {
  const raw = localStorage.getItem(ACTIVE_SHELL_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setActiveShell(shell) {
  if (!shell) {
    localStorage.removeItem(ACTIVE_SHELL_KEY);
    return;
  }
  localStorage.setItem(
    ACTIVE_SHELL_KEY,
    JSON.stringify({ _id: shell._id, name: shell.name })
  );
}

/**
 * Returns the shell the user is currently viewing.
 *  - For staff/manager: their assigned shell.
 *  - For super_admin: the shell they've picked from the admin dashboard
 *    (or any shell switcher), persisted in localStorage.
 */
export function getShell() {
  const user = getUser();
  return user?.shell || getActiveShell() || null;
}
