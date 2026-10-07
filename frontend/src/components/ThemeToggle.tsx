"use client"; // uses state and browser storage, so it runs in the browser

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react"; // moon = go to navy, sun = go back to light

type Theme = "light" | "navy";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light"); // starts as light until we check what's saved

  // Runs once after the page loads: read the theme that the layout script already applied
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "navy" ? "navy" : "light");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "light" ? "navy" : "light"; // flip to the other theme
    setTheme(next); // update the icon
    document.documentElement.dataset.theme = next; // sets data-theme on <html>, which switches every color
    try {
      localStorage.setItem("theme", next); // remember the choice for the next visit
    } catch {
      /* storage can be blocked (private mode): the toggle still works, it just won't be remembered */
    }
  };

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.9 }} // small press effect
      aria-label={theme === "light" ? "Switch to navy theme" : "Switch to light theme"} // icon-only button needs a label
      title={theme === "light" ? "Navy theme" : "Light theme"} // tooltip on hover
      className="rounded-full p-2.5 transition hover:bg-black/5"
    >
      {/* Show the icon of the theme you would switch TO */}
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </motion.button>
  );
}