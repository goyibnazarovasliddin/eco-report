import 'dotenv/config';
import fs from "fs";

const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
  console.error("❌ OPENAI_API_KEY missing");
  process.exit(1);
}

const text = fs.readFileSync("knowledge.txt", "utf8");

/* ✅ SECTION-BASED CHUNKING */
const chunks = text
  .split(/\n(?=#|##)/)        // # yoki ## bilan boshlangan joylardan bo‘linadi
  .map(x => x.replace(/^#+\s*/, "").trim())
  .filter(x => x.length > 100);   // juda kichik bo‘laklar o‘tmasin

let vectors = [];

for (let chunk of chunks) {

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: chunk
    })
  });

  const data = await res.json();

  if (!data.data?.[0]?.embedding) {
    console.error("❌ EMBEDDING ERROR:", JSON.stringify(data, null, 2));
    process.exit(1);
  }

  vectors.push({
    text: chunk,
    vector: data.data[0].embedding
  });
}

fs.writeFileSync("embeddings.json", JSON.stringify(vectors, null, 2));

console.log("✅ Knowledge indexed:", vectors.length);