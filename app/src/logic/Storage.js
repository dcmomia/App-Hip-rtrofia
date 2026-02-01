/**
 * Storage utility for HYPERTROPHY-X.
 */

const KEYS = {
    SESSION_LOGS: 'hx_session_logs',
    CURRENT_STATE: 'hx_current_state',
    SESSION_DRAFT: 'hx_session_draft'
};

export const saveSessionLog = (log) => {
    const logs = getSessionLogs();
    logs.push({ ...log, timestamp: new Date().toISOString() });
    localStorage.setItem(KEYS.SESSION_LOGS, JSON.stringify(logs));
    localStorage.removeItem(KEYS.SESSION_DRAFT); // Clear draft on successful finalize
};

export const saveSessionDraft = (sessionId, draft) => {
    localStorage.setItem(`${KEYS.SESSION_DRAFT}_${sessionId}`, JSON.stringify(draft));
};

export const getSessionDraft = (sessionId) => {
    const draft = localStorage.getItem(`${KEYS.SESSION_DRAFT}_${sessionId}`);
    return draft ? JSON.parse(draft) : null;
};

export const getSessionLogs = () => {
    const logs = localStorage.getItem(KEYS.SESSION_LOGS);
    return logs ? JSON.parse(logs) : [];
};

export const updateAppState = (state) => {
    const currentState = getAppState();
    const newState = { ...currentState, ...state };
    localStorage.setItem(KEYS.CURRENT_STATE, JSON.stringify(newState));
};

export const getAppState = () => {
    const state = localStorage.getItem(KEYS.CURRENT_STATE);
    return state ? JSON.parse(state) : { meso: 1, week: 1 };
};

export const clearSessionLogs = () => {
    localStorage.removeItem(KEYS.SESSION_LOGS);
};

export const clearAllData = () => {
    localStorage.removeItem(KEYS.SESSION_LOGS);
    localStorage.removeItem(KEYS.CURRENT_STATE);
    localStorage.removeItem(KEYS.SESSION_DRAFT);
};
