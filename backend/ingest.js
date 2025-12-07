import fs from "fs";
import 'dotenv/config';
import express from "express";
import fetch from "node-fetch";

const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
  console.error("❌ OPENAI_API_KEY is missing in env");
  process.exit(1);
}

const text = fs.readFileSync("knowledge.txt", "utf8");

const chunks = text
  .split("\n\n")
  .map(x => x.trim())
  .filter(x => x.length > 40);

  

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

  // 🛑 DEBUG QISMI
  if (!data.data || !data.data[0]) {
    console.error("❌ Embedding API returned error.");
    console.error("Status:", res.status);
    console.error("Response:", JSON.stringify(data, null, 2));
    process.exit(1);
  }

  vectors.push({
    text: chunk,
    vector: data.data[0].embedding
  });

}

fs.writeFileSync("embeddings.json", JSON.stringify(vectors, null, 2));
console.log("✅ Knowledge indexed:", vectors.length);
console.log("CHUNKS:");
console.log(chunks.length);
console.log(chunks.map((c,i)=>`\n---- ${i+1} ----\n${c.substring(0,150)}...`).join(''));

