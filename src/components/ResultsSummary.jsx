export default function ResultsSummary({
  results,
  total,
  onRetestWrong,
  onRetakeAll,
  onFlashcards,
  isRetest,
}) {
  const { score, wrongIds } = results
  const pct = total > 0 ? Math.round((score / total) * 100) : 0

  const grade =
    pct >= 90 ? 'Excellent!' :
    pct >= 70 ? 'Good job!' :
    pct >= 50 ? 'Keep studying!' :
    'Needs practice'

  const gradeClass =
    pct >= 90 ? 'grade-a' :
    pct >= 70 ? 'grade-b' :
    pct >= 50 ? 'grade-c' :
    'grade-d'

  return (
    <div className="results-container">
      <div className={`score-ring ${gradeClass}`} aria-label={`Score: ${pct}%`}>
        <span className="score-pct">{pct}%</span>
        <span className="score-grade">{grade}</span>
      </div>

      <p className="score-detail">
        {score} out of {total} correct
      </p>

      {isRetest && wrongIds.length === 0 && (
        <p className="retest-perfect">All correct this time — great work!</p>
      )}

      <div className="results-actions">
        {onRetestWrong && (
          <button className="btn btn-primary" onClick={onRetestWrong}>
            Retest {wrongIds.length} wrong answer{wrongIds.length !== 1 ? 's' : ''}
          </button>
        )}
        <button className="btn btn-secondary" onClick={onRetakeAll}>
          Retake full quiz
        </button>
        <button className="btn btn-ghost" onClick={onFlashcards}>
          Back to flashcards
        </button>
      </div>
    </div>
  )
}
