"use client";

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import Image from "next/image";

const facts = [
  "1 in 6 DC area residents work with local food resources to supplement their groceries",
  "Community food programs help save over 100 million pounds of food from waste annually",
  "Local food banks work directly with farmers to provide fresh, seasonal produce",
  "Thousands of DC residents volunteer at food banks, creating a stronger community"
];

export default function HomePage() {
  const [currentFact, setCurrentFact] = useState(0);
  const [isFactVisible, setIsFactVisible] = useState(true);

  const rotateFact = () => {
    setIsFactVisible(false);
    setTimeout(() => {
      setCurrentFact((prev) => (prev + 1) % facts.length);
      setIsFactVisible(true);
    }, 300);
  };

  useEffect(() => {
    const timer = setInterval(rotateFact, 5000);
    return () => clearInterval(timer);
  }, []);

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
        padding: "2rem",
      }}
    >
      <Header />
      <main
        style={{
          flex: "1",
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2.5rem", // Reduced from 3rem
          paddingTop: "2rem", // Reduced from 4rem
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            width: "100%",
            padding: "3.5rem 3rem", // Reduced from 4rem
            marginTop: "1rem", // Reduced from 2rem
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "30px",
            border: "4px solid #2c5f2d",
            boxShadow: "0 20px 40px rgba(44, 95, 45, 0.15)",
            textAlign: "center",
            animation: "fadeInDown 1s ease forwards", // Changed animation
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "6px",
              background: "linear-gradient(90deg, #2c5f2d, #3a7c3b, #2c5f2d)",
              animation: "shimmer 2s infinite linear",
            }}
          />
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
              fontWeight: "bold",
              background: "linear-gradient(45deg, #2c5f2d, #3a7c3b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "1.5rem",
              lineHeight: "1.1",
              textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            DC Food Resources
          </h1>
          <p
            style={{
              fontSize: "1.5rem",
              color: "#333",
              lineHeight: "1.8",
              marginBottom: "2.5rem",
              maxWidth: "800px",
              margin: "0 auto 2.5rem",
            }}
          >
            Connecting our community with local food resources. Browse available programs and find support near you.
          </p>
          <Link
            href="/search"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "1.25rem 2.5rem",
              fontSize: "1.25rem",
              background: "linear-gradient(45deg, #2c5f2d, #3a7c3b)",
              color: "white",
              borderRadius: "50px",
              textDecoration: "none",
              transition: "all 0.3s ease",
              border: "3px solid #2c5f2d",
              boxShadow: "0 10px 20px rgba(44, 95, 45, 0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 15px 30px rgba(44, 95, 45, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 10px 20px rgba(44, 95, 45, 0.2)";
            }}
          >
            Find Resources →
          </Link>
        </div>

        {/* Interactive Facts Section */}
        <div
          style={{
            width: "100%",
            padding: "2rem",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            border: "4px solid #2c5f2d",
            boxShadow: "0 15px 30px rgba(44, 95, 45, 0.15)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            transform: isFactVisible ? "translateY(0)" : "translateY(10px)",
            opacity: isFactVisible ? 1 : 0,
          }}
          onClick={rotateFact}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 20px 40px rgba(44, 95, 45, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 15px 30px rgba(44, 95, 45, 0.15)";
          }}
        >
          <p
            style={{
              fontSize: "1.5rem",
              textAlign: "center",
              color: "#2c5f2d",
              margin: 0,
              fontWeight: "500",
              transition: "opacity 0.3s ease",
            }}
          >
            {facts[currentFact]}
          </p>
        </div>

        {/* Resource Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem",
            width: "100%",
          }}
        >
          {[
            {
              title: "Community Resources",
              description: "Access nutritious food through our network of local food banks and community partners",
              icon: "🏠",
            },
            {
              title: "Simple Process",
              description: "Quick and dignified access to food assistance - everyone is welcome",
              icon: "✨",
            },
            {
              title: "Stronger Together",
              description: "Join a caring community committed to food security for all neighbors",
              icon: "🤝",
            },
          ].map((feature, index) => (
            <div
              key={index}
              style={{
                padding: "2.5rem",
                backgroundColor: "white",
                borderRadius: "24px",
                border: "4px solid black",
                boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
                e.currentTarget.style.borderColor = "#2c5f2d";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
                e.currentTarget.style.borderColor = "black";
              }}
            >
              <div style={{ fontSize: "3.5rem", marginBottom: "1.5rem" }}>
                {feature.icon}
              </div>
              <h2
                style={{
                  fontSize: "1.75rem",
                  fontWeight: "bold",
                  color: "#2c5f2d",
                  marginBottom: "1rem",
                }}
              >
                {feature.title}
              </h2>
              <p
                style={{
                  fontSize: "1.2rem",
                  color: "#4b5563",
                  lineHeight: "1.6",
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mission Statement */}
        <div
          style={{
            textAlign: "center",
            maxWidth: "900px",
            padding: "3rem",
            background: "white",
            borderRadius: "24px",
            border: "4px solid black",
            boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#2c5f2d",
              marginBottom: "1.5rem",
            }}
          >
            Our Community Promise
          </h2>
          <p
            style={{
              fontSize: "1.25rem",
              color: "#4b5563",
              lineHeight: "1.8",
            }}
          >
            We believe that access to healthy food is a fundamental right. Our mission is to create a welcoming, respectful environment where everyone can access the nutrition they need to thrive.
          </p>
        </div>

        {/* Add these animations to your global styles */}
        <style jsx global>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }

          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </main>
      <Footer />
    </div>
  );
}
