// Holds the authenticated user context
"use client";

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import api from "@/services/api";
import { useRouter } from "next/navigation";

// Register form interface
interface RegisterData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

// Create user interface
interface User {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

// Create interface for authentication type
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  taskUpdateTrigger: number;
  triggerTaskUpdate: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Define global states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [taskUpdateTrigger, setTaskUpdateTrigger] = useState(0);
  const router = useRouter();

  const logout = useCallback(() => {
    // Remove tokens from local storage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    // Clean axios headers
    delete api.defaults.headers.Authorization;
    // Clean states
    setUser(null);
    setIsAuthenticated(false);
    // Redirect to login
    router.push("/login");
  }, [router]);

  // Function to get user data from the API if token is in local storage
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        // Define token in axios for future requests
        api.defaults.headers.Authorization = `Bearer ${token}`;
        // Fetch user
        const response = await api.get("/users/me/");
        // Update states if successful
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        // Case where token is invalid
        console.error("Invalid token error, cleaning session:", error);
        // Clean session
        logout();
      } finally {
        // Loading finished independently of success
        setIsLoading(false);
      }
    } else {
      // Clean states if there is no token
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Verify if is an unauthorized error and if the user did not retry
        if (error.response.status === 401 && !originalRequest._retry) {
          // Marks the request as retried to avoid loops
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem("refreshToken");

            if (!refreshToken) {
              logout();
              return Promise.reject(error);
            }
            // API call to refresh token
            const { data } = await api.post("/token/refresh/", {
              refresh: refreshToken,
            });

            // If successful, update both tokens
            localStorage.setItem("accessToken", data.access);
            if (data.refresh) {
              localStorage.setItem("refreshToken", data.refresh);
            }

            api.defaults.headers.Authorization = `Bearer ${data.access}`;

            originalRequest.headers.Authorization = `Bearer ${data.access}`;

            return api(originalRequest);
          } catch (refreshError) {
            console.error("Error refreshing token:", refreshError);
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const register = async (data: RegisterData) => {
    // Register user request
    await api.post("/users/register/", data);
    // After successfull register, go to login page recording if success
    router.push("/login?registered=true");
  };

  const login = async (email: string, password: string) => {
    const response = await api.post("/token/", { username: email, password });
    const { access, refresh } = response.data;

    // Store tokens in local storage
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);

    // After successfull login, fetch user data and change necessary states
    await fetchUser();

    router.push("/dashboard");
  };

  const triggerTaskUpdate = () => {
    setTaskUpdateTrigger((prev) => prev + 1);
  };

  const contextValue = {
    isAuthenticated,
    isLoading,
    taskUpdateTrigger,
    triggerTaskUpdate,
    user,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be user within an AuthProvider");
  }
  return context;
}
