"use client";

import React, { useState } from "react";
import Link from "next/link"; // Import Link for navigation
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import foodbanks from "../../data/foodbanks_with_geocodes.json"; // Import the JSON data

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResults, setFilteredResults] = useState(foodbanks);

  // Filters state
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedFrequencies, setSelectedFrequencies] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>(
    []
  );

  // Function to handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    applyFilters(term, selectedRegions, selectedFrequencies, selectedServices, selectedAccessibility);
  };

  // Function to apply filters
  const applyFilters = (
    term: string,
    regions: string[],
    frequencies: string[],
    services: string[],
    accessibility: string[]
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

      const matchesAccessibility =
        accessibility.length === 0 ||
        accessibility.some((option) =>
          foodbank.accessibilityOptions
            ?.map((a: string) => a.toLowerCase())
            .includes(option.toLowerCase())
        );

      return (
        matchesSearchTerm &&
        matchesRegion &&
        matchesFrequency &&
        matchesService &&
        matchesAccessibility
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
        break;
      case "frequency":
        updatedFilters = isChecked
          ? [...selectedFrequencies, value]
          : selectedFrequencies.filter((frequency) => frequency !== value);
        setSelectedFrequencies(updatedFilters);
        break;
      case "service":
        updatedFilters = isChecked
          ? [...selectedServices, value]
          : selectedServices.filter((service) => service !== value);
        setSelectedServices(updatedFilters);
        break;
      case "accessibility":
        updatedFilters = isChecked
          ? [...selectedAccessibility, value]
          : selectedAccessibility.filter((option) => option !== value);
        setSelectedAccessibility(updatedFilters);
        break;
    }

    applyFilters(searchTerm, updatedFilters, selectedFrequencies, selectedServices, selectedAccessibility);
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
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "48px", // Increased font size for the title
            fontWeight: "bold",
            color: "#2c5f2d",
            marginBottom: "20px",
          }}
        >
          Search Food Banks
        </h1>
        <p
          style={{
            fontSize: "24px", // Increased font size for the description
            color: "#4b5563",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          Use the search bar or filters below to find food banks that meet your
          needs.
        </p>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by name, region, frequency, or services..."
          value={searchTerm}
          onChange={handleSearch}
          style={{
            width: "100%",
            maxWidth: "800px",
            padding: "15px 20px",
            fontSize: "18px",
            border: "5px solid black", // 3xl black outline
            borderRadius: "25px",
            background: "white",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
            color: "black",
            outline: "none",
            transition: "box-shadow 0.3s, transform 0.3s",
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.2)";
            e.target.style.transform = "scale(1.02)";
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.1)";
            e.target.style.transform = "scale(1)";
          }}
        />

        {/* Filters Section */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "30px",
            justifyContent: "center",
            marginTop: "20px",
            padding: "20px",
            border: "5px solid black", // 3xl black outline for filters section
            borderRadius: "12px",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Region Filters */}
          <div style={{ padding: "10px" }}>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#000000",
                marginBottom: "10px",
              }}
            >
              Region
            </h3>
            <label style={{ display: "block", marginBottom: "10px", fontSize: "18px", color: "black" }}>
              <input
                type="checkbox"
                onChange={(e) =>
                  handleCheckboxChange("region", "DC Ward 8", e.target.checked)
                }
              />
              DC Ward 8
            </label>
            <label style={{ display: "block", marginBottom: "10px", fontSize: "18px", color: "black" }}>
              <input
                type="checkbox"
                onChange={(e) =>
                  handleCheckboxChange("region", "DC Ward 7", e.target.checked)
                }
              />
              DC Ward 7
            </label>
          </div>

          {/* Frequency Filters */}
          <div style={{ padding: "10px", color: "black"}}>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#000000",
                marginBottom: "10px",
              }}
            >
              Frequency
            </h3>
            <label style={{ display: "block", marginBottom: "10px", fontSize: "18px" }}>
              <input
                type="checkbox"
                onChange={(e) =>
                  handleCheckboxChange("frequency", "Weekly", e.target.checked)
                }
              />
              Weekly
            </label>
            <label style={{ display: "block", marginBottom: "10px", fontSize: "18px" }}>
              <input
                type="checkbox"
                onChange={(e) =>
                  handleCheckboxChange("frequency", "Monthly", e.target.checked)
                }
              />
              Monthly
            </label>
          </div>

          {/* Service Filters */}
          <div style={{ padding: "10px" }}>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#000000",
                marginBottom: "10px",
              }}
            >
              Services
            </h3>
            <label style={{ display: "block", marginBottom: "10px", fontSize: "18px" }}>
              <input
                type="checkbox"
                onChange={(e) =>
                  handleCheckboxChange("service", "Walk-up", e.target.checked)
                }
              />
              Walk-up
            </label>
            <label style={{ display: "block", marginBottom: "10px", fontSize: "18px" }}>
              <input
                type="checkbox"
                onChange={(e) =>
                  handleCheckboxChange("service", "Drive-thru", e.target.checked)
                }
              />
              Drive-thru
            </label>
          </div>

          {/* Accessibility Filters */}
          <div style={{ padding: "10px" }}>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#000000",
                marginBottom: "10px",
              }}
            >
              Accessibility
            </h3>
            <label style={{ display: "block", marginBottom: "10px", fontSize: "18px" }}>
              <input
                type="checkbox"
                onChange={(e) =>
                  handleCheckboxChange(
                    "accessibility",
                    "Wheelchair Accessible",
                    e.target.checked
                  )
                }
              />
              Wheelchair Accessible
            </label>
            <label style={{ display: "block", marginBottom: "10px", fontSize: "18px" }}>
              <input
                type="checkbox"
                onChange={(e) =>
                  handleCheckboxChange(
                    "accessibility",
                    "Public Transport Nearby",
                    e.target.checked
                  )
                }
              />
              Public Transport Nearby
            </label>
          </div>
        </div>

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
                border: "5px solid black", // 3xl black outline for food bank cards
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