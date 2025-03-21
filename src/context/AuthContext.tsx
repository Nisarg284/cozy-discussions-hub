
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  username: string | null;
}

interface AuthContextType extends AuthState {
  login: (code: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const LOCAL_STORAGE_KEY = "reddit_auth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    username: null,
  });

  useEffect(() => {
    // Load auth data from localStorage
    const storedAuth = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth) as AuthState;
        
        // Check if the token is expired
        if (parsedAuth.expiresAt && parsedAuth.expiresAt > Date.now()) {
          setAuthState(parsedAuth);
        } else if (parsedAuth.refreshToken) {
          // Token expired but we have a refresh token
          refreshAccessToken(parsedAuth.refreshToken)
            .then(success => {
              if (!success) {
                // If refresh failed, clear storage
                localStorage.removeItem(LOCAL_STORAGE_KEY);
              }
            });
        } else {
          // No valid tokens, clear storage
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Failed to parse auth data:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []);

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    if (authState.isAuthenticated && authState.accessToken) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(authState));
    } else if (!authState.isAuthenticated) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [authState]);

  const login = async (code: string): Promise<void> => {
    try {
      // Exchange code for tokens
      const response = await fetch("https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa("GmoAXMWDLSWvCevwNKB7hQ:VhL7rIgX73THZqR2IBbhRHAc8Oyh7g")}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: window.location.origin + "/auth",
        }).toString(),
      });

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Get user info
      const userResponse = await fetch("https://oauth.reddit.com/api/v1/me", {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });
      
      if (!userResponse.ok) {
        throw new Error(`Failed to get user info: ${userResponse.status}`);
      }
      
      const userData = await userResponse.json();

      const expiresAt = Date.now() + data.expires_in * 1000;

      setAuthState({
        isAuthenticated: true,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt,
        username: userData.name,
      });

      toast.success(`Logged in as ${userData.name}`);
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Failed to log in with Reddit");
      throw error;
    }
  };

  const refreshAccessToken = async (token?: string): Promise<string | null> => {
    try {
      const refreshToken = token || authState.refreshToken;
      if (!refreshToken) return null;

      const response = await fetch("https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa("GmoAXMWDLSWvCevwNKB7hQ:VhL7rIgX73THZqR2IBbhRHAc8Oyh7g")}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }).toString(),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();
      const expiresAt = Date.now() + data.expires_in * 1000;

      const newState = {
        isAuthenticated: true,
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken, // Use new refresh token if provided
        expiresAt,
        username: authState.username,
      };

      setAuthState(newState);
      return data.access_token;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      logout();
      return null;
    }
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      username: null,
    });
    toast.info("Logged out");
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        refreshAccessToken: () => refreshAccessToken(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
