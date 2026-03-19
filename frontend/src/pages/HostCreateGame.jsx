import { useState } from "react";
import { createQuiz } from "../services/quizService";

function HostCreateGame() {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([]);

  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState([]);

  function toggleCorrect(index) {
  if (correct.includes(index)) {
    setCorrect(correct.filter(i => i !== index));
  } else {
    setCorrect([...correct, index]);
  }
}

  function addQuestion() {

    const formattedAnswers = answers.map((answer, index) => ({
      text: answer,
      correct: correct.includes(index)
    }));

    const newQuestion = {
      text: questionText,
      answers: formattedAnswers
    };

    setQuestions([...questions, newQuestion]);

    setQuestionText("");
    setAnswers(["", "", "", ""]);
    setCorrect([]);
  }

  async function saveQuiz() {
    const quiz = {
      title: title,
      questions: questions
    };

    try {
      const response = await createQuiz(quiz);
      console.log("Quiz saved:", response.data);
    } catch (error) {
      console.error("Error saving quiz:", error);
    }
  }

  return (
    <div className="min-h-screen flex justify-center p-10">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Create Quiz</h1>

        {/* Quiz Title */}

        <input
          className="w-full p-3 mb-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Quiz title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="grid grid-cols-3 gap-8">

          {/* Question Editor */}

          <div className="col-span-2 bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Add Question</h2>
            <input
              className="w-full p-3 border rounded-lg mb-6"
              placeholder="Question text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />

            {/* Answers */}

            <div className="grid flex-col gap-3">
              {answers.map((a, i) => (
                <div
                  key={i}
                  onClick={() => toggleCorrect(i)}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    correct.includes(i) ? "border-green-500 bg-green-50" : ""
                  }`}
                >

                  <input
                    className="flex-1 p-2 outline-none bg-transparent"
                    placeholder={`Answer ${i + 1}`}
                    value={a}
                    onChange={(e) => {
                      const copy = [...answers];
                      copy[i] = e.target.value;
                      setAnswers(copy);
                    }}
                  />

                 <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        correct.includes(i) ? "border-green-500" : "border-gray-400"
                    }`}
                >
                    {correct.includes(i) && (
                        <div 
                            className="w-2.5 h-2.5 bg-green-500 rounded-full"
                        >
                        </div>
                    )}
                    </div>
                </div>
              ))}

            </div>

            <button
              onClick={addQuestion}
              style={{
                backgroundColor: "var(--color-primary)",
                borderRadius: "var(--radius-main)",
                fontSize: "var(--font-subtitle)",
              }}
              className="mt-2 bg-purple-400 text-white px-5 py-1 rounded-lg hover:bg-purple-100"
            >
              Add Question
            </button>

          </div>

          {/* Question List */}

          <div className="bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-semibold mb-4">Questions</h2>

            <div className="space-y-3">

              {questions.map((q, i) => (
                <div
                  key={i}
                  className="p-3 bg-gray-100 rounded-lg"
                >
                  {i + 1}. {q.text}
                </div>
              ))}

            </div>

          </div>

        </div>

        {/* Bottom buttons */}

        <div className="flex gap-4 mt-8">

          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Start Game
          </button>

          <button
            onClick={saveQuiz}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Save Quiz
          </button>

        </div>

      </div>

    </div>
  );
}

export default HostCreateGame;