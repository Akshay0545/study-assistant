export default function ErrorState({ message, onRetry }) {
  return (
    <div className="state-container" role="alert">
      <div className="error-icon" aria-hidden="true">⚠</div>
      <h3 className="state-title">Something went wrong</h3>
      <p className="error-message">{message}</p>
      <button className="btn btn-primary" onClick={onRetry}>
        Try Again
      </button>
    </div>
  )
}
