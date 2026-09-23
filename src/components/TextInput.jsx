import { useState } from 'react'

const EXAMPLES = [
  'The French Revolution and its causes',
  'JavaScript closures and scope',
  'The water cycle',
  'Basic calculus: derivatives and integrals',
  'World War II key events',
  'How DNA replication works',
]

export default function TextInput({ onSubmit }) {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (trimmed.length >= 5) {
      onSubmit(trimmed)
    }
  }

  const canSubmit = text.trim().length >= 5

  return (
    <div className="text-input-container">
      <div className="text-input-hero">
        <h2>What do you want to study?</h2>
        <p>
          Paste notes, a topic, a chapter, or a few key terms. The AI will generate
          interactive flashcards and a quiz.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="text-input-form">
        <textarea
          className="study-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Photosynthesis is the process by which plants use sunlight, water and CO₂ to produce glucose and oxygen..."
          rows={7}
          autoFocus
          maxLength={8000}
          aria-label="Study content"
        />
        <div className="text-input-actions">
          <span className="char-count" aria-live="polite">
            {text.length} / 8000
          </span>
          <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
            Generate Study Materials
          </button>
        </div>
      </form>

      <div className="examples-section">
        <p className="examples-label">Try an example</p>
        <div className="chips">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              className="chip"
              type="button"
              onClick={() => setText(ex)}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
