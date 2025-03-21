
import * as React from "react";
import { createContext, useContext, useState, useEffect } from "react";
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
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load auth data from localStorage
    const storedAuth = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth) as AuthState;
        
        // Check if the token is expired
        if (parsedAuth.expiresAt && parsedAuth.expiresAt > Date.now()) {
          setAuthState(parsedAuth);
          setIsLoading(false);
        } else if (parsedAuth.refreshToken) {
          // Token expired but we have a refresh token
          refreshAccessToken(parsedAuth.refreshToken)
            .then(success => {
              if (!success) {
                // If refresh failed, clear storage
                localStorage.removeItem(LOCAL_STORAGE_KEY);
              }
              setIsLoading(false);
            });
        } else {
          // No valid tokens, clear storage
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to parse auth data:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
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

  // Auto refresh token before it expires
  useEffect(() => {
    if (!authState.expiresAt || !authState.isAuthenticated) return;
    
    // Refresh 5 minutes before expiration
    const timeUntilRefresh = authState.expiresAt - Date.now() - (5 * 60 * 1000);
    
    if (timeUntilRefresh <= 0) {
      // Token is already expired or about to expire, refresh now
      refreshAccessToken();
      return;
    }
    
    const refreshTimer = setTimeout(() => {
      refreshAccessToken();
    }, timeUntilRefresh);
    
    return () => clearTimeout(refreshTimer);
  }, [authState.expiresAt, authState.isAuthenticated]);

  const login = async (code: string): Promise<void> => {
    try {
      setIsLoading(true);
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

      toast.success(`Welcome back, ${userData.name}!`);
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Failed to log in with Reddit");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAccessToken = async (token?: string): Promise<string | null> => {
    try {
      const refreshToken = token || authState.refreshToken;
      if (!refreshToken) return null;

      setIsLoading(true);
      
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
    } finally {
      setIsLoading(false);
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
    toast.info("Logged out successfully");
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        refreshAccessToken: () => refreshAccessToken(),
        isLoading,
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
