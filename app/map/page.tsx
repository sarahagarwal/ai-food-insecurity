"use client";

import React from "react";
import dynamic from "next/dynamic";
import foodBankData from "@/data/foodbanks_with_geocodes.json";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useLanguage } from "../../context/LanguageContext";

export default function MapPage() {
  const { t } = useLanguage();
  
  const MapComponent = dynamic(() => import("@/components/MapComponent"), {
    ssr: false,
    loading: () => (
      <div style={{ 
        width: "100%", 
        height: "800px", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        background: "#f0f0f0",
        borderRadius: "15px"
      }}>
        {t("map.loading")}...
      </div>
    )
  });

  const activeLocations = foodBankData.filter((loc) => loc.status === "Active");

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fef6e4 0%, #f8e2c8 100%)",
      fontFamily: "'Inter', sans-serif",
    }}>
      <Header />
      <main style={{
        flex: 1,
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2rem"
      }}>
        <div style={{
          textAlign: "center",
          padding: "3rem",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "30px",
          
          boxShadow: "0 20px 40px rgba(44, 95, 45, 0.15)",
          width: "100%",
          maxWidth: "800px",
        }}>
          <h1 style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            color: "#2c5f2d",
            marginBottom: "1.5rem"
          }}>
            {t("locations.title")}
          </h1>
          <p style={{
            fontSize: "1.25rem",
            color: "#4b5563",
            lineHeight: "1.6"
          }}>
            {t("locations.description")}
          </p>
        </div>
        {/* Map Container */}
        <div style={{
          width: "100%",
          height: "800px",
          borderRadius: "20px",
          border: "4px solid #2c5f2d",
          overflow: "hidden",
          boxShadow: "0 15px 30px rgba(44, 95, 45, 0.15)",
          transition: "all 0.3s ease",
          position: "relative"
        }}>
          <MapComponent locations={activeLocations} />
          
          {/* Map Controls */}
          <div style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "white",
            padding: "10px",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            zIndex: 1000
          }}>
            <h3 style={{ margin: "0 0 10px 0", color: "#2c5f2d" }}>
              {t("map.legend")}
            </h3>
            
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}


