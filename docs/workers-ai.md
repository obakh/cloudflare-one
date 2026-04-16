# AI Package (@repo/ai)

Type-safe wrapper around [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) for running ML models on the edge, plus client-side React hooks for AI interfaces.

## Overview

This package provides:

- **Server-side (Workers AI)** - Run ML models on Cloudflare's global network
  - Text Generation - Chat with LLMs (Llama, Mistral, Gemma, etc.)
  - Embeddings - Generate vectors for semantic search & RAG
  - Image Generation - Create images with Stable Diffusion
  - Speech Recognition - Transcribe audio with Whisper
  - Classification - Image classification, object detection, translation

- **Client-side (React Hooks)** - Build AI-powered UIs
  - `useChat` / `useCompletion` - Vercel AI SDK hooks
  - `useAgent` / `useAgentChat` - Cloudflare Agents hooks

## Setup

### 1. Add AI Binding to wrangler.toml

```toml
[ai]
binding = "AI"
```

### 2. Install Package

```bash
pnpm add @repo/ai
```

### 3. TypeScript Types

```ts
export interface Env {
  AI: Ai;
}
```

## Client-Side React Hooks

### useCompletion (Text Completion)

```tsx
import { useCompletion } from "@repo/ai/client";

function TextEditor() {
  const { completion, complete, isLoading } = useCompletion({
    api: "/api/ai/complete",
    onFinish: (result) => console.log("Done:", result),
    onError: (error) => console.error(error),
  });

  const handleGenerate = async () => {
    await complete("Write a poem about coding");
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isLoading}>
        Generate
      </button>
      {isLoading && <span>Loading...</span>}
      <div>{completion}</div>
    </div>
  );
}
```

### useChat (Chat Interface)

```tsx
import { useChat } from "@repo/ai/client";

function ChatUI() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat({
    api: "/api/ai/chat",
    initialMessages: [
      { id: "1", role: "assistant", content: "Hello! How can I help?" },
    ],
  });

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>
          <strong>{m.role}:</strong> {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}
```

### Cloudflare Agents (Stateful AI)

For persistent, stateful AI agents with WebSocket connections:

```tsx
import { useAgent, useAgentChat } from "@repo/ai/client";

function AgentChat() {
  const agent = useAgent({
    agent: "ChatAgent",
    name: "session-123",
    host: "https://my-worker.workers.dev",
  });

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    clearHistory,
  } = useAgentChat({
    agent,
    onFinish: (message) => console.log("Response:", message),
  });

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>
          {m.role}: {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>

      <button onClick={clearHistory}>Clear</button>
    </div>
  );
}
```

### Server-side API Route (for hooks)

```ts
// app/api/ai/complete/route.ts (or Cloudflare Worker)
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const result = await streamText({
    model: openai("gpt-4o"),
    prompt,
  });

  return result.toTextStreamResponse();
}
```

## Text Generation

### Chat with LLM

```ts
import { chat, TEXT_MODELS } from "@repo/ai/text";

export default {
  async fetch(request, env) {
    const response = await chat(env.AI, {
      model: TEXT_MODELS.LLAMA_3_1_8B,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "What is TypeScript?" },
      ],
      temperature: 0.7,
      maxTokens: 500,
    });

    return Response.json({ response: response.response });
  },
};
```

### Stream Responses

```ts
import { streamText, TEXT_MODELS } from "@repo/ai/text";

const stream = await streamText(env.AI, {
  model: TEXT_MODELS.LLAMA_3_1_8B,
  messages: [{ role: "user", content: "Write a poem about coding" }],
});

return new Response(stream, {
  headers: { "Content-Type": "text/event-stream" },
});
```

### Vision (Image + Text)

```ts
import { chatWithVision, TEXT_MODELS } from "@repo/ai/text";

const response = await chatWithVision(env.AI, {
  model: TEXT_MODELS.LLAMA_3_2_11B_VISION,
  messages: [{ role: "user", content: "Describe this image" }],
  image: "data:image/png;base64,...", // or URL
});
```

### Generate SQL

```ts
import { generateSQL } from "@repo/ai/text";

const response = await generateSQL(env.AI, {
  question: "Show users who signed up last month",
  schema: `CREATE TABLE users (id INT, email TEXT, created_at TIMESTAMP);`,
});
```

### Generate Code

```ts
import { generateCode } from "@repo/ai/text";

const response = await generateCode(env.AI, {
  instruction: "Write a function to validate email addresses",
  language: "typescript",
});
```

## Embeddings

### Generate Embeddings

```ts
import { embed, embedBatch, EMBEDDING_MODELS } from "@repo/ai/embeddings";

// Single text
const vector = await embed(env.AI, "Hello world");

// Batch
const vectors = await embedBatch(env.AI, [
  "Document 1",
  "Document 2",
  "Document 3",
]);
```

### Use with Vectorize

```ts
import { embed } from "@repo/ai/embeddings";

// Insert
const vector = await embed(env.AI, "My document text");
await env.VECTORIZE.insert([{ id: "doc-1", values: vector }]);

// Query
const queryVector = await embed(env.AI, "search query");
const matches = await env.VECTORIZE.query(queryVector, { topK: 5 });
```

### Semantic Search (without Vectorize)

```ts
import { findSimilar } from "@repo/ai/embeddings";

const documents = [
  "The quick brown fox",
  "JavaScript is awesome",
  "TypeScript adds types",
];

const results = await findSimilar(env.AI, {
  query: "programming languages",
  documents,
  topK: 2,
});

// [{ index: 1, text: "JavaScript is awesome", score: 0.82 }, ...]
```

## Image Generation

### Generate Image

```ts
import { generateImage, IMAGE_MODELS } from "@repo/ai/image";

const image = await generateImage(env.AI, {
  model: IMAGE_MODELS.STABLE_DIFFUSION_XL,
  prompt: "A futuristic city at sunset",
  negativePrompt: "blurry, low quality",
  width: 1024,
  height: 1024,
});

return new Response(image.data, {
  headers: { "Content-Type": image.contentType },
});
```

### Fast Generation

```ts
import { generateImageFast, generateImageLightning } from "@repo/ai/image";

// DreamShaper LCM (fast)
const image1 = await generateImageFast(env.AI, "A happy dog");

// SDXL Lightning (very fast)
const image2 = await generateImageLightning(env.AI, "Abstract art");
```

### Base64 Output

```ts
import { generateImageBase64 } from "@repo/ai/image";

const dataUrl = await generateImageBase64(env.AI, {
  prompt: "A cute robot",
});

return Response.json({ image: dataUrl });
```

## Speech Recognition

### Transcribe Audio

```ts
import { transcribe, SPEECH_MODELS } from "@repo/ai/speech";

const audioData = await request.arrayBuffer();
const result = await transcribe(env.AI, {
  model: SPEECH_MODELS.WHISPER,
  audio: audioData,
});

console.log(result.text);
console.log(result.word_count);
```

### Generate Subtitles

```ts
import { generateSubtitles } from "@repo/ai/speech";

const vtt = await generateSubtitles(env.AI, audioData);

return new Response(vtt, {
  headers: { "Content-Type": "text/vtt" },
});
```

### Transcribe from URL

```ts
import { transcribeFromUrl } from "@repo/ai/speech";

const result = await transcribeFromUrl(env.AI, {
  url: "https://example.com/audio.mp3",
});
```

## Classification & Other Models

### Image Classification

```ts
import { classifyImage, getTopClass } from "@repo/ai/classification";

const imageData = await request.arrayBuffer();

// All results
const results = await classifyImage(env.AI, { image: imageData });

// Top result only
const top = await getTopClass(env.AI, imageData);
console.log(`${top.label}: ${(top.score * 100).toFixed(1)}%`);
```

### Object Detection

```ts
import { detectObjects } from "@repo/ai/classification";

const results = await detectObjects(env.AI, { image: imageData });

for (const obj of results) {
  console.log(`${obj.label} at (${obj.box.xmin}, ${obj.box.ymin})`);
}
```

### Translation

```ts
import { translate } from "@repo/ai/classification";

const result = await translate(env.AI, {
  text: "Hello, how are you?",
  sourceLang: "en",
  targetLang: "es",
});

console.log(result.translated_text); // "Hola, ¿cómo estás?"
```

### Summarization

```ts
import { summarize } from "@repo/ai/classification";

const result = await summarize(env.AI, {
  text: longArticle,
  maxLength: 150,
});

console.log(result.summary);
```

## Available Models

### Text Generation

| Constant | Model |
|----------|-------|
| `LLAMA_3_1_8B` | `@cf/meta/llama-3.1-8b-instruct` |
| `LLAMA_3_8B` | `@cf/meta/llama-3-8b-instruct` |
| `LLAMA_3_2_3B` | `@cf/meta/llama-3.2-3b-instruct` |
| `LLAMA_3_2_1B` | `@cf/meta/llama-3.2-1b-instruct` |
| `LLAMA_3_2_11B_VISION` | `@cf/meta/llama-3.2-11b-vision-instruct` |
| `MISTRAL_7B` | `@cf/mistral/mistral-7b-instruct-v0.1` |
| `GEMMA_7B` | `@hf/google/gemma-7b-it` |
| `QWEN_1_5_7B` | `@cf/qwen/qwen1.5-7b-chat-awq` |
| `DEEPSEEK_CODER_6_7B` | `@hf/thebloke/deepseek-coder-6.7b-instruct-awq` |
| `CODE_LLAMA_7B` | `@hf/thebloke/codellama-7b-instruct-awq` |
| `SQLCODER_7B` | `@cf/defog/sqlcoder-7b-2` |

### Embeddings

| Constant | Model | Dimensions |
|----------|-------|------------|
| `BGE_BASE_EN` | `@cf/baai/bge-base-en-v1.5` | 768 |
| `BGE_LARGE_EN` | `@cf/baai/bge-large-en-v1.5` | 1024 |
| `BGE_SMALL_EN` | `@cf/baai/bge-small-en-v1.5` | 384 |
| `BGE_M3` | `@cf/baai/bge-m3` | 1024 |

### Image Generation

| Constant | Model |
|----------|-------|
| `STABLE_DIFFUSION_XL` | `@cf/stabilityai/stable-diffusion-xl-base-1.0` |
| `DREAMSHAPER_8` | `@cf/lykon/dreamshaper-8-lcm` |
| `STABLE_DIFFUSION_XL_LIGHTNING` | `@cf/bytedance/stable-diffusion-xl-lightning` |

### Speech Recognition

| Constant | Model |
|----------|-------|
| `WHISPER` | `@cf/openai/whisper` |
| `WHISPER_TINY` | `@cf/openai/whisper-tiny-en` |

## Pricing

Workers AI uses a pay-per-use model:

- **Free tier**: 10,000 neurons/day
- **Paid**: $0.011 per 1,000 neurons

Different models consume different amounts of neurons. See [pricing docs](https://developers.cloudflare.com/workers-ai/platform/pricing/).

## Resources

- [Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Model Catalog](https://developers.cloudflare.com/workers-ai/models/)
- [Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Limits](https://developers.cloudflare.com/workers-ai/platform/limits/)
