// Farm JARVIS AI endpoint: Claude + live web search. The API key stays on the server.
const BASE = "You are JARVIS, a brilliant, friendly assistant built into a farming app. Farming is your specialty (crops, livestock and poultry feeding and health, soil fertility, pests and diseases, irrigation, post-harvest handling, farm records, marketing and farm business), but you answer ANY question the farmer asks, on any topic, and you never say that you cannot help or that something is unavailable; if you lack current facts, say what is generally true and what to verify. Be warm and respectful and use the farmer's first name occasionally. Adapt advice to the farmer's location, season, farm type and the weather in the context; if the location is unknown, give general advice and ask where the farm is. Give the direct answer first, then short numbered practical steps with quantities, timings or ranges where you can, and state your assumptions. Use the farmer's own stock, task, weather and profit data when relevant. Safety: for pesticides and animal medicines, tell them to follow the product label, wear protective gear, respect withdrawal periods, and consult a local extension officer or vet for serious or uncertain cases. Never invent local prices, laws or brand-specific doses. Use web search when the question needs current facts such as prices, news, regulations or recent research, if a search tool is available. Write in plain simple words with no markdown symbols, under 180 words. After the answer, write a line exactly like 'Follow-ups: first question | second question | third question' with three short next questions the farmer might ask (in the reply language), then a final line 'Search: ' followed by a 3 to 6 word web search query in English.";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  if (!process.env.ANTHROPIC_API_KEY) return { statusCode: 500, body: JSON.stringify({ error: "API key not set" }) };
  let b;
  try { b = JSON.parse(event.body || "{}"); } catch (e) { return { statusCode: 400, body: "Bad request" }; }
  const messages = (b.messages || []).slice(-8).map(m => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content || "").slice(0, 1500)
  }));
  while (messages.length && messages[0].role !== "user") messages.shift();
  if (!messages.length) return { statusCode: 400, body: "No question" };
  const body = {
    model: process.env.CLAUDE_MODEL || "claude-sonnet-5-5",
    max_tokens: 1000,
    system: BASE + "\n\nContext: " + String(b.context || "").slice(0, 2000),
    messages
  };
  if (process.env.WEB_SEARCH !== "off") body.tools = [{ type: "web_search_20250305", name: "web_search", max_uses: 2 }];
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(body)
    });
    const j = await r.json();
    if (!r.ok) return { statusCode: 502, body: JSON.stringify({ error: (j.error && j.error.message) || "AI error" }) };
    const blocks = j.content || [];
    const text = blocks.filter(c => c.type === "text").map(c => c.text).join("");
    const seen = new Set(), sources = [];
    blocks.forEach(c => {
      if (c.type === "web_search_tool_result" && Array.isArray(c.content)) {
        c.content.forEach(x => {
          if (x.url && /^https?:/.test(x.url) && !seen.has(x.url) && sources.length < 4) { seen.add(x.url); sources.push({ title: x.title || x.url, url: x.url }); }
        });
      }
    });
    return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ text, sources }) };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: "AI unreachable" }) };
  }
};
