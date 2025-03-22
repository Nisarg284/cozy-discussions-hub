
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogIn, LogOut, User, ChevronDown, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { getAuthUrl } from "@/services/reddit";

const AuthButton = () => {
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuthClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Save current path to redirect back after auth
    sessionStorage.setItem("redirectAfterAuth", location.pathname);
    window.location.href = getAuthUrl();
  };

  if (isAuthenticated && username) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-2 h-9 px-2 hover:bg-secondary/80 rounded-md">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="ml-2 text-left hidden md:block">
                <p className="text-xs font-medium">{username}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                    <span>Online</span>
                  </span>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 ml-1 text-muted-foreground hidden md:block" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 animate-scale-in">
          <DropdownMenuLabel className="flex flex-col">
            <span className="text-xs text-muted-foreground">Logged in as</span>
            <span className="font-bold">{username}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>User Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help Center</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive cursor-pointer"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <a
      href="#"
      onClick={handleAuthClick}
      className="flex items-center space-x-2 rounded-full px-5 animate-fade-in bg-reddit-orange text-white hover:bg-reddit-orange/90 h-9 py-2 text-sm font-medium transition-colors"
    >
      <LogIn className="h-4 w-4" />
      <span>Sign In</span>
    </a>
  );
};

export default AuthButton;
