const Shell = require("../models/Shell.model");

const shellSeed = [
  { name: "Harlow", locationName: "Harlow", lat: 51.772938, lon: 0.10231 }, //  [oai_citation:10‡Latlong](https://www.latlong.net/place/harlow-essex-uk-9682.html?utm_source=chatgpt.com)
  { name: "Enfield", locationName: "Enfield", lat: 51.654827, lon: -0.083599 }, //  [oai_citation:11‡Latlong](https://www.latlong.net/place/enfield-uk-1269.html?utm_source=chatgpt.com)
  { name: "Buckhurst hill", locationName: "Buckhurst Hill", lat: 51.6241, lon: 0.0326 }, //  [oai_citation:12‡latitude.to](https://latitude.to/map/gb/united-kingdom/cities/buckhurst-hill?utm_source=chatgpt.com)
  { name: "Broxbourne", locationName: "Broxbourne", lat: 51.7471, lon: -0.0192 }, //  [oai_citation:13‡latitude.to](https://latitude.to/map/gb/united-kingdom/cities/broxbourne?utm_source=chatgpt.com)
  { name: "sawbridgeworth", locationName: "Sawbridgeworth", lat: 51.8167, lon: 0.15 }, //  [oai_citation:14‡latitude.to](https://latitude.to/map/gb/united-kingdom/cities/sawbridgeworth?utm_source=chatgpt.com)
  { name: "Epping", locationName: "Epping", lat: 51.69815, lon: 0.11055 }, //  [oai_citation:15‡latitude.to](https://latitude.to/map/gb/united-kingdom/cities/epping?utm_source=chatgpt.com)

  // your two postcodes (exact)
  { name: "Half moon", locationName: "CM16 4AE", lat: 51.69657, lon: 0.10827 }, //  [oai_citation:16‡Doogal](https://www.doogal.co.uk/ShowMap?postcode=CM16+4AE&utm_source=chatgpt.com)
  { name: "Bullsmoor", locationName: "EN1 4SB", lat: 51.680292, lon: -0.04945 }, //  [oai_citation:17‡Doogal](https://www.doogal.co.uk/ShowMap?postcode=EN1+4SB&utm_source=chatgpt.com)
];

async function seedShells() {
  for (const s of shellSeed) {
    await Shell.updateOne(
      { name: s.name },
      { $set: { ...s, isActive: true } },
      { upsert: true }
    );
  }
  return Shell.find({}).lean();
}

module.exports = { seedShells, shellSeed };