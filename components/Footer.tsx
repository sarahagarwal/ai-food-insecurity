"use client";

import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        padding: "20px 40px",
        backgroundColor: "#2c5f2d", // Dark green for the footer
        color: "#ffffff",
        textAlign: "center",
        fontFamily: "'Inter', sans-serif",
        marginTop: "40px",
      }}
    >
      <p style={{ fontSize: "14px" }}>
        © 2025 Food Bank. All rights reserved. |{" "}
        <a
          href="/privacy"
          style={{
            color: "#f97316",
            textDecoration: "underline",
            transition: "color 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#ea580c")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#f97316")}
        >
          Privacy Policy
        </a>
      </p>
    </footer>
  );
}