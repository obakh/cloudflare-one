# Vectorize + Workers AI

Build semantic search and RAG applications using Cloudflare Vectorize with `@repo/ai/embeddings`.

## Setup

### 1. Create Vectorize Index

```bash
npx wrangler vectorize create my-index --dimensions=768 --metric=cosine
```

Dimensions depend on your embedding model:
- `bge-base-en-v1.5`: 768
- `bge-large-en-v1.5`: 1024
- `bge-small-en-v1.5`: 384

### 2. Configure wrangler.toml

```toml
[[vectorize]]
binding = "VECTORIZE"
index_name = "my-index"

[ai]
binding = "AI"
```

### 3. TypeScript Types

```ts
export interface Env {
  AI: Ai;
  VECTORIZE: Vectorize;
}
```

## Basic Usage

### Store Documents

```ts
import { embed } from "@repo/ai/embeddings";

// Generate embedding
const vector = await embed(env.AI, "This is my document text");

// Store in Vectorize
await env.VECTORIZE.insert([{
  id: "doc-1",
  values: vector,
  metadata: { title: "My Document", category: "tech" },
}]);
```

### Query Similar Documents

```ts
import { embed } from "@repo/ai/embeddings";

// Generate query embedding
const queryVector = await embed(env.AI, "search query");

// Find similar
const results = await env.VECTORIZE.query(queryVector, {
  topK: 5,
  returnMetadata: "all",
});

// results.matches = [
//   { id: "doc-1", score: 0.89, metadata: { title: "..." } },
//   { id: "doc-2", score: 0.82, metadata: { title: "..." } },
// ]
```

## RAG (Retrieval Augmented Generation)

Use Vectorize to provide context to an LLM:

```ts
import { embed } from "@repo/ai/embeddings";
import { chat, TEXT_MODELS } from "@repo/ai/text";

export default {
  async fetch(request, env) {
    const { question } = await request.json();
    
    // 1. Generate embedding for the question
    const queryVector = await embed(env.AI, question);
    
    // 2. Find relevant documents
    const results = await env.VECTORIZE.query(queryVector, {
      topK: 3,
      returnMetadata: "all",
    });
    
    // 3. Build context from results
    const context = results.matches
      .map(m => m.metadata?.content)
      .filter(Boolean)
      .join("\n\n");
    
    // 4. Ask LLM with context
    const response = await chat(env.AI, {
      model: TEXT_MODELS.LLAMA_3_1_8B,
      messages: [
        {
          role: "system",
          content: `Answer questions based on the following context:\n\n${context}`,
        },
        { role: "user", content: question },
      ],
    });
    
    return Response.json({ answer: response.response });
  },
};
```

## Batch Insert Documents

```ts
import { embedBatch } from "@repo/ai/embeddings";

const documents = [
  { id: "doc-1", text: "First document content", title: "Doc 1" },
  { id: "doc-2", text: "Second document content", title: "Doc 2" },
  { id: "doc-3", text: "Third document content", title: "Doc 3" },
];

// Generate embeddings for all documents
const vectors = await embedBatch(
  env.AI,
  documents.map(d => d.text)
);

// Insert into Vectorize
await env.VECTORIZE.insert(
  documents.map((doc, i) => ({
    id: doc.id,
    values: vectors[i],
    metadata: { title: doc.title, content: doc.text },
  }))
);
```

## Update & Delete

```ts
// Update (upsert)
await env.VECTORIZE.upsert([{
  id: "doc-1",
  values: newVector,
  metadata: { title: "Updated Title" },
}]);

// Delete
await env.VECTORIZE.deleteByIds(["doc-1", "doc-2"]);
```

## Filter by Metadata

```ts
const results = await env.VECTORIZE.query(queryVector, {
  topK: 10,
  returnMetadata: "all",
  filter: {
    category: "tech",
  },
});
```

## Hybrid Search Pattern

Combine vector search with keyword filtering:

```ts
import { embed } from "@repo/ai/embeddings";

async function hybridSearch(env, query: string, filters: Record<string, string>) {
  const queryVector = await embed(env.AI, query);
  
  const results = await env.VECTORIZE.query(queryVector, {
    topK: 20,
    returnMetadata: "all",
    filter: filters,
  });
  
  return results.matches;
}

// Usage
const results = await hybridSearch(env, "machine learning tutorial", {
  category: "education",
  language: "en",
});
```

## Store References to Other Services

Vectorize stores vectors + metadata. Store actual content elsewhere:

```ts
// Insert: store content in R2, vector in Vectorize
const content = "Long document content...";
const key = `docs/${docId}.txt`;

await env.R2.put(key, content);

const vector = await embed(env.AI, content);
await env.VECTORIZE.insert([{
  id: docId,
  values: vector,
  metadata: { r2Key: key, title: "My Doc" },
}]);

// Query: get vector results, then fetch from R2
const results = await env.VECTORIZE.query(queryVector, { topK: 5 });

const documents = await Promise.all(
  results.matches.map(async (match) => {
    const r2Key = match.metadata?.r2Key;
    const object = await env.R2.get(r2Key);
    return {
      id: match.id,
      score: match.score,
      content: await object?.text(),
    };
  })
);
```

## Semantic Search API Example

```ts
import { embed } from "@repo/ai/embeddings";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // POST /search - query
    if (request.method === "POST" && url.pathname === "/search") {
      const { query, limit = 10 } = await request.json();
      
      const queryVector = await embed(env.AI, query);
      const results = await env.VECTORIZE.query(queryVector, {
        topK: limit,
        returnMetadata: "all",
      });
      
      return Response.json({
        results: results.matches.map(m => ({
          id: m.id,
          score: m.score,
          ...m.metadata,
        })),
      });
    }
    
    // POST /index - add document
    if (request.method === "POST" && url.pathname === "/index") {
      const { id, content, metadata } = await request.json();
      
      const vector = await embed(env.AI, content);
      await env.VECTORIZE.upsert([{
        id,
        values: vector,
        metadata: { content, ...metadata },
      }]);
      
      return Response.json({ success: true, id });
    }
    
    // DELETE /index/:id - remove document
    if (request.method === "DELETE" && url.pathname.startsWith("/index/")) {
      const id = url.pathname.split("/").pop();
      await env.VECTORIZE.deleteByIds([id]);
      return Response.json({ success: true });
    }
    
    return new Response("Not Found", { status: 404 });
  },
};
```

## Embedding Models Comparison

| Model | Dimensions | Best For |
|-------|------------|----------|
| `bge-small-en-v1.5` | 384 | Fast, low storage |
| `bge-base-en-v1.5` | 768 | Balanced (recommended) |
| `bge-large-en-v1.5` | 1024 | Highest quality |
| `bge-m3` | 1024 | Multilingual |

## Resources

- [Vectorize Documentation](https://developers.cloudflare.com/vectorize/)
- [Workers AI Embeddings](https://developers.cloudflare.com/workers-ai/models/#text-embeddings)
- [RAG Tutorial](https://developers.cloudflare.com/workers-ai/tutorials/build-a-retrieval-augmented-generation-ai/)
