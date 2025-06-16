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
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Function to get user data from the API if token is in local storage
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        // Define token in axios for future requests
        api.defaults.headers.Authorization = `Bearer ${token}`;
        const response = await api.get("/users/me/");
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Invalid token error:", error);
        logout();
      }
    } else {
      // Clean states if there is no token
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  // Runs fetchUser function when the component mounts
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

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

  const logout = () => {
    // Remove tokens from local storage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    delete api.defaults.headers.Authorization;
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be user within an AuthProvider");
  }
  return context;
}
