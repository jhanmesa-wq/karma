const express = require("express");
const path = require("path");
const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname), { extensions: ["html"] }));

const PORT = process.env.PORT || 10000;
const API_KEY = process.env.AI_API_KEY;
const API_BASE_URL = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";
const DEFAULT_PROMPT = "Eres Karma IA, asistente amable en español para una tienda digital. Responde con claridad, no inventes precios, stock, garantías ni verificaciones. Usa los enlaces suministrados solo cuando sean pertinentes. No ayudes a doxxear, acosar, amenazar, publicar datos personales ni acusar públicamente a personas; para reportar estafas recomienda guardar pruebas y acudir a la plataforma o autoridades. Si no sabes algo, dilo.";

app.post("/api/chat", async (req, res) => {
  try {
    if (!API_KEY) return res.status(503).json({ error: "Falta configurar AI_API_KEY en Render → Environment." });
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (!message || message.length > 4000) return res.status(400).json({ error: "Escribe un mensaje de hasta 4000 caracteres." });
    const links = req.body?.links && typeof req.body.links === "object" ? req.body.links : {};
    const safeLinks = {};
    for (const key of ["link-iphone", "link-ps5", "link-subs", "whatsapp", "telegram"]) {
      const value = links[key];
      if (typeof value === "string" && /^https:\/\/[^\s]+$/i.test(value)) safeLinks[key] = value.slice(0, 500);
    }
    const system = (process.env.AI_SYSTEM_PROMPT || DEFAULT_PROMPT).slice(0, 6000);
    const upstream = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: AI_MODEL,
        temperature: Number.isFinite(Number(process.env.AI_TEMPERATURE)) ? Math.min(1.5, Math.max(0, Number(process.env.AI_TEMPERATURE))) : 0.7,
        messages: [
          { role: "system", content: `${system}\nEnlaces actuales de la tienda (pueden estar vacíos): ${JSON.stringify(safeLinks)}` },
          { role: "user", content: message }
        ]
      }),
      signal: AbortSignal.timeout(45000)
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("AI provider error:", upstream.status, JSON.stringify(data).slice(0, 1000));
      return res.status(502).json({ error: "El proveedor de IA rechazó la solicitud. Revisa token, modelo y URL base." });
    }
    const reply = data.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) return res.status(502).json({ error: "La IA devolvió una respuesta vacía." });
    return res.json({ reply: reply.trim().slice(0, 8000) });
  } catch (err) {
    console.error("Chat endpoint error:", err.message);
    return res.status(500).json({ error: "Error del servidor al consultar la IA." });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));
app.listen(PORT, "0.0.0.0", () => console.log(`Karma escuchando en puerto ${PORT}`));
