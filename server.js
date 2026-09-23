import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'

dotenv.config()

const app = express()
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }))
app.use(express.json())

const GEMINI_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_KEY) {
  console.error('Error: GEMINI_API_KEY is not set. Create a .env file with GEMINI_API_KEY=your_key')
  process.exit(1)
}

const ai = new GoogleGenAI({ apiKey: GEMINI_KEY })

function buildPrompt(topic) {
  return `You are a study assistant. Given the following text or topic, generate study materials.

Return ONLY valid JSON — no markdown, no code blocks, no backticks, no explanation — in EXACTLY this structure:
{
  "title": "concise topic title under 60 characters",
  "flashcards": [
    { "id": "fc1", "front": "term or question", "back": "definition or answer" }
  ],
  "quiz": [
    {
      "id": "q1",
      "question": "question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0
    }
  ]
}

Rules:
- Generate 6 to 10 flashcards covering key concepts
- Generate 5 to 8 quiz questions, each with exactly 4 options
- correctIndex is 0-based (0 = first option, 3 = last option)
- Vary difficulty: some easy recall, some deeper understanding
- Do NOT wrap output in markdown code blocks

Topic / Notes:
${topic}`
}

function validate(data) {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Response is not a valid object')
  }
  if (typeof data.title !== 'string' || !data.title.trim()) {
    throw new Error('Response missing a title')
  }
  if (!Array.isArray(data.flashcards) || data.flashcards.length === 0) {
    throw new Error('Response contains no flashcards')
  }
  for (const fc of data.flashcards) {
    if (!fc.id || !fc.front || !fc.back) {
      throw new Error('A flashcard is missing id, front, or back')
    }
  }
  if (!Array.isArray(data.quiz) || data.quiz.length === 0) {
    throw new Error('Response contains no quiz questions')
  }
  for (const q of data.quiz) {
    if (!q.id || !q.question) {
      throw new Error('A quiz question is missing id or question text')
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error('Each quiz question must have exactly 4 options')
    }
    if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) {
      throw new Error('A quiz question has an invalid correctIndex (must be 0–3)')
    }
  }
}

function tryParseJSON(raw) {
  try {
    return JSON.parse(raw)
  } catch {
    // Sometimes models wrap JSON in markdown code blocks even when asked not to
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (match) {
      return JSON.parse(match[1].trim())
    }
    // Try to find the outermost JSON object
    const objMatch = raw.match(/\{[\s\S]*\}/)
    if (objMatch) {
      return JSON.parse(objMatch[0])
    }
    throw new Error('Could not parse AI response as JSON')
  }
}

app.post('/api/generate', async (req, res) => {
  const { text } = req.body

  if (!text || typeof text !== 'string' || text.trim().length < 5) {
    return res.status(400).json({ error: 'Please enter at least a few words to study.' })
  }

  if (text.trim().length > 8000) {
    return res.status(400).json({ error: 'Input is too long. Please keep it under 8000 characters.' })
  }

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: buildPrompt(text.trim()),
      config: {
        responseMimeType: 'application/json',
        // Disable thinking tokens — they appear before the JSON and break parsing
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 2048,
      },
    })

    // result.text can be a string or a function depending on SDK version
    const rawText = typeof result.text === 'function' ? result.text() : result.text

    if (!rawText || !rawText.trim()) {
      console.error('Empty response from model')
      return res.status(502).json({ error: 'The AI returned an empty response. Please try again.' })
    }

    console.log('Raw response preview:', rawText.slice(0, 200))

    let parsed
    try {
      parsed = tryParseJSON(rawText)
    } catch (parseErr) {
      console.error('JSON parse error. Raw response:', rawText.slice(0, 500))
      return res.status(502).json({
        error: 'The AI returned a response we could not parse. Please try again.',
      })
    }

    try {
      validate(parsed)
    } catch (validationErr) {
      console.error('Validation error:', validationErr.message)
      return res.status(502).json({
        error: `AI returned unexpected data: ${validationErr.message}. Please try again.`,
      })
    }

    res.json(parsed)
  } catch (err) {
    console.error('Generate error:', err.message)
    const msg = err.message || ''
    if (msg.includes('API key') || msg.includes('API_KEY_INVALID') || err.status === 401 || err.status === 400) {
      return res.status(401).json({ error: 'Invalid API key. Check your GEMINI_API_KEY in .env' })
    }
    if (msg.includes('quota') || msg.includes('429') || err.status === 429) {
      return res.status(429).json({ error: 'API rate limit reached. Please wait a moment and try again.' })
    }
    res.status(500).json({ error: 'Failed to generate study materials. Please try again.' })
  }
})

// Keep the process alive on unhandled SDK rejections — log and continue, don't crash
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection (server kept alive):', reason)
})

// Serve built frontend in production
import { existsSync } from 'fs'
if (existsSync('./dist')) {
  const { default: path } = await import('path')
  const { fileURLToPath } = await import('url')
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  app.use(express.static(path.join(__dirname, 'dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  })
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
