const fs = require("fs");
const path = require("path");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require("dotenv").config();

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const inputPath = path.join(__dirname, "../data/cleaned_combined_foodbanks.json");
const outputPath = path.join(__dirname, "../data/foodbanks_with_geocodes.json");

const data = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

// === Clean name if duplicate ===
function cleanName(name) {
  if (!name.includes(" : ")) return name;
  const [left, right] = name.split(" : ").map(s => s.trim());
  return left === right ? left : name;
}

// Geocode address using Google Maps API
async function geocode(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();

  if (json.status === "OK" && json.results.length > 0) {
    const loc = json.results[0].geometry.location;
    return { lat: loc.lat, lng: loc.lng };
  } else {
    console.warn(`⚠️ Could not geocode: ${address}`);
    return { lat: null, lng: null };
  }
}

// Main loop
(async () => {
  for (const entry of data) {
    // Clean up duplicate names like "X : X"
    entry.name = cleanName(entry.name || "");

    // Only geocode if lat/lng missing
    if (!entry.lat || !entry.lng) {
      const rawAddress = entry.address || "";

      if (!rawAddress.trim()) {
        console.warn(`⛔ No address to geocode for: ${entry.name}`);
        continue;
      }

      const cleanedAddress = rawAddress
        .replace(/^Attn:\s*/i, "")
        .replace(/[^a-zA-Z0-9\s,.#\-]/g, "") // remove strange chars
        .replace(/\s+/g, " ") // normalize spaces
        .trim();

      console.log(`📦 Trying to geocode: "${cleanedAddress}"`);

      const coords = await geocode(cleanedAddress);

      entry.lat = coords.lat;
      entry.lng = coords.lng;

      console.log(`📍 Result: ${coords.lat}, ${coords.lng}`);
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log("✅ Done! Saved with geocodes to foodbanks_with_geocodes.json");
})();
