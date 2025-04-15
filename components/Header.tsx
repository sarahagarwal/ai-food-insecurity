"use client";

import React from "react";

export default function Header() {
  return (
    <header
      style={{
        width: "100%",
        padding: "20px 40px",
        backgroundColor: "#2c5f2d", // Dark green for the header
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
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>Food Bank Finder</h1>
      <nav style={{ display: "flex", gap: "30px" }}>
        <a
          href="/"
          style={{
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "20px", // Increased font size
            fontWeight: "bold",
            transition: "color 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#f97316")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#ffffff")}
        >
          Home
        </a>
        <a
          href="/chatbot"
          style={{
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "20px", // Increased font size
            fontWeight: "bold",
            transition: "color 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#f97316")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#ffffff")}
        >
          Chatbot
        </a>
        <a
          href="/search"
          style={{
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "20px", // Increased font size
            fontWeight: "bold",
            transition: "color 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#f97316")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#ffffff")}
        >
          Search
        </a>
        <a
          href="/map"
          style={{
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "20px", // Increased font size
            fontWeight: "bold",
            transition: "color 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#f97316")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#ffffff")}
        >
          Map
        </a>
      </nav>
    </header>
  );
}