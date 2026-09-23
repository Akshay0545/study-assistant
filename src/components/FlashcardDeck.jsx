import { useState, useEffect } from 'react'
import Flashcard from './Flashcard'

export default function FlashcardDeck({ data, onStartQuiz }) {
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [seen, setSeen] = useState(() => new Set())

  const { title, flashcards, quiz } = data

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setIsFlipped((f) => !f)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  const markSeen = (i) => setSeen((prev) => new Set([...prev, i]))

  const goTo = (nextIdx) => {
    markSeen(index)
    setIndex(nextIdx)
    setIsFlipped(false)
  }

  const goPrev = () => {
    if (index > 0) goTo(index - 1)
  }

  const goNext = () => {
    if (index < flashcards.length - 1) goTo(index + 1)
  }

  const card = flashcards[index]
  const seenCount = seen.has(index) ? seen.size : seen.size // current card shows as seen after leaving it

  return (
    <div className="deck-container">
      <div className="deck-header">
        <div>
          <h2 className="deck-title">{title}</h2>
          <p className="deck-sub">{flashcards.length} cards · {quiz.length} quiz questions</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={onStartQuiz}>
          Take Quiz →
        </button>
      </div>

      <div className="progress-row">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((index + 1) / flashcards.length) * 100}%` }}
          />
        </div>
        <span className="progress-label">{index + 1} / {flashcards.length}</span>
      </div>

      <Flashcard
        front={card.front}
        back={card.back}
        isFlipped={isFlipped}
        onFlip={() => setIsFlipped((f) => !f)}
      />

      <p className="flip-hint" aria-hidden="true">
        {isFlipped ? 'Click to see the question' : 'Click to reveal the answer'}
        <span className="hint-key">Space / Enter</span>
      </p>

      <div className="deck-controls">
        <button
          className="btn btn-secondary"
          onClick={goPrev}
          disabled={index === 0}
          aria-label="Previous card"
        >
          ← Prev
        </button>
        <button
          className="btn btn-secondary"
          onClick={goNext}
          disabled={index === flashcards.length - 1}
          aria-label="Next card"
        >
          Next →
        </button>
      </div>

      {/* Dot navigation */}
      <div className="card-dots" role="tablist" aria-label="Card navigation">
        {flashcards.map((fc, i) => (
          <button
            key={fc.id}
            className={`dot ${i === index ? 'dot-active' : seen.has(i) ? 'dot-seen' : ''}`}
            onClick={() => goTo(i)}
            title={fc.front}
            aria-label={`Card ${i + 1}`}
            role="tab"
            aria-selected={i === index}
          />
        ))}
      </div>

      <p className="keyboard-hint" aria-hidden="true">
        Tip: use arrow keys to navigate, Space to flip
      </p>
    </div>
  )
}
