export default function LoadingState() {
  return (
    <div className="state-container" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p className="state-title">Generating your study materials…</p>
      <p className="state-sub">This usually takes 3–8 seconds</p>
    </div>
  )
}
