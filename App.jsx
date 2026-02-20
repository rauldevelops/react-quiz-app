import React from 'react'
import he from 'he'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

/*
Features:
smooth scroll to top of quiz upon click of "new quiz" button
Confetti if 5/5?
*/

export default function App() {
    
    // state
    const [quiz, setQuiz] = React.useState([])
    const [attemptedAnswers, setAttemptedAnswers] = React.useState({})
    const [showResults, setShowResults] = React.useState(false)
    const [quizStarted, setQuizStarted] = React.useState(false)
    
    
    function startQuiz() {
        fetch('https://opentdb.com/api.php?amount=5&category=12&difficulty=easy&type=multiple')
        .then(res => res.json())
        .then(data => {
            const quizWithShuffledAnswers = data.results.map(question => ({
                ...question,
                shuffledAnswers: [...question.incorrect_answers, question.correct_answer]
                .sort(() => Math.random() - 0.5)
            }))
            setQuiz(quizWithShuffledAnswers)
            setQuizStarted(true)
            setAttemptedAnswers({})
            setShowResults(false)
        })
    }
    
    // Derived values
    const allAnswered = Object.keys(attemptedAnswers).length === quiz.length
    const score = quiz.filter((question, index) => 
        attemptedAnswers[index] === he.decode(question.correct_answer)
).length

    const ref = React.useRef(null)
    const topRef = React.useRef(null)
    const { width, height } = useWindowSize()

    React.useEffect(() => {
        if (allAnswered && ref.current !== null) {
            ref.current.scrollIntoView({behavior: "smooth"})
        }
    }, [allAnswered])

    React.useEffect(() => {
        if (!showResults && quizStarted && topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [showResults])

// listener callback functions
    function addAnswer(questionIndex, answer) {
        setAttemptedAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionIndex]: answer
        }))
    }
    
    const quizElement = quiz.map((question, index) => {
        
        return (
           <div className="question" key={index}>
                <h2>{he.decode(question.question)}</h2>
                <div className="answers">
                
                    {question.shuffledAnswers.map((answer, i) => {
                        const decoded = he.decode(answer)
                        const correctAnswer = he.decode(question.correct_answer)
                        const isCorrect = decoded === correctAnswer           
                        const isSelected = attemptedAnswers[index] == decoded
                        
                        let style = {}
                        if (showResults) {     
                            if (isCorrect) {
                                style.backgroundColor = '#94D7A2'
                            } else if (isSelected) {
                                style.backgroundColor = '#F8BCBC'
                            }
                            if (!isCorrect) {
                                style.opacity = 0.5
                            }
                        }
                        
                        return (
                            <React.Fragment key={i}>
                                <input
                                    type="radio"
                                    name={index}
                                    id={`${index}-${decoded}`}
                                    value={decoded}
                                    checked={isSelected}
                                    onChange={() => addAnswer(index, decoded)}
                                    disabled={showResults}
                                />
                                <label htmlFor={`${index}-${decoded}`} style={style}>{decoded}</label>
                            </React.Fragment>
                        )
                    })}
                
                </div>
            </div>
        )
    })
    
    
    return (
        <main ref={topRef}>
            {showResults
                && score === quiz.length
                && <Confetti
                        width={width}
                        height={height}
                   />
            }
            <div className="container">
                {!quizStarted ? (
                    <div className="start-screen">
                        <h1>Musiquiz</h1>
                        <p>a quiz app to test your musical trivia knowledge</p>
                        <button onClick={startQuiz}>Start Quiz</button>
                    </div>
                ) : (
                    <form>
                        {quizElement}
                        {showResults && <h3>You scored {score}/{quiz.length} correct answers</h3>}
                        {allAnswered && !showResults && (
                                <button
                                    ref={ref}
                                    type="button"
                                    className="btn"
                                    onClick={() => setShowResults(true)}
                                >
                                    Check Answers
                                </button>
                                )}
                        {showResults && (
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={startQuiz}
                                >
                                    New Quiz
                                </button>    
                            )
                        }
                    </form>
                )}
            </div>
        </main>
    ) 
}