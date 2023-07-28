"use client";

// Add React import for Functional Component type
import React, { useState, useEffect, FC } from 'react';
import axios from 'axios';

interface QuizType {
  question: string,
  options: string[],
  answer: number
}

const Quiz: FC = () => {
  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [wrongAnswers, setWrongAnswers] = useState<number>(0);
  const [isQuizOver, setQuizOver] = useState<boolean>(false);
  const [imageData, setImageData] = useState<string | null>(null);

  const fetchQuiz = async () => {
    // We need to adjust the url to point to our new API route
    const res = await axios.get('/api/film');
    const film = res.data;
  
    // Call to fetch image
    fetchImage(`Illustration of a scene from the film "${film.film_name}"`);

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

    let gptOutput: string = gptRes.data.choices[0].text;
    let lines: string[] = gptOutput.split('\n').filter(Boolean);
    let question: string = lines[0];
    let options: string[] = lines.slice(1, 5);
    let answerText: string = lines[5].split('. ')[1];
    let answerIndex: number = options.findIndex((option: string) => option.includes(answerText));

    setQuiz({ question, options, answer: answerIndex });
  };

  const fetchImage = async (description: string) => {
    // This is a hypothetical call, replace with actual DALL-E API details
    const res = await axios.post('https://api.openai.com/v1/images/generations', {
      prompt: description,
      n: 1,
      size: '512x512'
      // Additional parameters...
    }, {
      headers: {
        "Authorization": "Bearer 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"
      }
    });

    console.log(res);
    console.log(res.data.data[0].url);
    setImageData(res.data.data[0].url);  // Assuming this is the image data
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
        {imageData && <img src={imageData} alt="Generated image" />}
        <p className="fs-5 mb-3">{quiz.question}</p>
        {quiz.options.map((option: string, index: number) => (
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
