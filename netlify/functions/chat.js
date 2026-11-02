// Powers the resume chat via Netlify AI Gateway — no API key needed.
// Netlify injects the gateway credentials automatically at runtime.
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method not allowed" };
  try {
    const { system, messages } = JSON.parse(event.body || "{}");
    if (!Array.isArray(messages) || !messages.length) return { statusCode: 400, body: "No messages" };

    const gatewayUrl = (process.env.NETLIFY_AI_GATEWAY_URL || "").replace(/\/$/, "");
    const res = await fetch(`${gatewayUrl}/anthropic/v1/messages`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${process.env.NETLIFY_AI_GATEWAY_KEY}`,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-5-5",
        max_tokens: 900,
        system: String(system || "").slice(0, 60000),
        messages: messages.slice(-20).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 15000) }))
      })
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("AI Gateway error", res.status, data);
      return { statusCode: 502, body: JSON.stringify({ error: "Chat is temporarily unavailable." }) };
    }
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
    return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ error: "Something went wrong." }) };
  }
};
