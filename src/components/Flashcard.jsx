export default function Flashcard({ front, back, isFlipped, onFlip }) {
  return (
    <div
      className="flashcard-wrapper"
      onClick={onFlip}
      role="button"
      tabIndex={0}
      aria-label={isFlipped ? `Answer: ${back}` : `Question: ${front}. Click to reveal answer.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onFlip()
        }
      }}
    >
      <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
        <div className="flashcard-face flashcard-front">
          <span className="face-badge">Question</span>
          <p className="face-text">{front}</p>
        </div>
        <div className="flashcard-face flashcard-back">
          <span className="face-badge face-badge-answer">Answer</span>
          <p className="face-text">{back}</p>
        </div>
      </div>
    </div>
  )
}
