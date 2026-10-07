// Weather proxy: used when the phone cannot reach the weather service directly.
exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  try {
    let la = parseFloat(q.lat), lo = parseFloat(q.lon), name = "My location";
    if (q.q) {
      const g = await (await fetch("https://geocoding-api.open-meteo.com/v1/search?count=1&language=en&format=json&name=" + encodeURIComponent(String(q.q).slice(0, 80)))).json();
      if (!g.results || !g.results.length) return { statusCode: 404, body: JSON.stringify({ error: "place" }) };
      const p = g.results[0]; la = p.latitude; lo = p.longitude; name = p.name + (p.country ? ", " + p.country : "");
    }
    if (isNaN(la) || isNaN(lo)) return { statusCode: 400, body: "Bad request" };
    const url = "https://api.open-meteo.com/v1/forecast?latitude=" + la + "&longitude=" + lo + "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=7";
    const f = await (await fetch(url)).json();
    return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify(q.q ? { name, forecast: f } : f) };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: "weather" }) };
  }
};
