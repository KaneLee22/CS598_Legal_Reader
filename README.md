# Balancing Readability and Fidelity

A traceable dual-pane HCI prototype for legal text simplification that helps users compare readability levels while preserving access to the original clause.

## Research Question

How can a legal text simplification interface improve readability while helping users notice what legal meaning may have been compressed, generalized, or omitted?

## Core HCI Idea

The interface keeps the original legal clause visible beside simplified versions. Users can move through multiple reading-support levels with a slider, inspect block-level trace links, review fidelity notes, and open contextual explanations for legal terms.

## Features

- Paste a legal clause and generate structured reading support.
- Compare four simplification levels: Original, Closer to Original, Balanced, and More Guided.
- View original and simplified text in a dual-pane reader.
- Highlight block-level trace links between original and simplified text.
- Inspect fidelity notes for compression, omission, simplification, or generalization.
- Click legal terms for concise contextual explanations.
- Use a right-side inspect panel for selected blocks, fidelity notes, and terms.
- Load built-in sample clauses when API generation is unavailable.
- View the generated JSON structure for debugging and research demonstration.

## Live API Generation Flow

1. The user pastes a legal clause.
2. The frontend validates basic input quality and length.
3. The frontend sends `POST /api/analyze` with `{ text: string }`.
4. The server builds a structured prompt for OpenAI.
5. The OpenAI Responses API returns JSON matching the project schema.
6. The server validates the result at runtime.
7. The UI renders the result as a traceable reader interface.

The slider switches between already-generated levels locally. It does not make additional model calls.

## Structured Output Architecture

The app is API-first. OpenAI generation produces an `AnalysisResult` object with:

- `originalText`
- `originalBlocks`
- `levels`
- `fidelityNotes`
- `terms`

Important files:

- `src/lib/types.ts`: TypeScript data model.
- `src/lib/analysisSchema.ts`: JSON Schema for structured output.
- `src/lib/prompt.ts`: Prompt builder for legal simplification analysis.
- `src/lib/validateAnalysisResult.ts`: Lightweight runtime validation.
- `src/app/api/analyze/route.ts`: Server-side OpenAI API route.
- `src/lib/sampleData.ts`: Demo-safe fallback analysis results.

## Technical Stack

- Next.js App Router
- React
- TypeScript
- OpenAI TypeScript SDK
- OpenAI Responses API with structured JSON output
- Framer Motion
- Inline component styling plus `src/app/globals.css`

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.local.example .env.local
```

Add your OpenAI credentials to `.env.local`.

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Environment Variables

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=your_model_here
```

`OPENAI_API_KEY` is used only in the server-side API route. It must not be exposed to client code.

`OPENAI_MODEL` lets the model be changed without editing source code.

## Sample Fallbacks

The app includes two complete sample `AnalysisResult` objects:

- Cancellation/refund clause
- Subscription renewal/cancellation clause

These samples let the prototype remain usable for demos even when the OpenAI API key is missing, the API request fails, or network access is unavailable. They also provide stable test data for the reader interface.

## Disclaimer

This prototype provides reading support only and does not provide legal advice.
