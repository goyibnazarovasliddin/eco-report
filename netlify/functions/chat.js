export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const userMessage = body.message || "";

    const API_KEY = process.env.OPENAI_API_KEY;

    if (!API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing OPENAI_API_KEY" })
      };
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are EcoReport chatbot." },
            { role: "user", content: userMessage }
          ]
        })
      }
    );

    const data = await response.json();

    // 🔍 DEBUG: agar xato bo'lsa, to'liq xatoni ko'rsatamiz
    if (data.error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: data.error,
          message: "OpenAI error returned"
        })
      };
    }

    // 🔍 ChatCompletion to'g'ri parsing
    const answer = data.choices?.[0]?.message?.content;

    return {
      statusCode: 200,
      body: JSON.stringify({
        answer: answer || "(⚠️ Model javob qaytarmadi)"
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message
      })
    };
  }
};