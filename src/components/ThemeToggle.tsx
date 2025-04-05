
import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/context/ThemeContext";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const [isChecked, setIsChecked] = useState(theme === "dark");

  useEffect(() => {
    setIsChecked(theme === "dark");
  }, [theme]);

  const handleToggle = () => {
    setIsChecked(!isChecked);
    toggleTheme();
  };

  return (
    <div className="flex items-center space-x-2">
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ 
          rotate: theme === "dark" ? 45 : 0,
          opacity: theme === "dark" ? 0.5 : 1 
        }}
        transition={{ duration: 0.3 }}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500" />
      </motion.div>
      
      <Switch 
        checked={isChecked} 
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-indigo-600"
      />
      
      <motion.div
        initial={{ rotate: -45 }}
        animate={{ 
          rotate: theme === "dark" ? 0 : -45,
          opacity: theme === "dark" ? 1 : 0.5 
        }}
        transition={{ duration: 0.3 }}
      >
        <Moon className="h-[1.2rem] w-[1.2rem] text-blue-300 dark:text-blue-200" />
      </motion.div>
    </div>
  );
};

export default ThemeToggle;
