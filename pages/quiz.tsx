"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

const Quiz = () => {
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [isQuizOver, setQuizOver] = useState(false);

  const fetchQuiz = async () => {
    // We need to adjust the url to point to our new API route
    const res = await axios.get('/api/film');
    const film = res.data;
  
    const gptRes = await axios.post('https://api.openai.com/v1/completions', {
      model: "text-davinci-003",
      prompt: `Generate a trivia question for quiz about the film "${film.film_name}" and generate 4 answers where only 1 of them should be true. Please tell which answer is correct. Please use this template for your answer, example: \nQ: What is the name of the policeman from Queens who works with Lacey in the 1982 film \"Cagney & Lacey\"?\n\nA. Harold Gorman\nB. Isiah Orenstein\nC. Harvey Lacey\nD. Victor Isbecki\n\nAnswer: D. Victor Isbecki`,
      max_tokens: 100,
      }, {
          headers: {
              "Authorization": "Bearer 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"
          }
      }
    );

    let gptOutput = gptRes.data.choices[0].text;
    let lines = gptOutput.split('\n').filter(Boolean);
    let question = lines[0];
    let options = lines.slice(1, 5);
    let answerText = lines[5].split('. ')[1];
    let answerIndex = options.findIndex(option => option.includes(answerText));

    setQuiz({ question, options, answer: answerIndex });
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  if (isQuizOver) {
    return (
      <div>
        <h1>Quiz Over</h1>
        <p>Your score: {score}</p>
        <p>Wrong answers: {wrongAnswers + 1}</p>
      </div>
    );
  }

  if (!quiz) {
    return <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>Loading quiz...</div>;
  }

  return (
    <div className="quiz container d-flex flex-column justify-content-center align-items-center" style={{height: '100vh'}}>
      <div className="p-4 bg-white rounded shadow" style={{width: '100%', maxWidth: '600px'}}>
        <h1 className="text-center mb-4">Quiz</h1>
        <p className="fs-5 mb-3">{quiz.question}</p>
        {quiz.options.map((option, index) => (
          <div className="form-check" key={index}>
            <input
              className="form-check-input"
              type="radio"
              id={`option-${index}`}
              name="quizOption"
              value={index}
              onChange={() => setSelectedAnswer(index)}
            />
            <label className="form-check-label" htmlFor={`option-${index}`}>
              {option}
            </label>
          </div>
        ))}
        <button
          className="btn btn-secondary mt-3 mb-2"
          onClick={() => {
            if (selectedAnswer === quiz.answer) {
              setScore(score + 1);
            } else {
              if (wrongAnswers + 1 >= 3) {
                setQuizOver(true);
              } else {
                setWrongAnswers(wrongAnswers + 1);
              }
            }
            setSelectedAnswer(null);
            if (!isQuizOver) {
              fetchQuiz();
            }
          }}
        >
          Submit answer
        </button>

        <p className="fs-6">Score: {score}</p>
        <p className="fs-6">Wrong answers: {wrongAnswers}</p>
        {isQuizOver && <p className="text-center mt-2">Quiz over!</p>}
      </div>
    </div>
  );
}

export default Quiz;
