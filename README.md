# Study Assistant

An AI-powered study tool that turns any text or topic into interactive flashcards and a quiz.

## Setup

### 1. Get a Gemini API key

Sign up at [Google AI Studio](https://aistudio.google.com/) and create a free API key.

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and add your key:

```
GEMINI_API_KEY=your_key_here
```

### 3. Install and run

```bash
npm install && npm start
```

This starts both the API server (port 3001) and the Vite dev server (port 5173). Open [http://localhost:5173](http://localhost:5173).

## Usage

1. Paste notes, a topic, or any text into the input box
2. Click **Generate Study Materials**
3. Browse flashcards (click to flip, arrow keys to navigate)
4. Click **Take Quiz** to test yourself
5. See your score and use **Retest wrong answers** to focus on what you missed

## How it works

- The frontend sends your input to the Express API server at `/api/generate`
- The server calls Gemini 1.5 Flash with a structured JSON prompt, using `responseMimeType: 'application/json'` to constrain the output
- The server validates the response shape before returning it; malformed or wrong-shape responses are caught and a clean error is returned
- The frontend uses a request ID counter to guard against stale responses overwriting newer ones

## Error handling

- **Malformed JSON**: caught with a fallback regex extractor, then a structured error if extraction fails
- **Wrong shape**: explicit field validation on the server; client shows an error with retry
- **API failures** (rate limit, bad key, network): server maps to appropriate HTTP status codes; client shows the error message
- **Empty input**: blocked client-side before the request fires
- **Stale responses**: a `requestIdRef` counter ensures only the most recent request can update state

## AI usage note

Claude Code (Anthropic) was used to scaffold the full initial implementation including the Express server, React components, and CSS. All code has been reviewed and understood. The architecture decisions (race-condition guard, server-side validation, JSON extraction fallback) were chosen deliberately for robustness, not generated blindly.

## Known limitations

- Gemini free tier has rate limits; rapid repeated requests may hit a 429
- Very short inputs (under ~20 words) may produce thin or repetitive flashcards
- Local models via Ollama would need a different server endpoint; the validation layer would matter more with smaller models
- No session persistence — refreshing the page clears your progress

## Time spent

| Task | Time |
|------|------|
| Architecture and setup | ~45 min |
| Express API + validation | ~1 hr |
| React components (flashcards, quiz, results) | ~2.5 hr |
| CSS (responsive, dark mode, animations) | ~1 hr |
| Error handling + edge cases | ~1 hr |
| README | ~30 min |
| **Total** | **~7 hr** |
