import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();

app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const { message } = req.body;

    const openai = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          stream: true,
          messages: [
            {
              role: "system",
              content:
" You are the official assistant for EcoReport. Use only the provided knowledge file. Answer briefly and clearly."
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      }
    );

    const reader = openai.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      res.write(chunk);
    }

    res.write("data: [DONE]\n\n");
    res.end();

  } catch (err) {
    res.write(`data: ERROR — ${err.message}\n\n`);
    res.end();
  }
});

app.listen(3000, () => {
  console.log("🚀 Backend running on port 3000");
});