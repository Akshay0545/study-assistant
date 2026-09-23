import { useState, useRef, useCallback } from 'react'
import TextInput from './components/TextInput'
import FlashcardDeck from './components/FlashcardDeck'
import QuizMode from './components/QuizMode'
import ResultsSummary from './components/ResultsSummary'
import LoadingState from './components/LoadingState'
import ErrorState from './components/ErrorState'

const MODE = {
  INPUT: 'input',
  LOADING: 'loading',
  FLASHCARDS: 'flashcards',
  QUIZ: 'quiz',
  RESULTS: 'results',
  ERROR: 'error',
}

export default function App() {
  const [mode, setMode] = useState(MODE.INPUT)
  const [studyData, setStudyData] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [quizResults, setQuizResults] = useState(null)
  const [retestIds, setRetestIds] = useState(null) // null = full quiz, array = subset

  // Increment this on every new request; each async callback checks it before writing state.
  // This prevents a slow response from overwriting a newer one.
  const requestIdRef = useRef(0)

  const generate = useCallback(async (text) => {
    const reqId = ++requestIdRef.current
    setMode(MODE.LOADING)
    setErrorMsg('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })

      if (reqId !== requestIdRef.current) return // stale response — a newer request fired

      const data = await res.json()

      if (reqId !== requestIdRef.current) return

      if (!res.ok) {
        throw new Error(data.error || `Server error (${res.status})`)
      }

      setStudyData(data)
      setRetestIds(null)
      setQuizResults(null)
      setMode(MODE.FLASHCARDS)
    } catch (err) {
      if (reqId !== requestIdRef.current) return
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
      setMode(MODE.ERROR)
    }
  }, [])

  const startQuiz = (ids = null) => {
    setRetestIds(ids)
    setQuizResults(null)
    setMode(MODE.QUIZ)
  }

  const finishQuiz = (results) => {
    setQuizResults(results)
    setMode(MODE.RESULTS)
  }

  const retestWrong = () => {
    if (quizResults?.wrongIds?.length > 0) {
      startQuiz(quizResults.wrongIds)
    }
  }

  const reset = () => {
    requestIdRef.current++ // cancel any in-flight async work
    setStudyData(null)
    setQuizResults(null)
    setRetestIds(null)
    setMode(MODE.INPUT)
  }

  const activeQuizQuestions =
    studyData && retestIds
      ? studyData.quiz.filter((q) => retestIds.includes(q.id))
      : studyData?.quiz ?? []

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">Study Assistant</span>
        </div>
        {mode !== MODE.INPUT && mode !== MODE.LOADING && (
          <button className="btn btn-ghost btn-sm" onClick={reset}>
            ← New session
          </button>
        )}
      </header>

      <main className="app-main">
        {mode === MODE.INPUT && <TextInput onSubmit={generate} />}

        {mode === MODE.LOADING && <LoadingState />}

        {mode === MODE.ERROR && (
          <ErrorState message={errorMsg} onRetry={reset} />
        )}

        {mode === MODE.FLASHCARDS && studyData && (
          <FlashcardDeck data={studyData} onStartQuiz={() => startQuiz()} />
        )}

        {mode === MODE.QUIZ && studyData && (
          <QuizMode
            questions={activeQuizQuestions}
            onFinish={finishQuiz}
            onBack={() => setMode(MODE.FLASHCARDS)}
            isRetest={retestIds !== null}
          />
        )}

        {mode === MODE.RESULTS && quizResults && studyData && (
          <ResultsSummary
            results={quizResults}
            total={retestIds ? retestIds.length : studyData.quiz.length}
            onRetestWrong={quizResults.wrongIds.length > 0 ? retestWrong : null}
            onRetakeAll={() => startQuiz()}
            onFlashcards={() => setMode(MODE.FLASHCARDS)}
            isRetest={retestIds !== null}
          />
        )}
      </main>
    </div>
  )
}
