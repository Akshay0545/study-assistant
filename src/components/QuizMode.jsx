import { useState } from 'react'

export default function QuizMode({ questions, onFinish, onBack, isRetest }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({}) // { [questionId]: selectedOptionIndex }
  const [showFeedback, setShowFeedback] = useState(false)

  if (questions.length === 0) {
    return (
      <div className="state-container">
        <p>No questions to show.</p>
        <button className="btn btn-primary" onClick={onBack}>Back to Flashcards</button>
      </div>
    )
  }

  const question = questions[currentIdx]
  const selected = answers[question.id]
  const isAnswered = selected !== undefined
  const isCorrect = isAnswered && selected === question.correctIndex
  const isLast = currentIdx === questions.length - 1

  const handleSelect = (optionIdx) => {
    if (isAnswered) return
    setAnswers((prev) => ({ ...prev, [question.id]: optionIdx }))
    setShowFeedback(true)
  }

  const handleNext = () => {
    setShowFeedback(false)
    if (!isLast) {
      setCurrentIdx((i) => i + 1)
    } else {
      const wrongIds = questions
        .filter((q) => answers[q.id] !== q.correctIndex)
        .map((q) => q.id)

      // The last question's answer is already in `answers` from handleSelect above
      const finalAnswers = { ...answers }
      const finalWrongIds = questions
        .filter((q) => finalAnswers[q.id] !== q.correctIndex)
        .map((q) => q.id)

      onFinish({
        answers: finalAnswers,
        score: questions.length - finalWrongIds.length,
        wrongIds: finalWrongIds,
      })
    }
  }

  const getOptionClass = (i) => {
    if (!showFeedback) return i === selected ? 'option-btn option-selected' : 'option-btn'
    if (i === question.correctIndex) return 'option-btn option-correct'
    if (i === selected && !isCorrect) return 'option-btn option-wrong'
    return 'option-btn option-dim'
  }

  const LETTERS = ['A', 'B', 'C', 'D']

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <button className="btn btn-ghost btn-sm" onClick={onBack} aria-label="Back to flashcards">
          ← Flashcards
        </button>
        <div className="quiz-header-right">
          {isRetest && <span className="badge-retest">Retest</span>}
          <span className="quiz-progress">{currentIdx + 1} / {questions.length}</span>
        </div>
      </div>

      <div className="progress-bar" role="progressbar" aria-valuenow={currentIdx + 1} aria-valuemax={questions.length}>
        <div
          className="progress-fill"
          style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
        />
      </div>

      <div className="question-card">
        <p className="question-text">{question.question}</p>

        <div className="options-list" role="group" aria-label="Answer options">
          {question.options.map((opt, i) => (
            <button
              key={i}
              className={getOptionClass(i)}
              onClick={() => handleSelect(i)}
              disabled={isAnswered && !showFeedback}
              aria-label={`Option ${LETTERS[i]}: ${opt}`}
              aria-pressed={i === selected}
            >
              <span className="option-letter" aria-hidden="true">{LETTERS[i]}</span>
              <span>{opt}</span>
            </button>
          ))}
        </div>

        {showFeedback && (
          <div
            className={`feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}
            role="alert"
            aria-live="polite"
          >
            {isCorrect
              ? '✓ Correct!'
              : `✗ Correct answer: ${question.options[question.correctIndex]}`}
          </div>
        )}
      </div>

      {isAnswered && (
        <button className="btn btn-primary btn-wide" onClick={handleNext}>
          {isLast ? 'See Results' : 'Next Question →'}
        </button>
      )}
    </div>
  )
}
