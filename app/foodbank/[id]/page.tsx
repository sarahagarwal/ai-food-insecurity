"use client";

import React from "react";
import { useState, useEffect } from 'react'; 
import FeedbackForm from "../../../components/FeedbackForm";

import { useParams } from "next/navigation";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import foodbanks from "../../../data/foodbanks_with_geocodes.json"; // Import the JSON data
import { useLanguage } from "../../../context/LanguageContext";
import { translations } from "../../../translations/translations";

export default function FoodBankDetailsPage() {
  const { t } = useLanguage();
  const { id } = useParams(); // Get the dynamic ID from the URL
  const foodbank = foodbanks.find((fb) => fb.id.toString() === id); // Match the ID as a string

  if (!foodbank) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#fef6e4",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <Header />
        <main
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
            padding: "40px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <h1 style={{ fontSize: "24px", color: "#ff0000" }}>
            {t("foodbank.notFound")}
          </h1>
        </main>
        <Footer />
      </div>
    );
  }

  const sectionStyle = {
    marginBottom: "30px",
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s, box-shadow 0.3s",
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "scale(1.02)";
    e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.15)";
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#fef6e4",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Header />
      <main
        style={{
          padding: "40px",
          maxWidth: "900px",
          margin: "0 auto",
          color: "#4b5563",
        }}
      >
        {/* Food Bank Name */}
        <h1
          style={{
            fontSize: "36px",
            fontWeight: "bold",
            color: "#2c5f2d",
            marginBottom: "30px",
            textAlign: "center",
          }}
        >
          {foodbank.name}
        </h1>

        {/* Address Section */}
        <section
          style={sectionStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#2c5f2d",
              marginBottom: "10px",
            }}
          >
            {t("Address")}
          </h2>
          <p style={{ fontSize: "18px", margin: "0" }}>{foodbank.address}</p>
        </section>

        {/* Contact Section */}
        <section
          style={sectionStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#2c5f2d",
              marginBottom: "10px",
            }}
          >
            {t("Contact Information")}
          </h2>
          <p style={{ fontSize: "18px", margin: "0" }}>
            <strong>{t("Phone")}:</strong> {foodbank.phone}
          </p>
        </section>

        {/* General Information Section */}
        <section
          style={sectionStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#2c5f2d",
              marginBottom: "10px",
            }}
          >
            {t("General Information")}
          </h2>
          <p style={{ fontSize: "18px", margin: "0" }}>
            <strong>{t("Region")}:</strong> {foodbank.region}
          </p>
          <p style={{ fontSize: "18px", margin: "0" }}>
            <strong>{t("Frequency")}:</strong> {foodbank.frequency}
          </p>
        </section>

        {/* Services Section */}
        <section
          style={sectionStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#2c5f2d",
              marginBottom: "10px",
            }}
          >
            {t("Services Offered")}
          </h2>
          <p style={{ fontSize: "18px", margin: "0" }}>
            {foodbank.services.length > 0
              ? foodbank.services.join(", ")
              : t("foodbank.noServicesListed")}
          </p>
        </section>

        {/* Accessibility Section */}
        <section
          style={sectionStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#2c5f2d",
              marginBottom: "10px",
            }}
          >
            {t("Accessibility Options")}
          </h2>
          <p style={{ fontSize: "18px", margin: "0" }}>
            {foodbank.accessibilityOptions?.length > 0
              ? foodbank.accessibilityOptions.join(", ")
              : t("No Accessibility Options Listed")}
          </p>
        </section>

        {/* Description Section */}
        <section
          style={sectionStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#2c5f2d",
              marginBottom: "10px",
            }}
          >
            {t("Description")}
          </h2>
          <p style={{ fontSize: "18px", margin: "0" }}>
            {foodbank.description || t("No Description Available")}
          </p>
        </section>

        {/* Hours Section */}
        <section
          style={sectionStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#2c5f2d",
              marginBottom: "10px",
            }}
          >
            {t("foodbank.operatingHours")}
          </h2>
          <p style={{ fontSize: "18px", margin: "0" }}>
            {foodbank.hours?.length > 0
              ? foodbank.hours.join(", ")
              : t("No Operating Hours Listed")}
          </p>
        </section>

        {/* Location Section */}
        <section
          style={sectionStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#2c5f2d",
              marginBottom: "10px",
            }}
          >
            {t("Location")}
          </h2>
          <p style={{ fontSize: "18px", margin: "0" }}>
            <a
              href={`https://www.google.com/maps?q=${foodbank.lat},${foodbank.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#1d4ed8",
                textDecoration: "underline",
              }}
            >
              {t("foodbank.viewOnGoogleMaps")}
            </a>
          </p>
        </section>

        {/* Feedback Section - Now moved outside of the not found condition */}
        <section
          style={sectionStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#2c5f2d",
              marginBottom: "10px",
            }}
          >
            🗣️ Leave Feedback
          </h2>
          <FeedbackForm foodbankId={foodbank.id} />
        </section>
      </main>
      <Footer />
    </div>
  );
}