"use client";

import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function MapPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#fef6e4",
      }}
    >
      <Header />
      <main
        style={{
          flex: "1",
          width: "100%",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "36px", fontWeight: "bold", color: "#2c5f2d" }}>
          Interactive Map
        </h1>
        <p style={{ fontSize: "20px", color: "#4b5563" }}>
          View nearby food banks on an interactive map.
        </p>
      </main>
      <Footer />
    </div>
  );
}