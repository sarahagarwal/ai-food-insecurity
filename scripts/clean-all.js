const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const dataFolder = path.join(__dirname, "../data");

// Load Excel to JSON
function loadSheet(filename) {
  const workbook = XLSX.readFile(path.join(dataFolder, filename));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
}

// Convert Excel time (decimal or Date) to HH:MM
function formatTime(t) {
  if (typeof t === "number") {
    const totalMinutes = Math.round(t * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  } else if (t instanceof Date) {
    return `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
  }
  return "";
}

// Load datasets
const datasets = {
  partnersHOO: loadSheet("CAFB_Shopping_Partners_HOO.xlsx"),
  partnersCultures: loadSheet("CAFB_Shopping_Partners_Cultures_Served.xlsx"),
  partnersServices: loadSheet("CAFB_Shopping_Partners_Wraparound_Services.xlsx"),
  marketsHOO: loadSheet("CAFB_Markets_HOO.xlsx"),
  marketsCultures: loadSheet("CAFB_Markets_Cultures_Served.xlsx"),
  marketsServices: loadSheet("CAFB_Markets_Wraparound_Services.xlsx"),
};

const foodbanks = {};

// Initialize record if not present
function ensureFoodbank(key, name = "") {
  if (!foodbanks[key]) {
    foodbanks[key] = {
      id: key,
      name,
      address: "",
      phone: "",
      region: "",
      status: "",
      last_verified: "",
      by_appointment: "",
      distribution_models: [],
      food_format: [],
      choice_options: [],
      frequency: "",
      hours_notes: "",
      hours: [],
      cultures: [],
      services: [],
      requirements: [],
    };
  }
}

// === Process HOO for Partners ===
datasets.partnersHOO.forEach(entry => {
  const key = entry["External ID"] || entry["Name"];
  if (!key) return;

  ensureFoodbank(key, entry["Name"]);
  const fb = foodbanks[key];

  fb.name = entry["Name"] || fb.name;
  fb.address = entry["Shipping Address"] || fb.address;
  fb.phone = entry["Phone"] || fb.phone;
  fb.region = entry["County/Ward"] || fb.region;
  fb.status = entry["Status"] || fb.status;
  fb.last_verified = entry["Date of Last Verification"] || fb.last_verified;
  fb.by_appointment = entry["By Appointment Only"] || fb.by_appointment;
  fb.frequency = entry["Monthly Options"] || fb.frequency;
  fb.hours_notes = entry["Additional Note on Hours of Operations"] || fb.hours_notes;

  if (entry["Distribution Models"]) fb.distribution_models.push(entry["Distribution Models"]);
  if (entry["Food Format "]) fb.food_format.push(entry["Food Format "]);
  if (entry["Food Pantry Requirements"]) fb.requirements.push(entry["Food Pantry Requirements"]);

  const dow = entry["Day of Week"];
  const start = formatTime(entry["Starting Time"]);
  const end = formatTime(entry["Ending Time"]);
  if (dow && start && end) {
    fb.hours.push(`${dow}: ${start} - ${end}`);
  }
});

// === Process HOO for Markets ===
datasets.marketsHOO.forEach(entry => {
  const key = entry["Agency ID"] || entry["Agency Name"];
  if (!key) return;

  ensureFoodbank(key, entry["Agency Name"]);
  const fb = foodbanks[key];

  fb.name = fb.name || entry["Agency Name"];
  fb.address = fb.address || entry["Shipping Address"];
  fb.frequency = entry["Frequency"] || fb.frequency;

  if (entry["Distribution Models"]) fb.distribution_models.push(entry["Distribution Models"]);
  if (entry["Food Format "]) fb.food_format.push(entry["Food Format "]);
  if (entry["Choice Options "]) fb.choice_options.push(entry["Choice Options "]);
  if (entry["Food Pantry Requirements"]) fb.requirements.push(entry["Food Pantry Requirements"]);

  const dow = entry["Day of Week"];
  const start = formatTime(entry["Starting Time"]);
  const end = formatTime(entry["Ending Time"]);
  if (dow && start && end) {
    fb.hours.push(`${dow}: ${start} - ${end}`);
  }
});

// === Add Cultures from both sheets ===
[datasets.partnersCultures, datasets.marketsCultures].forEach(data => {
  data.forEach(entry => {
    const key = entry["Agency ID"] || entry["Agency Name"] || entry["Company Name"];
    const culture = entry["Cultural Populations Served"];
    if (!key || !culture) return;

    ensureFoodbank(key);
    foodbanks[key].cultures.push(culture.trim());
  });
});

// === Add Services from both sheets ===
[datasets.partnersServices, datasets.marketsServices].forEach(data => {
  data.forEach(entry => {
    const key = entry["Agency ID"] || entry["Agency Name"];
    const service = entry["Wraparound Service"];
    if (!key || !service) return;

    ensureFoodbank(key);
    foodbanks[key].services.push(service.trim());
  });
});

// === Final cleanup ===
Object.values(foodbanks).forEach(fb => {
  const dedup = key => {
    fb[key] = [...new Set(fb[key])].filter(v => v && v !== "nan");
  };
  ["hours", "cultures", "services", "distribution_models", "food_format", "choice_options", "requirements"].forEach(dedup);
});

// === Save to file ===
const output = Object.values(foodbanks);
fs.writeFileSync(path.join(dataFolder, "cleaned_combined_foodbanks.json"), JSON.stringify(output, null, 2));
console.log("✅ Fully cleaned data saved to cleaned_combined_foodbanks.json");
