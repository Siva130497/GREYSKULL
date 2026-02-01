const Shell = require("../models/Shell.model");

function mapWeatherCode(code) {
  // Open-Meteo weather codes mapping (basic)
  if (code === 0) return { label: "Clear", theme: "clear" };
  if ([1, 2, 3].includes(code)) return { label: "Cloudy", theme: "cloudy" };
  if ([45, 48].includes(code)) return { label: "Fog", theme: "fog" };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: "Drizzle", theme: "rain" };
  if ([61, 63, 65, 66, 67].includes(code)) return { label: "Rain", theme: "rain" };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: "Snow", theme: "snow" };
  if ([80, 81, 82].includes(code)) return { label: "Showers", theme: "rain" };
  if ([95, 96, 99].includes(code)) return { label: "Thunder", theme: "storm" };
  return { label: "Weather", theme: "cloudy" };
}

async function getShellWeather(req, res, next) {
  try {
    const { shellId } = req.query;
    if (!shellId) return res.status(400).json({ ok: false, message: "shellId is required" });

    const shell = await Shell.findById(shellId).lean();
    if (!shell) return res.status(404).json({ ok: false, message: "SHELL_NOT_FOUND" });

    if (shell.lat == null || shell.lon == null) {
      return res.status(400).json({
        ok: false,
        message: "SHELL_LOCATION_MISSING",
        data: { shellId, hint: "Set shell.lat and shell.lon in DB to enable weather banner." }
      });
    }

    // Node 18+ has fetch built-in
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${shell.lat}&longitude=${shell.lon}` +
      `&current=temperature_2m,weather_code,wind_speed_10m` +
      `&timezone=auto`;

    const r = await fetch(url);
    if (!r.ok) throw new Error("WEATHER_API_FAILED");
    const json = await r.json();

    const current = json.current || {};
    const mapped = mapWeatherCode(current.weather_code);

    return res.json({
      ok: true,
      message: "SUCCESS",
      data: {
        shell: { _id: shell._id, name: shell.name, locationName: shell.locationName, lat: shell.lat, lon: shell.lon },
        current: {
          tempC: current.temperature_2m,
          windKmh: current.wind_speed_10m,
          weatherCode: current.weather_code,
          label: mapped.label,
          theme: mapped.theme,
          time: current.time
        }
      }
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { getShellWeather };