export const handler = async (event) => {

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const { message } = JSON.parse(event.body || "{}");

  try {

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Siz EcoReport ilovasi uchun rasmiy yordamchi asistentsiz. Faqat EcoReport haqidagi savollarga aniq va ixcham javob bering."
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.3
      })
    });

    const data = await res.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: data.output[0].content[0].text
      })
    };

  } catch (err) {

    console.error("OpenAI Error:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        reply: "Serverda xatolik yuz berdi."
      })
    };

  }
};