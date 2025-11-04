"use client";
import { useEffect } from "react";

export default function ThemeToggle() {
    // Always set dark mode on mount
    useEffect(() => {
        document.documentElement.dataset.theme = "dark";
        try {
            localStorage.setItem("theme", "dark");
        } catch { }
    }, []);

    // Return null to hide the component completely
    return null;
}
