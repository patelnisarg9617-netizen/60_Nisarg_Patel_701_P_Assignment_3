const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Backend calls free Open-Meteo API
app.get("/api/weather", async (req, res) => {
  try {
    const city = req.query.city || "Surat";

    // Demo coordinates for common cities
    const cities = {
      Surat: { latitude: 21.1702, longitude: 72.8311 },
      Mumbai: { latitude: 19.0760, longitude: 72.8777 },
      Delhi: { latitude: 28.6139, longitude: 77.2090 },
      Ahmedabad: { latitude: 23.0225, longitude: 72.5714 },
      Bengaluru: { latitude: 12.9716, longitude: 77.5946 }
    };

    const location = cities[city] || cities.Surat;

    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${location.latitude}` +
      `&longitude=${location.longitude}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m` +
      `&timezone=auto`;

    const response = await fetch(url);
    const data = await response.json();

    res.json({
      city,
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      unit: data.current_units
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to get weather data"
    });
  }
});

app.get("/", (req, res) => {
  res.send("Q6 Backend is running");
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});