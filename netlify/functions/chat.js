// Resume chat. Uses Netlify AI Gateway: Netlify injects ANTHROPIC_API_KEY and ANTHROPIC_BASE_URL automatically.
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  try {
    const { system, messages } = JSON.parse(event.body || "{}");
    if (!Array.isArray(messages) || !messages.length) return { statusCode: 400, body: JSON.stringify({ error: "No messages" }) };
    const base = (process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com").replace(/\/$/, "");
    const res = await fetch(base + "/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.CHAT_MODEL || "claude-sonnet-4-5",
        max_tokens: 900,
        system: String(system || "").slice(0, 60000),
        messages: messages.slice(-20).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 15000) }))
      })
    });
    const data = await res.json();
    if (!res.ok) { console.error("Upstream error", res.status, JSON.stringify(data)); return { statusCode: 502, body: JSON.stringify({ error: "Chat is unavailable right now." }) }; }
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
    return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ error: "Chat is unavailable right now." }) };
  }
};
