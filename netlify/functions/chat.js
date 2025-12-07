export const handler = async (event) => {

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {

    const { message } = JSON.parse(event.body || "{}");

    const API_KEY = process.env.OPENAI_API_KEY;
    const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

    if (!API_KEY || !ASSISTANT_ID) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Missing OPENAI_API_KEY or OPENAI_ASSISTANT_ID"
        })
      };
    }

    const headers = {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "OpenAI-Beta": "assistants=v2"
    };

    // 1) Create thread
    const thread = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers
    }).then(r => r.json());

    // 2) Add user message
    await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/messages`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          role: "user",
          content: message
        })
      }
    );

    // 3) Run assistant
    const run = await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/runs`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          assistant_id: ASSISTANT_ID
        })
      }
    ).then(r => r.json());

    // 4) Wait for result
    let status = run.status;
    let tries = 0;

    while (status !== "completed" && tries < 40) {
      await new Promise(r => setTimeout(r, 1000));

      const check = await fetch(
        `https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`,
        { headers }
      ).then(r => r.json());

      status = check.status;
      tries++;
    }

    if (status !== "completed") {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Run failed" })
      };
    }

    // 5) Get answer
    const messages = await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/messages?limit=1`,
      { headers }
    ).then(r => r.json());

    const answer =
      messages.data?.[0]?.content?.[0]?.text?.value ||
      "No answer";

    return {
      statusCode: 200,
      body: JSON.stringify({ answer })
    };

  } catch (err) {

    console.error(err);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal error" })
    };

  }
};