# @repo/editor

Full-featured TipTap rich text editor with AI support, slash commands, bubble menu, and table editing.

## Installation

```bash
pnpm add @repo/editor
```

## Basic Usage

```tsx
import { Editor } from "@repo/editor";
import "@repo/editor/styles";

function MyEditor() {
  return (
    <Editor
      defaultValue={initialContent}
      onDebouncedUpdate={(editor) => {
        // Auto-saves after 500ms of inactivity
        saveContent(editor?.getJSON());
      }}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultValue` | `JSONContent` | - | Initial content (TipTap JSON) |
| `onUpdate` | `(editor) => void` | - | Called on every change |
| `onDebouncedUpdate` | `(editor) => void` | - | Called 500ms after last change |
| `editable` | `boolean` | `true` | Enable/disable editing |
| `extensions` | `Extensions` | - | Additional TipTap extensions |
| `enableAI` | `boolean` | `true` | Enable AI features in bubble menu |
| `className` | `string` | - | Container class name |
| `slotAfter` | `ReactNode` | - | Content after editor |
| `children` | `ReactNode` | - | Custom menus/overlays |

## Features

### Slash Commands

Type `/` to open the command menu:

- Text, Headings (1-3)
- Bullet List, Numbered List, To-do List
- Quote, Code Block
- Image, File upload
- Table
- Embed Content

### Bubble Menu

Select text to show formatting options:

- AI: Ask AI, Improve, Fix grammar, Make shorter/longer, Continue writing
- Node type: Text, Headings, Lists, Quote, Code
- Format: Bold, Italic, Underline, Strikethrough, Code, Super/Subscript
- Link: Add/edit/remove links
- Clear formatting

### Table Menu

Click in a table to show:

- Column menu: Add/delete columns
- Row menu: Add/delete rows
- Global: Toggle headers, Delete table

### AI Integration

The editor includes AI-powered text generation. Configure the API endpoint:

```tsx
<Editor
  enableAI={true}
  // AI calls go to /api/editor/generate by default
/>
```

Create the API endpoint:

```ts
// app/api/editor/generate/route.ts
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  const { prompt, option } = await req.json();

  const result = await streamText({
    model: openai("gpt-4"),
    prompt: getPromptForOption(option, prompt),
  });

  return result.toDataStreamResponse();
}
```

## File Uploads

Configure custom upload function:

```tsx
import { setUploadFn } from "@repo/editor";

setUploadFn(async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  
  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });
  
  const { url } = await res.json();
  return url;
});
```

## Server-Side Rendering

Generate HTML from JSON content on the server:

```ts
import { generateHTML } from "@repo/editor";
import { serverExtensions } from "@repo/editor/extensions/server";

const html = generateHTML(jsonContent, serverExtensions);
```

## Custom Extensions

Add your own TipTap extensions:

```tsx
import { Editor } from "@repo/editor";
import Mention from "@tiptap/extension-mention";
import { createMentionSuggestions } from "@repo/editor";

<Editor
  extensions={[
    Mention.configure({
      suggestion: createMentionSuggestions(["alice", "bob"]),
    }),
  ]}
/>
```

## Included Extensions

Client-side (`@repo/editor/extensions/client`):
- StarterKit (bold, italic, headings, lists, etc.)
- Link, Image, YouTube
- Table, TaskList
- CodeBlockLowlight (syntax highlighting)
- Highlight, Color, Underline
- Superscript, Subscript
- Color Highlighter (auto-highlights hex colors)
- File Node

Server-side (`@repo/editor/extensions/server`):
- Same as client, without browser-specific plugins

## Styling

Import the default styles:

```tsx
import "@repo/editor/styles";
```

The editor uses Tailwind CSS classes. Customize with your theme's CSS variables.

## Components

Export individual components for custom layouts:

```tsx
import {
  BubbleMenu,
  TableMenu,
  SlashCommand,
  NodeSelector,
  FormatSelector,
  LinkSelector,
  TextButtons,
  GenerativeMenuSwitch,
  AISelector,
} from "@repo/editor";
```

## Plugins

```tsx
import {
  codeBlock,
  colorHighlighter,
  fileNode,
  createMentionSuggestions,
  SuggestionList,
} from "@repo/editor";
```
