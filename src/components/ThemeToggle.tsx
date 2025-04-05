
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import { useState } from "react";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [isChecked, setIsChecked] = useState(theme === "dark");

  const handleToggle = () => {
    setIsChecked(!isChecked);
    toggleTheme();
  };

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0 text-yellow-500" />
      <Switch 
        checked={isChecked} 
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-indigo-600"
      />
      <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-300" />
    </div>
  );
};

export default ThemeToggle;
