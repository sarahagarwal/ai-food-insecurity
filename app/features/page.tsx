"use client";

import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function FeaturesPage() {
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
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "36px",
            fontWeight: "bold",
            color: "#2c5f2d",
            marginBottom: "20px",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Features
        </h1>
        <p
          style={{
            fontSize: "20px",
            color: "#4b5563",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          Learn about the features we offer to support our mission.
        </p>
      </main>
      <Footer />
    </div>
  );
}