export const handler = async (event) => {

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {

    const { message } = JSON.parse(event.body || "{}");

    const API_KEY = process.env.OPENAI_API_KEY;

    if (!API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing OPENAI_API_KEY" })
      };
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are EcoReport chatbot." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await res.json();

    const answer =
      data.choices?.[0]?.message?.content ||
      "No answer";

    return {
      statusCode: 200,
      body: JSON.stringify({ answer })
    };

  } catch (err) {

    console.error("CHAT ERROR:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };

  }
};
