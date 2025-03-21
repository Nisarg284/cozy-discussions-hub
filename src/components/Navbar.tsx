
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, Search, X, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AuthButton from "./AuthButton";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-subtle py-3"
          : "bg-white py-4"
      }`}
    >
      <div className="container max-w-6xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center space-x-2 text-reddit-blue"
        >
          <div className="w-8 h-8 rounded-full bg-reddit-blue text-white flex items-center justify-center font-bold">
            r
          </div>
          <span className="text-xl font-semibold hidden sm:inline">reddit</span>
        </Link>

        {/* Search */}
        <div
          className={`relative mx-4 flex-1 max-w-md transition-all duration-300 ${
            searchFocused ? "scale-105" : ""
          }`}
        >
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground transition-colors duration-200 ${
                searchFocused ? "text-primary" : ""
              }`}
              size={18}
            />
            <Input
              placeholder="Search"
              className="w-full pl-10 pr-4 h-10 rounded-full bg-secondary/50 border-none focus:ring-1 focus:ring-primary/20 transition-all"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
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
          <div className="fixed inset-0 bg-background z-50 animate-fade-in">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center p-4 border-b">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-reddit-blue text-white flex items-center justify-center font-bold">
                    r
                  </div>
                  <span className="text-xl font-semibold">reddit</span>
                </Link>
                <button
                  className="p-2 rounded-full hover:bg-secondary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-auto p-4">
                <div className="space-y-4">
                  <div className="py-2">
                    <AuthButton />
                  </div>
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
