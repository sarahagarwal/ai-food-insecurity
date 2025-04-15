import React from "react";


export default function Home() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f7f7f7" }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "20px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>Food Bank Login</h1>
        <form>
          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="email" style={{ display: "block", marginBottom: "5px", color: "#555" }}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
              required
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="password" style={{ display: "block", marginBottom: "5px", color: "#555" }}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
              required
            />
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>
        <p style={{ marginTop: "15px", textAlign: "center", color: "#777" }}>
          Don't have an account? <a href="/register" style={{ color: "#007bff" }}>Register here</a>
        </p>
      </div>
    </div>
  );
}
