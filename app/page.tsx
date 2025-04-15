"use client";

import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";

export default function HomePage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fef6e4 0%, #f8e2c8 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Header />
      <main
        style={{
          flex: "1",
          width: "100%",
          maxWidth: "1200px",
          padding: "4rem 2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "3rem",
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            textAlign: "center",
            maxWidth: "800px",
            animation: "fadeIn 0.8s ease-out",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4rem)",
              fontWeight: "bold",
              color: "#2c5f2d",
              marginBottom: "1.5rem",
              lineHeight: "1.2",
              textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            Welcome to Food Bank Finder
          </h1>
          <p
            style={{
              fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)",
              color: "#4b5563",
              lineHeight: "1.6",
              marginBottom: "2rem",
            }}
          >
            Easily find food banks near you and access resources to fight food insecurity.
          </p>
          <Link
            href="/search"
            style={{
              display: "inline-block",
              padding: "1rem 2rem",
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "white",
              backgroundColor: "#2c5f2d",
              borderRadius: "50px",
              border: "3px solid black",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
            }}
          >
            Find Food Banks Near You
          </Link>
        </div>

        {/* Features Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
            width: "100%",
            padding: "2rem",
          }}
        >
          {[
            {
              title: "Easy Search",
              description: "Find food banks by location and availability",
              icon: "🔍",
            },
            {
              title: "Updated Information",
              description: "Access current operating hours and services",
              icon: "📅",
            },
            {
              title: "Community Support",
              description: "Connect with local food assistance programs",
              icon: "🤝",
            },
          ].map((feature, index) => (
            <div
              key={index}
              style={{
                padding: "2rem",
                backgroundColor: "white",
                borderRadius: "20px",
                border: "4px solid black",
                boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                {feature.icon}
              </div>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: "#2c5f2d",
                  marginBottom: "1rem",
                }}
              >
                {feature.title}
              </h2>
              <p style={{ fontSize: "1.1rem", color: "#4b5563" }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
