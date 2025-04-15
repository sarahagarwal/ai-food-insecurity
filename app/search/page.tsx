"use client";

import React, { useState } from "react";
import Link from "next/link"; // Import Link for navigation
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import foodbanks from "../../data/foodbanks_with_geocodes.json"; // Import the JSON data

// Add these helper functions after your imports
function getUniqueValues(data: any[], key: string): string[] {
  const values = new Set<string>();
  
  data.forEach(item => {
    if (Array.isArray(item[key])) {
      item[key].forEach((value: string) => values.add(value));
    } else if (item[key]) {
      values.add(item[key]);
    }
  });

  return Array.from(values).sort();
}

// Update the getFilterOptions function to use actual data
function getFilterOptions(category: string): string[] {
  switch (category) {
    case "Region":
      return getUniqueValues(foodbanks, "region");
    case "Frequency":
      return getUniqueValues(foodbanks, "frequency");
    case "Services":
      return getUniqueValues(foodbanks, "services");
    default:
      return [];
  }
}

// First, update the filterCategories array to remove Services
const filterCategories = ["Region", "Frequency"].filter(category => 
  getFilterOptions(category).length > 0
);

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState(foodbanks);

  // Filters state
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedFrequencies, setSelectedFrequencies] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Function to handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    applyFilters(term, selectedRegions, selectedFrequencies, selectedServices);
  };

  // Function to apply filters
  const applyFilters = (
    term: string,
    regions: string[],
    frequencies: string[],
    services: string[]
  ) => {
    const filtered = foodbanks.filter((foodbank) => {
      const matchesSearchTerm =
        foodbank.name.toLowerCase().includes(term) ||
        foodbank.region.toLowerCase().includes(term) ||
        foodbank.frequency.toLowerCase().includes(term) ||
        foodbank.services.some((service: string) =>
          service.toLowerCase().includes(term)
        );

      const matchesRegion =
        regions.length === 0 || regions.includes(foodbank.region);

      const matchesFrequency =
        frequencies.length === 0 || frequencies.includes(foodbank.frequency);

      const matchesService =
        services.length === 0 ||
        services.some((service) =>
          foodbank.services.map((s: string) => s.toLowerCase()).includes(service.toLowerCase())
        );

      return (
        matchesSearchTerm &&
        matchesRegion &&
        matchesFrequency &&
        matchesService
      );
    });

    setFilteredResults(filtered);
  };

  // Function to handle checkbox changes
  const handleCheckboxChange = (
    filterType: string,
    value: string,
    isChecked: boolean
  ) => {
    let updatedFilters: string[] = [];

    switch (filterType) {
      case "region":
        updatedFilters = isChecked
          ? [...selectedRegions, value]
          : selectedRegions.filter((region) => region !== value);
        setSelectedRegions(updatedFilters);
        applyFilters(searchTerm, updatedFilters, selectedFrequencies, selectedServices);
        break;
      case "frequency":
        updatedFilters = isChecked
          ? [...selectedFrequencies, value]
          : selectedFrequencies.filter((frequency) => frequency !== value);
        setSelectedFrequencies(updatedFilters);
        applyFilters(searchTerm, selectedRegions, updatedFilters, selectedServices);
        break;
      case "service":
        updatedFilters = isChecked
          ? [...selectedServices, value]
          : selectedServices.filter((service) => service !== value);
        setSelectedServices(updatedFilters);
        applyFilters(searchTerm, selectedRegions, selectedFrequencies, updatedFilters);
        break;
    }
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
          flex: "1",
          width: "100%",
          maxWidth: "1200px",
          padding: "40px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "30px",
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "40px",
            padding: "40px",
            borderRadius: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            border: "5px solid black",
            width: "100%",
          }}
        >
          <h1
            style={{
              fontSize: "56px",
              fontWeight: "bold",
              color: "#000000",
              marginBottom: "20px",
              lineHeight: "1.2",
            }}
          >
            Search Food Banks
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "#000000",
              maxWidth: "800px",
              margin: "0 auto",
              lineHeight: "1.5",
            }}
          >
            Use the search bar or filters below to find food banks that meet your needs.
          </p>
        </div>

        {/* Filters Section - Moved up */}
        <div
          style={{
            width: "100%",
            maxWidth: "900px", // Match search bar width
            padding: "10px",
            border: "3px solid black",
            borderRadius: "25px",
            backgroundColor: "white",
            boxShadow: "0 10px 12px rgba(0, 0, 0, 0.1)",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {/* Region Filter */}
            <div
              style={{
                width: "100%",
                padding: "8px",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
                border: "2px solid black",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#000000",
                  marginBottom: "6px",
                  textAlign: "center",
                }}
              >
                Region
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "0 10px",
                }}
              >
                {getFilterOptions("Region").map((option) => (
                  <label
                    key={option}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "13px",
                      color: "#000000",
                      padding: "2px 8px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      minWidth: "120px", // Ensure consistent width
                    }}
                  >
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        handleCheckboxChange("region", option, e.target.checked)
                      }
                      style={{ 
                        marginRight: "4px",
                        width: "12px",
                        height: "12px",
                      }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            {/* Frequency Filter */}
            <div
              style={{
                width: "100%",
                padding: "8px",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
                border: "2px solid black",
              }}
            >
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#000000",
                  marginBottom: "6px",
                  textAlign: "center",
                }}
              >
                Frequency
              </h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "0 10px",
                }}
              >
                {getFilterOptions("Frequency").map((option) => (
                  <label
                    key={option}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "13px",
                      color: "#000000",
                      padding: "2px 8px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      minWidth: "120px", // Ensure consistent width
                    }}
                  >
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        handleCheckboxChange("frequency", option, e.target.checked)
                      }
                      style={{ 
                        marginRight: "4px",
                        width: "12px",
                        height: "12px",
                      }}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Search Input - Moved down */}
        <input
          type="text"
          placeholder="Search by name, region, frequency, or services..."
          value={searchTerm}
          onChange={handleSearch}
          style={{
            width: "100%",
            maxWidth: "900px",
            padding: "20px 30px",
            fontSize: "20px",
            border: "5px solid black",
            borderRadius: "30px",
            background: "white",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
            color: "black",
            outline: "none",
            transition: "all 0.3s ease",
          }}
          onFocus={(e) => {
            e.target.style.transform = "scale(1.02)";
            e.target.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.15)";
          }}
          onBlur={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.1)";
          }}
        />

        {/* Results Section */}
        <div
          style={{
            width: "100%",
            maxWidth: "1200px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {filteredResults.map((foodbank) => (
            <div
              key={foodbank.id}
              style={{
                padding: "20px",
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
                border: "5px solid black",
                textAlign: "left",
              }}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#2c5f2d",
                  marginBottom: "10px",
                }}
              >
                {foodbank.name}
              </h2>
              <p style={{ fontSize: "16px", color: "#4b5563" }}>
                <strong>Address:</strong> {foodbank.address}
              </p>
              <p style={{ fontSize: "16px", color: "#4b5563" }}>
                <strong>Phone:</strong> {foodbank.phone}
              </p>
              <p style={{ fontSize: "16px", color: "#4b5563" }}>
                <strong>Region:</strong> {foodbank.region}
              </p>
              <p style={{ fontSize: "16px", color: "#4b5563" }}>
                <strong>Frequency:</strong> {foodbank.frequency}
              </p>
              <p style={{ fontSize: "16px", color: "#4b5563" }}>
                <strong>Services:</strong>{" "}
                {foodbank.services.length > 0
                  ? foodbank.services.join(", ")
                  : "N/A"}
              </p>
              <p style={{ fontSize: "16px", color: "#4b5563" }}>
                <strong>Accessibility:</strong>{" "}
                {foodbank.accessibilityOptions?.length > 0
                  ? foodbank.accessibilityOptions.join(", ")
                  : "N/A"}
              </p>
              {/* More Info Button */}
              <Link href={`/foodbank/${foodbank.id}`}>
                <button
                  style={{
                    marginTop: "10px",
                    padding: "10px 20px",
                    backgroundColor: "#2c5f2d",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#1e4620")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "#2c5f2d")
                  }
                >
                  More Info
                </button>
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}