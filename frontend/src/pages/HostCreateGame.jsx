import { useState, useEffect, useRef } from "react";
import { createQuiz, updateQuiz, createSession } from "../services/quizService";
import { useNavigate, useLocation } from "react-router-dom";

function HostCreateGame() {
  const [saveStatus, setSaveStatus] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const existingQuiz = location.state?.quiz;
  const isEditing = !!existingQuiz?.id;

  const [title, setTitle] = useState(existingQuiz?.title || "");
  const [theme, setTheme] = useState(existingQuiz?.theme || "");
  const [audioEnabled, setAudioEnabled] = useState(
    existingQuiz?.audioEnabled !== false,
  );
  const [questions, setQuestions] = useState(existingQuiz?.questions || []);
  const [questionText, setQuestionText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [timeLimit, setTimeLimit] = useState(30);
  const [answers, setAnswers] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [questionType, setQuestionType] = useState("multiple");

  // Track whether the quiz has been modified since it was loaded
  const [isModified, setIsModified] = useState(false);
  const initialStateRef = useRef({
    title: existingQuiz?.title || "",
    theme: existingQuiz?.theme || "",
    audioEnabled: existingQuiz?.audioEnabled !== false,
    questions: JSON.stringify(existingQuiz?.questions || []),
  });

  // Detect modifications
  useEffect(() => {
    if (!isEditing) return;
    const changed =
      title !== initialStateRef.current.title ||
      theme !== initialStateRef.current.theme ||
      audioEnabled !== initialStateRef.current.audioEnabled ||
      JSON.stringify(questions) !== initialStateRef.current.questions;
    setIsModified(changed);
  }, [title, theme, audioEnabled, questions, isEditing]);

  function toggleCorrect(index) {
    if (questionType === "truefalse") {
      setCorrect([index]);
    } else {
      if (correct.includes(index)) {
        setCorrect(correct.filter((i) => i !== index));
      } else {
        setCorrect([...correct, index]);
      }
    }
  }

  function handleTypeChange(type) {
    setQuestionType(type);
    if (type === "truefalse") {
      setAnswers(["True", "False"]);
      setCorrect([0]);
    } else {
      setAnswers(["", "", "", ""]);
      setCorrect([]);
    }
  }

  // Reset all question fields to start a fresh question — keeps timeLimit
  function clearQuestionFields() {
    setActiveQuestion(null);
    setQuestionText("");
    setImageUrl("");
    setAnswers(["", "", "", ""]);
    setCorrect([]);
    setQuestionType("multiple");
    // timeLimit preserved — likely the same across questions in a quiz
  }

  function addQuestion() {
    const formattedAnswers = answers.map((answer, index) => ({
      text: answer,
      isCorrect: correct.includes(index),
    }));

    const newQuestion = {
      text: questionText,
      imageUrl: imageUrl,
      timeLimit,
      questionType,
      answers: formattedAnswers,
    };

    if (activeQuestion !== null) {
      // Update existing question in place
      const updated = [...questions];
      updated[activeQuestion] = newQuestion;
      setQuestions(updated);
      setActiveQuestion(null);
    } else {
      setQuestions([...questions, newQuestion]);
    }

    setQuestionText("");
    setImageUrl("");
    setTimeLimit(30);
    setAnswers(["", "", "", ""]);
    setCorrect([]);
    setQuestionType("multiple");
  }

  // Save as new quiz (always creates a new one)
  async function saveDraft() {
    const quiz = { title, theme, audioEnabled, questions };
    try {
      await createQuiz(quiz);
      setSaveStatus("draft");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("Error saving quiz:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  }

  async function startGame() {
    try {
      let quizId = existingQuiz?.id;
      if (!quizId || isModified) {
        const quiz = { title, theme, audioEnabled, questions };
        const response = quizId
          ? await updateQuiz(quizId, quiz)
          : await createQuiz(quiz);
        quizId = response.data.id;
      }
      const sessionData = await createSession(quizId);
      navigate(`/HostLobby/${sessionData.gamePin}`, {
        state: { session: sessionData },
      });
    } catch (err) {
      console.error("Failed to start session", err);
      alert("Could not start game session.");
    }
  }

  // Save changes to existing quiz
  async function saveChanges() {
    const quiz = { title, theme, audioEnabled, questions };
    try {
      await updateQuiz(existingQuiz.id, quiz);
      setSaveStatus("saved");
      setIsModified(false);
      // Update the initial ref so further edits are tracked from here
      initialStateRef.current = {
        title,
        theme,
        audioEnabled,
        questions: JSON.stringify(questions),
      };
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("Error updating quiz:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  }

  const answerColors = [
    {
      border: "border-rose-400",
      bg: "bg-rose-50",
      label: "text-rose-500",
      activeBg: "bg-rose-400",
    },
    {
      border: "border-sky-400",
      bg: "bg-sky-50",
      label: "text-sky-500",
      activeBg: "bg-sky-400",
    },
    {
      border: "border-amber-400",
      bg: "bg-amber-50",
      label: "text-amber-500",
      activeBg: "bg-amber-400",
    },
    {
      border: "border-emerald-400",
      bg: "bg-emerald-50",
      label: "text-emerald-500",
      activeBg: "bg-emerald-400",
    },
    {
      border: "border-purple-400",
      bg: "bg-purple-50",
      label: "text-purple-500",
      activeBg: "bg-purple-400",
    },
    {
      border: "border-orange-400",
      bg: "bg-orange-50",
      label: "text-orange-500",
      activeBg: "bg-orange-400",
    },
    {
      border: "border-pink-400",
      bg: "bg-pink-50",
      label: "text-pink-500",
      activeBg: "bg-pink-400",
    },
    {
      border: "border-teal-400",
      bg: "bg-teal-50",
      label: "text-teal-500",
      activeBg: "bg-teal-400",
    },
    {
      border: "border-indigo-400",
      bg: "bg-indigo-50",
      label: "text-indigo-500",
      activeBg: "bg-indigo-400",
    },
    {
      border: "border-lime-400",
      bg: "bg-lime-50",
      label: "text-lime-500",
      activeBg: "bg-lime-400",
    },
  ];

  const answerLabels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      {/* Top navbar */}
      <div className="border-b border-white/10 px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-gray-900/60 backdrop-blur-sm sticky top-0 z-10">
        {" "}
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center text-sm font-bold">
            Q
          </div>
          <span className="text-sm font-semibold text-white/80 tracking-wide uppercase">
            Quiz Builder
          </span>
          <button
            onClick={() => navigate("/Home")}
            className="ml-6 text-sm text-white/50 hover:text-white transition"
          >
            My Quizzes
          </button>
          <button
            onClick={() => {
              setTitle("");
              setTheme("");
              setAudioEnabled(true);
              setQuestions([]);
              setQuestionText("");
              setImageUrl("");
              setTimeLimit(30);
              setAnswers(["", "", "", ""]);
              setCorrect([]);
              setActiveQuestion(null);
              setQuestionType("multiple");
              setIsModified(false);
              initialStateRef.current = {
                title: "",
                theme: "",
                audioEnabled: true,
                questions: "[]",
              };
              navigate("/HostCreateGame", { state: null });
            }}
            className="ml-4 text-sm text-white/50 hover:text-white transition"
          >
            + New Quiz
          </button>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status messages */}
          {saveStatus === "saved" && (
            <span className="text-sm text-emerald-400 font-medium">
              ✓ Changes saved!
            </span>
          )}
          {saveStatus === "draft" && (
            <span className="text-sm text-emerald-400 font-medium">
              ✓ Saved as new quiz!
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-sm text-red-400 font-medium">
              ✗ Failed to save
            </span>
          )}

          {/* Save Changes */}
          {isEditing && isModified && (
            <button
              onClick={saveChanges}
              disabled={!title.trim() || questions.length === 0}
              className="w-full md:w-auto px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400"
            >
              Save Changes
            </button>
          )}

          {/* 👇 ВАЖНО: отдельный контейнер для 2 кнопок */}
          <div className="flex w-full gap-3">
            <button
              onClick={saveDraft}
              disabled={!title.trim() || questions.length === 0}
              className="w-1/2 md:w-auto px-4 py-2 text-sm font-medium rounded-lg border border-white/20 text-white/70"
            >
              Save Draft
            </button>

            <button
              onClick={startGame}
              disabled={!title.trim() || questions.length === 0}
              className="w-1/2 md:w-auto px-4 py-2 text-sm font-semibold rounded-lg bg-violet-500"
            >
              Start Game →
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-[calc(100vh-65px)]">
        {/* Sidebar */}
        <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-white/10 bg-gray-900/40 flex flex-col">
          <div className="p-5 border-b border-white/10 space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
                Quiz Title
              </p>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                placeholder="Enter quiz title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
                Theme
              </p>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                placeholder="e.g. Animals, Politics..."
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              />
            </div>
            <label className="flex items-center justify-between cursor-pointer select-none px-1 py-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-white/40">
                Background Music
              </span>
              <span className="relative inline-block">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={audioEnabled}
                  onChange={(e) => setAudioEnabled(e.target.checked)}
                />
                <span className="block w-9 h-5 bg-white/10 peer-checked:bg-violet-500 rounded-full transition" />
                <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-4" />
              </span>
            </label>
            {/* Editing indicator */}
            {isEditing && (
              <div
                className={`text-xs px-2 py-1 rounded-md ${isModified ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-white/30"}`}
              >
                {isModified ? "⚠ Unsaved changes" : "✓ No changes"}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">
              Questions ({questions.length})
            </p>
            {questions.length === 0 && (
              <div className="text-sm md:text-base font-semibold mb-1">
                No questions yet.
                <br />
                Add one on the right →
              </div>
            )}
            {questions.map((q, i) => (
              <div
                key={i}
                onClick={() => {
                  if (activeQuestion === i) {
                    // Clicking the active question again = deselect → fresh question
                    clearQuestionFields();
                  } else {
                    const q = questions[i];
                    setActiveQuestion(i);
                    setQuestionText(q.text);
                    setImageUrl(q.imageUrl || "");
                    setTimeLimit(q.timeLimit || 30);
                    setQuestionType(q.questionType || "multiple");
                    setAnswers(q.answers.map((a) => a.text));
                    setCorrect(
                      q.answers
                        .map((a, idx) => (a.isCorrect ? idx : null))
                        .filter((idx) => idx !== null),
                    );
                  }
                }}
                className={`p-3 rounded-lg cursor-pointer border transition-all duration-150 ${
                  activeQuestion === i
                    ? "bg-violet-500/20 border-violet-500/50 text-white"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-xs flex items-center justify-center font-bold text-white/50 shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm truncate">
                    {q.text || "Untitled question"}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuestions(questions.filter((_, qi) => qi !== i));
                    }}
                    className="ml-auto text-white/20 hover:text-red-400 transition text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex items-center gap-x-2 gap-y-1 mt-2 ml-7 flex-wrap">
                  <div className="flex flex-wrap gap-1">
                    {q.answers.map((a, j) => (
                      <span
                        key={j}
                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${a.isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/30"}`}
                      >
                        {answerLabels[j]}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-white/30 shrink-0">
                    ⏱ {q.timeLimit}s
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main editor */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {activeQuestion !== null ? "Edit Question" : "Add a Question"}
                </h1>
                <p className="text-white/40 text-sm mt-1">
                  Click an answer to mark it as correct
                </p>
              </div>
              {activeQuestion !== null && (
                <button
                  onClick={clearQuestionFields}
                  className="px-5 py-3 text-base font-medium rounded-lg border border-white/20 text-white/60 hover:bg-white/10 hover:text-white transition shrink-0"
                >
                  + New Question
                </button>
              )}
            </div>

            {/* Question type */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
                Question Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeChange("multiple")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${questionType === "multiple" ? "bg-violet-500 text-white" : "border border-white/20 text-white/50 hover:text-white hover:bg-white/10"}`}
                >
                  Multiple Choice
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange("truefalse")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${questionType === "truefalse" ? "bg-violet-500 text-white" : "border border-white/20 text-white/50 hover:text-white hover:bg-white/10"}`}
                >
                  True / False
                </button>
              </div>
            </div>

            {/* Question input */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
                Question
              </label>
              <textarea
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 resize-none transition text-sm"
                placeholder="What do you want to ask?"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
            </div>

            {/* Image URL */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
                Image URL (Optional)
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-violet-500 transition"
                  placeholder="https://example.com/image.png"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                {imageUrl && (
                  <div className="w-12 h-10 rounded-lg border border-white/10 overflow-hidden bg-white/5">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-white/20 mt-1 uppercase tracking-tight">
                Paste a direct link to an image (jpg, png, webp)
              </p>
            </div>

            {/* Time limit */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">
                Time Limit (seconds)
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-32 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
              />
              <span className="text-white/30 text-xs ml-2">
                seconds (5–120)
              </span>
            </div>

            {/* Answers grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {answers.map((a, i) => {
                const color = answerColors[i];
                const isCorrect = correct.includes(i);
                return (
                  <div
                    key={i}
                    onClick={() => toggleCorrect(i)}
                    className={`relative rounded-xl border-2 p-3 cursor-pointer transition-all duration-150 ${isCorrect ? `${color.border} ${color.bg}` : "border-white/10 bg-white/5 hover:border-white/20"}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center text-white ${isCorrect ? color.activeBg : "bg-white/10"}`}
                      >
                        {answerLabels[i]}
                      </span>
                      {isCorrect && (
                        <span
                          className={`text-xs font-semibold ${color.label}`}
                        >
                          ✓ Correct
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        className={`w-full bg-transparent text-sm focus:outline-none placeholder-white/30 ${isCorrect ? "text-black" : "text-white"}`}
                        placeholder={`Answer ${answerLabels[i]}...`}
                        value={a}
                        readOnly={questionType === "truefalse"}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          if (questionType === "truefalse") return;
                          const copy = [...answers];
                          copy[i] = e.target.value;
                          setAnswers(copy);
                        }}
                      />
                      {answers.length > 2 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAnswers(answers.filter((_, ai) => ai !== i));
                            setCorrect(
                              correct
                                .filter((ci) => ci !== i)
                                .map((ci) => (ci > i ? ci - 1 : ci)),
                            );
                          }}
                          className={`shrink-0 transition text-xs font-bold ${isCorrect ? "text-red-500" : "text-white/40 hover:text-red-400"}`}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Answer count controls */}
            {questionType === "multiple" && (
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setAnswers([...answers, ""])}
                  disabled={answers.length >= 10}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/20 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  + Add Answer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAnswers(answers.slice(0, -1));
                    setCorrect(correct.filter((i) => i < answers.length - 1));
                  }}
                  disabled={answers.length <= 2}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/20 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  − Remove Answer
                </button>
              </div>
            )}

            {/* Add question button */}
            <button
              onClick={addQuestion}
              disabled={!questionText.trim()}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-violet-500 hover:bg-violet-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 shadow-lg shadow-violet-500/20"
            >
              {activeQuestion !== null ? "✓ Update Question" : "+ Add Question"}
            </button>

            {/* Stats bar */}
            {questions.length > 0 && (
              <div className="mt-6 flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10 text-sm text-white/50">
                <span>
                  📋 <strong className="text-white">{questions.length}</strong>{" "}
                  questions
                </span>
                <span>
                  ✅{" "}
                  <strong className="text-white">
                    {questions.reduce(
                      (acc, q) =>
                        acc + q.answers.filter((a) => a.isCorrect).length,
                      0,
                    )}
                  </strong>{" "}
                  correct answers
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HostCreateGame;
