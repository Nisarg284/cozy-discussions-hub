
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Menu, Search, X, Bell, Plus, Sparkles, ChevronDown, 
  Film, Compass, Users
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AuthButton from "./AuthButton";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-subtle py-2"
          : "bg-white dark:bg-gray-900 py-2"
      }`}
    >
      <div className="container max-w-6xl mx-auto px-4 flex items-center justify-between h-12">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center space-x-2 text-reddit-blue dark:text-blue-400"
        >
          <div className="w-8 h-8 rounded-full bg-reddit-orange text-white flex items-center justify-center font-bold">
            r
          </div>
          <span className="text-xl font-semibold hidden sm:inline">reddit</span>
        </Link>

        {/* Home Dropdown */}
        {isAuthenticated && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hidden md:flex">
              <Button variant="ghost" className="h-9 gap-1 font-medium">
                Home
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 dark:bg-gray-800">
              <DropdownMenuItem onSelect={() => navigate("/")}>Home</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate("/explore")}>
                <Compass className="mr-2 h-4 w-4" />
                Explore
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate("/?sort=popular")}>Popular</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate("/?sort=all")}>All</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate("/videos")}>
                <Film className="mr-2 h-4 w-4" />
                Videos
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate("/subreddits/create")}>Create Community</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="relative mx-4 flex-1 max-w-md transition-all duration-300">
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground transition-colors duration-200 ${
                searchFocused ? "text-primary" : ""
              }`}
              size={18}
            />
            <Input
              placeholder="Search Reddit"
              className="w-full pl-10 pr-4 h-9 rounded-full bg-secondary/50 border-none focus:ring-1 focus:ring-primary/20 transition-all dark:bg-gray-800/50"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </form>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-3">
          <ThemeToggle />
          
          <Link to="/explore" className="flex items-center space-x-1 px-3 py-1.5 text-sm rounded-md hover:bg-secondary/80 dark:hover:bg-gray-800">
            <Compass size={18} />
            <span className="hidden lg:inline">Explore</span>
          </Link>
          
          <Link to="/videos" className="flex items-center space-x-1 px-3 py-1.5 text-sm rounded-md hover:bg-secondary/80 dark:hover:bg-gray-800">
            <Film size={18} />
            <span className="hidden lg:inline">Videos</span>
          </Link>
          
          {isAuthenticated && (
            <>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                <Sparkles size={20} />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-9 w-9"
                onClick={() => navigate("/submit")}
              >
                <Plus size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                <Bell size={20} />
              </Button>
            </>
          )}
          <AuthButton />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-primary-foreground bg-primary rounded-full flex items-center justify-center"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={20} />
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-background dark:bg-gray-900 z-50 animate-fade-in">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4 border-b dark:border-gray-800">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-reddit-orange text-white flex items-center justify-center font-bold">
                    r
                  </div>
                  <span className="text-xl font-semibold">reddit</span>
                </Link>
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <button
                    className="p-2 rounded-full hover:bg-secondary dark:hover:bg-gray-800"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-4">
                <div className="space-y-4">
                  <div className="py-2">
                    <AuthButton />
                  </div>
                  
                  <Link 
                    to="/explore" 
                    className="flex items-center py-3 px-4 rounded-md bg-secondary/50 dark:bg-gray-800/50 text-primary dark:text-white font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Compass className="mr-3" size={20} />
                    Explore
                  </Link>
                  
                  <Link 
                    to="/videos" 
                    className="flex items-center py-3 px-4 rounded-md bg-secondary/50 dark:bg-gray-800/50 text-primary dark:text-white font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Film className="mr-3" size={20} />
                    Videos
                  </Link>
                  
                  {isAuthenticated && (
                    <div className="space-y-2 pt-4 border-t dark:border-gray-800">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => {
                          navigate("/?sort=popular");
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <Sparkles className="mr-2" size={18} />
                        Popular
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => {
                          navigate("/submit");
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <Plus className="mr-2" size={18} />
                        Create Post
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => {
                          navigate("/messages");
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <Bell className="mr-2" size={18} />
                        Messages
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => {
                          navigate("/video-call");
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <Users className="mr-2" size={18} />
                        Video Call
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
