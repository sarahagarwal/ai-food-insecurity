"use client";

import React from "react";
import { useLanguage } from "../context/LanguageContext";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  // Add more languages here
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      style={{
        padding: "0.5rem",
        borderRadius: "8px",
        border: "2px solid #2c5f2d",
        backgroundColor: "white",
        color: "#2c5f2d",
        cursor: "pointer",
        fontSize: "0.9rem",
        outline: "none",
      }}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}