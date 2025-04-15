const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const dataFolder = path.join(__dirname, "../data");

// Load Excel sheet as JSON
function loadSheet(filename) {
  const workbook = XLSX.readFile(path.join(dataFolder, filename));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
}

// Load all files
const hours = [
  ...loadSheet("CAFB_Shopping_Partners_HOO.xlsx"),
  ...loadSheet("CAFB_Markets_HOO.xlsx"),
];
const cultures = [
  ...loadSheet("CAFB_Shopping_Partners_Cultures_Served.xlsx"),
  ...loadSheet("CAFB_Markets_Cultures_Served.xlsx"),
];
const services = [
  ...loadSheet("CAFB_Shopping_Partners_Wraparound_Services.xlsx"),
  ...loadSheet("CAFB_Markets_Wraparound_Services.xlsx"),
];

// Group by Name or External ID
const foodbanks = {};

hours.forEach(entry => {
  const key = entry["Name"] || entry["External ID"];
  if (!foodbanks[key]) {
    foodbanks[key] = {
      name: entry["Name"] || "",
      address: entry["Shipping Address"] || "",
      phone: entry["Phone"] || "",
      region: entry["County/Ward"] || "",
      hours: [],
      cultures: [],
      services: [],
    };
  }
  const hoursString = `${entry["Day of Week"] || ""} ${entry["Monthly Options"] || ""}: ${entry["Starting Time"] || ""} - ${entry["Ending Time"] || ""}`;
  foodbanks[key].hours.push(hoursString.trim());
});

cultures.forEach(entry => {
  const key = entry["Name"] || entry["External ID"];
  if (foodbanks[key]) {
    foodbanks[key].cultures.push(entry["Culture"] || entry["Culture Served"] || "");
  }
});

services.forEach(entry => {
  const key = entry["Name"] || entry["External ID"];
  if (foodbanks[key]) {
    foodbanks[key].services.push(entry["Service Type"] || entry["Wraparound Service"] || "");
  }
});

// Save result
const final = Object.values(foodbanks);
fs.writeFileSync(path.join(dataFolder, "cleaned_combined_foodbanks.json"), JSON.stringify(final, null, 2));
console.log("✅ Cleaned data saved to cleaned_combined_foodbanks.json");
