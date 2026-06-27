import { useCallback, useEffect, useState } from "react";

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Ошибка авторизации");
  }

  return response.json();
};

export function useAdminSession() {
  const [session, setSession] = useState({ authenticated: false, username: null });
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      setSession(await requestJson("/api/auth/session"));
    } finally {
      setIsCheckingSession(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(async ({ username, password }) => {
    const nextSession = await requestJson("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setSession(nextSession);
    return nextSession;
  }, []);

  const logout = useCallback(async () => {
    const nextSession = await requestJson("/api/auth/logout", { method: "POST" });
    setSession(nextSession);
    return nextSession;
  }, []);

  return {
    session,
    isCheckingSession,
    isAuthenticated: session.authenticated,
    login,
    logout,
  };
}
