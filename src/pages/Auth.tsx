
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Auth = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const processAuth = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        const error = params.get("error");

        if (error) {
          setError(error);
          setIsLoading(false);
          return;
        }

        if (!code) {
          setError("No authorization code received");
          setIsLoading(false);
          return;
        }

        await login(code);
        navigate("/");
      } catch (err) {
        console.error("Authentication error:", err);
        setError("Failed to authenticate with Reddit");
        setIsLoading(false);
      }
    };

    processAuth();
  }, [location, login, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6 rounded-lg">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-6" />
          <h1 className="text-2xl font-semibold mb-3">Logging you in</h1>
          <p className="text-muted-foreground">
            Please wait while we complete the authentication process...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6 rounded-lg border border-destructive/20 bg-destructive/5">
          <h1 className="text-2xl font-semibold mb-3 text-destructive">Authentication Failed</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default Auth;
