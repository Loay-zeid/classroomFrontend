import type { AuthProvider } from "@refinedev/core";
import { ACCESS_TOKEN_KEY, BASE_URL } from "@/constence";

type AuthUser = {
  id?: string | number;
  name?: string;
  email?: string;
  image?: string;
  role?: string;
  approvalStatus?: string;
};

const AUTH_STORAGE_KEY = ACCESS_TOKEN_KEY;
const AUTH_USER_KEY = `${ACCESS_TOKEN_KEY}_user`;

const authBaseUrl = `${BASE_URL}/auth`;

const readStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

const persistSession = (user?: AuthUser | null) => {
  localStorage.setItem(AUTH_STORAGE_KEY, "session");
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
};

const clearSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

const extractUser = (payload: unknown): AuthUser | null => {
  if (!payload || typeof payload !== "object") return null;

  const candidate = payload as {
    user?: AuthUser;
    data?: { user?: AuthUser; session?: { user?: AuthUser } };
    session?: { user?: AuthUser };
  };

  return (
    candidate.user ??
    candidate.data?.user ??
    candidate.session?.user ??
    candidate.data?.session?.user ??
    null
  );
};

const buildIdentity = (user: AuthUser | null) => {
  if (!user) return null;
  const name = user.name ?? user.email ?? "User";
  return {
    id: user.id ?? user.email ?? "user",
    email: user.email ?? "",
    fullName: name,
    firstName: name.split(" ")[0] ?? name,
    lastName: name.split(" ").slice(1).join(" "),
    avatar: user.image,
    role: user.role,
    approvalStatus: user.approvalStatus,
  };
};

const resolvePostAuthRedirect = (user: AuthUser | null) => {
  if (
    user?.role === "teacher" &&
    user.approvalStatus &&
    user.approvalStatus !== "approved"
  ) {
    return "/teacher-pending";
  }
  return "/dashboard";
};

const requestJson = async (url: string, init: RequestInit) => {
  const response = await fetch(url, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const payload = await response
    .clone()
    .json()
    .catch(() => null);

  return { response, payload };
};

export const authProvider: AuthProvider = {
  login: async (params) => {
    const { email, password, providerName } = params as {
      email?: string;
      password?: string;
      providerName?: string;
    };

    if (providerName) {
      return {
        success: false,
        error: {
          name: "AuthProviderError",
          message: "Social login is not configured.",
        },
      };
    }

    const { response, payload } = await requestJson(
      `${authBaseUrl}/sign-in/email`,
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) {
      const message =
        (payload as { message?: string })?.message ?? "Login failed.";
      return {
        success: false,
        error: { name: "AuthProviderError", message },
      };
    }

    const user = extractUser(payload);
    persistSession(user);

    return {
      success: true,
      redirectTo: resolvePostAuthRedirect(user),
    };
  },
  register: async (params) => {
    const { email, password, name, role, providerName } = params as {
      email?: string;
      password?: string;
      name?: string;
      role?: string;
      providerName?: string;
    };

    if (providerName) {
      return {
        success: false,
        error: {
          name: "AuthProviderError",
          message: "Social registration is not configured.",
        },
      };
    }

    const { response, payload } = await requestJson(
      `${authBaseUrl}/sign-up/email`,
      {
        method: "POST",
        body: JSON.stringify({ email, password, name, role }),
      }
    );

    if (!response.ok) {
      const message =
        (payload as { message?: string })?.message ?? "Registration failed.";
      return {
        success: false,
        error: { name: "AuthProviderError", message },
      };
    }

    const user = extractUser(payload);
    persistSession(user);

    return {
      success: true,
      redirectTo: resolvePostAuthRedirect(user),
    };
  },
  logout: async () => {
    await fetch(`${authBaseUrl}/sign-out`, {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);

    clearSession();

    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const { response, payload } = await requestJson(
      `${authBaseUrl}/get-session`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      clearSession();
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }

    const user = extractUser(payload);
    if (!user) {
      clearSession();
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }

    persistSession(user);

    return {
      authenticated: true,
    };
  },
  onError: async (error) => {
    const status =
      (error as { statusCode?: number; status?: number })?.statusCode ??
      (error as { statusCode?: number; status?: number })?.status;

    if (status === 401) {
      clearSession();
      return {
        logout: true,
        redirectTo: "/login",
        error,
      };
    }

    // For 403 and other errors, keep the session and surface the error.
    return { error };
  },
  getIdentity: async () => {
    const storedUser = readStoredUser();
    if (storedUser) {
      return buildIdentity(storedUser);
    }

    const { response, payload } = await requestJson(
      `${authBaseUrl}/get-session`,
      {
        method: "GET",
      }
    );

    if (!response.ok) {
      clearSession();
      return null;
    }

    const user = extractUser(payload);
    if (!user) {
      clearSession();
      return null;
    }

    persistSession(user);
    return buildIdentity(user);
  },
};
