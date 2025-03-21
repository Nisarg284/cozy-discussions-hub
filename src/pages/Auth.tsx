
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, AlertTriangle, CheckCircle, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const Auth = () => {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
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
          setStatus("error");
          return;
        }

        if (!code) {
          setError("No authorization code received");
          setStatus("error");
          return;
        }

        console.log("Auth page received code:", code.substring(0, 5) + "...");
        await login(code);
        setStatus("success");
        
        // Redirect after short delay to show success message
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } catch (err: any) {
        console.error("Authentication error:", err);
        setError(err?.message || "Failed to authenticate with Reddit");
        setStatus("error");
      }
    };

    processAuth();
  }, [location, login, navigate]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#DAE0E6]">
        <div className="text-center max-w-md mx-auto p-8 rounded-lg bg-white shadow-sm border border-gray-200">
          <Loader2 className="h-12 w-12 animate-spin text-reddit-orange mx-auto mb-6" />
          <h1 className="text-2xl font-semibold mb-3">Connecting to Reddit</h1>
          <p className="text-muted-foreground mb-4">
            Please wait while we complete the authentication process...
          </p>
          <div className="space-y-2 text-sm text-left border-t border-gray-100 pt-4 mt-4">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-green-500" />
              <span>Authenticating securely with Reddit</span>
            </div>
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-green-500" />
              <span>Processing your credentials</span>
            </div>
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-500" />
              <span>Setting up your account</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#DAE0E6]">
        <div className="text-center max-w-md mx-auto p-8 rounded-lg bg-white shadow-sm border border-gray-200">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-semibold mb-3">Successfully Signed In!</h1>
          <p className="text-muted-foreground">
            You're now authenticated with Reddit. Redirecting you to the homepage...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#DAE0E6]">
        <div className="text-center max-w-md mx-auto p-8 rounded-lg border border-destructive/20 bg-destructive/5">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-6" />
          <h1 className="text-2xl font-semibold mb-3 text-destructive">Authentication Failed</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button
            onClick={() => navigate("/")}
            className="bg-reddit-orange text-white hover:bg-reddit-orange/90"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default Auth;
