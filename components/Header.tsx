"use client";

import React from "react";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "../context/LanguageContext";

export default function Header() {
  const { t } = useLanguage();

  return (
    <header
      style={{
        width: "100%",
        padding: "20px 40px",
        backgroundColor: "#2c5f2d",
        color: "#ffffff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: "'Inter', sans-serif",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        position: "sticky",
        top: "0",
        zIndex: "1000",
      }}
    >
      <h1 
        style={{ 
          fontSize: "28px", 
          fontWeight: "bold",
          background: "linear-gradient(45deg, #ffffff, #f0f0f0)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        {t("home.title")}
      </h1>
      <nav style={{ display: "flex", gap: "30px", alignItems: "center" }}>
        <a
          href="/"
          style={{
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "20px",
            fontWeight: "bold",
            transition: "color 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#f97316")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#ffffff")}
        >
          {t("nav.home")}
        </a>
        <a
          href="/search"
          style={{
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "20px",
            fontWeight: "bold",
            transition: "color 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#f97316")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#ffffff")}
        >
          {t("nav.search")}
        </a>
        <a
          href="/chatbot"
          style={{
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "20px",
            fontWeight: "bold",
            transition: "color 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#f97316")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#ffffff")}
        >
          {t("nav.chatbot")}
        </a>
        <a
          href="/map"
          style={{
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "20px",
            fontWeight: "bold",
            transition: "color 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#f97316")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#ffffff")}
        >
          {t("nav.map")}
        </a>
        <LanguageSelector />
      </nav>
    </header>
  );
}