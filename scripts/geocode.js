const fs = require("fs");
const path = require("path");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require("dotenv").config();

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const inputPath = path.join(__dirname, "../data/cleaned_combined_foodbanks.json");
const outputPath = path.join(__dirname, "../data/foodbanks_with_geocodes.json");

const data = JSON.parse(fs.readFileSync(inputPath, "utf-8"));

async function geocode(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${API_KEY}`;

  const res = await fetch(url);
  const json = await res.json();

  if (json.status === "OK") {
    const loc = json.results[0].geometry.location;
    return { lat: loc.lat, lng: loc.lng };
  } else {
    console.warn(`⚠️ Could not geocode: ${address}`);
    return { lat: null, lng: null };
  }
}

(async () => {
    for (const entry of data) {
      if (!entry.lat || !entry.lng) {
        const rawAddress = entry.address || "";
        const cleanedAddress = rawAddress
          .replace(/^Attn:\s*/i, "")
          .replace(/[^a-zA-Z0-9\s,.#\-]/g, "") // remove weird characters
          .replace(/\s+/g, " ") // normalize spacing
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
  