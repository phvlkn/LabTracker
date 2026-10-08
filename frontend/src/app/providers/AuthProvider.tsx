import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  apiRequest,
  clearTokens,
  getRefreshToken,
  saveTokens,
} from "../../shared/api/client";

export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiRequest<User>("/users/me")
      .then(setUser)
      .catch(() => clearTokens())
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login: async (email, password) => {
        const response = await apiRequest<AuthResponse>(
          "/auth/login",
          {
            method: "POST",
            body: JSON.stringify({ email, password }),
          },
          false,
        );
        saveTokens(response);
        setUser(response.user);
      },
      register: async (email, username, password) => {
        await apiRequest<User>(
          "/auth/register",
          {
            method: "POST",
            body: JSON.stringify({ email, username, password }),
          },
          false,
        );
        const response = await apiRequest<AuthResponse>(
          "/auth/login",
          {
            method: "POST",
            body: JSON.stringify({ email, password }),
          },
          false,
        );
        saveTokens(response);
        setUser(response.user);
      },
      logout: async () => {
        const refreshToken = getRefreshToken();
        try {
          if (refreshToken) {
            await apiRequest<void>(
              "/auth/logout",
              {
                method: "POST",
                body: JSON.stringify({ refresh_token: refreshToken }),
              },
              false,
            );
          }
        } finally {
          clearTokens();
          setUser(null);
        }
      },
    }),
    [isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth должен использоваться внутри AuthProvider");
  }
  return context;
}
