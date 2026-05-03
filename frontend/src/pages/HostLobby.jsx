import { Users, Play, ChevronRight, Clock, CheckCircle, XCircle, Trophy, Volume2, VolumeX } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { useGameMusic } from "../hooks/useGameMusic";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../services/authService";
import { QRCodeSVG } from 'qrcode.react';
import AnimatedLeaderboard from "../components/game/AnimatedLeaderboard";
import { useDelayedLeaderboard } from "../hooks/useDelayedLeaderboard";

const API_URL = process.env.REACT_APP_API_URL;

const ANSWER_COLORS = [
  "bg-red-500", "bg-blue-500", "bg-yellow-500", "bg-green-500",
  "bg-purple-500", "bg-pink-500", "bg-orange-500", "bg-cyan-500",
  "bg-lime-500", "bg-indigo-500",
];
const MEDAL = ["🥇", "🥈", "🥉"];

function HostLobby() {
  const { state } = useLocation();
  const { gamePin } = useParams();
  const navigate = useNavigate();
  const STORAGE_KEY = `hostSession_${gamePin}`;
  const [players, setPlayers] = useState([]);
  const [copied, setCopied] = useState(false);
  const questionEndedRef = useRef(false);

  // Read saved state once on mount
  const saved = useRef((() => {
    try { return JSON.parse(localStorage.getItem(`hostSession_${gamePin}`)); }
    catch { return null; }
  })()).current;

  const [session, setSession] = useState(() => state?.session || saved?.session || null);
  const [gameStarted, setGameStarted] = useState(() => saved?.gameStarted ?? false);
  const [phase, setPhase] = useState(() => saved?.phase || "waiting");
  const [currentQuestion, setCurrentQuestion] = useState(() => saved?.currentQuestion || null);
  const [questionResult, setQuestionResult] = useState(() => saved?.questionResult || null);
  const [finalLeaderboard, setFinalLeaderboard] = useState(() => saved?.finalLeaderboard || []);
  const [questionStartedAt, setQuestionStartedAt] = useState(() => saved?.questionStartedAt || null);
  const [answerCount, setAnswerCount] = useState(() => saved?.answerCount || { answered: 0, total: 0 });

  // Restore timer from timestamp on refresh
  const [timeLeft, setTimeLeft] = useState(() => {
    if (saved?.phase === "playing" && saved?.currentQuestion && saved?.questionStartedAt) {
      const elapsed = Math.floor((Date.now() - saved.questionStartedAt) / 1000);
      const remaining = saved.currentQuestion.timeLimit - elapsed;
      return remaining > 0 ? remaining : 0;
    }
    return null;
  });

  const {
    displayLeaderboard,
    isUpdating,
    updateLeaderboard
  } = useDelayedLeaderboard(1000);

  // On restore to result phase, seed the animated leaderboard immediately
  useEffect(() => {
    if (saved?.phase === "result" && saved?.questionResult?.leaderboard) {
      updateLeaderboard(saved.questionResult.leaderboard);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [playerStatus, setPlayerStatus] = useState(() => {
    if (saved?.session) {
      return Object.fromEntries(
          (saved?.playerStatusSnapshot || []).map(n => [n, true])
      );
    }
    return {};
  });
  const audioEnabled = currentQuestion?.audioEnabled ?? session?.audioEnabled ?? true;
  const { muted, toggleMute } = useGameMusic(phase, audioEnabled);
  const muteButton = (
    <button onClick={toggleMute} title={muted ? "Unmute" : "Mute"} className="text-white/60 hover:text-white transition">
      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
    </button>
  );

  // Sync session from router state on fresh navigation
  useEffect(() => {
    if (state?.session) setSession(state.session);
  }, [state]);

  // If restored to playing phase with expired timer, mark question as ended
  useEffect(() => {
    if (saved?.phase === "playing" && timeLeft === 0) {
      questionEndedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist host state to localStorage on every relevant change
  useEffect(() => {
    if (!session) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      session,
      gameStarted,
      phase,
      currentQuestion,
      questionResult,
      finalLeaderboard,
      questionStartedAt,
      answerCount,
      playerStatusSnapshot: Object.keys(playerStatus),
    }));
  }, [session, gameStarted, phase, currentQuestion, questionResult, finalLeaderboard, questionStartedAt, answerCount, playerStatus, STORAGE_KEY]);

  useEffect(() => {
    if (timeLeft === null || timeLeft === 0) return;
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleEndQuestion = useCallback(async () => {
    if (questionEndedRef.current) return;
    questionEndedRef.current = true;
    setTimeLeft(0);
    try {
      await axios.put(`${API_URL}/sessions/${gamePin}/end-question`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch (err) {
      console.error("Failed to end question", err);
      questionEndedRef.current = false;
    }
  }, [gamePin]);

  useEffect(() => {
    if (timeLeft === 0 && phase === "playing" && !questionEndedRef.current) {
      handleEndQuestion();
    }
  }, [timeLeft, phase, handleEndQuestion]);

  const onQuestion = useCallback((question) => {
    const shuffled = [...question.answers].sort(() => Math.random() - 0.5);
    setCurrentQuestion({ ...question, answers: shuffled });
    setTimeLeft(question.timeLimit);
    setAnswerCount({ answered: 0, total: 0 });
    setQuestionResult(null);
    questionEndedRef.current = false;
    setPhase("playing");
    setQuestionStartedAt(Date.now());
  }, []);

  const onQuestionResult = useCallback((result) => {
    setQuestionResult(result);  
    setPhase("result");

   // Use the hook to handle the delay logic
    updateLeaderboard(result.leaderboard);
  }, [updateLeaderboard]);

  const onAnswerCount = useCallback((count) => {
    setAnswerCount(count);
  }, []);

  const onGameEnded = useCallback((data) => {
    setFinalLeaderboard(data.leaderboard || []);
    setPhase("finished");
    localStorage.removeItem(`hostSession_${gamePin}`);
  }, [gamePin]);

  const onPlayerStatus = useCallback((status) => {
    setPlayerStatus(status || {});
  }, []);

  useWebSocket({
    gamePin: gamePin ? parseInt(gamePin) : null,
    nickname: null,
    onPlayersUpdate: (updatedPlayers) => setPlayers([...updatedPlayers]),
    onQuestion,
    onQuestionResult,
    onAnswerCount,
    onGameEnded,
    onPlayerStatus,
  });

  async function handleKick(nickname) {
    if (!window.confirm(`Kick ${nickname}?`)) return;
    try {
      await axios.delete(`${API_URL}/sessions/${gamePin}/players/${nickname}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch (err) {
      console.error("Failed to kick player", err);
    }
  }

  async function handleStart() {
    try {
      await axios.put(`${API_URL}/sessions/${gamePin}/start`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setGameStarted(true);
    } catch (err) {
      console.error("Failed to start game", err);
      alert("Failed to start game.");
    }
  }

  async function handleNextQuestion() {
    try {
      await axios.put(`${API_URL}/sessions/${gamePin}/next-question`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch (err) {
      console.error("Failed to advance question", err);
      alert("Failed to advance question.");
    }
  }

  async function handleEndGame() {
    if (!window.confirm("End the quiz for all players?")) return;
    try {
      await axios.put(`${API_URL}/sessions/${gamePin}/end-game`, {}, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch (err) {
      console.error("Failed to end game", err);
      alert("Failed to end game.");
    }
  }

  // ── PLAYER STATUS SIDEBAR ─────────────────────────────────────────────────
  const PlayerStatusPanel = () => {
    const entries = Object.entries(playerStatus);
    if (entries.length === 0) return null;
    const connected = entries.filter(([, v]) => v).length;
    return (
        <div className="
        w-full md:w-56 md:shrink-0
        bg-gray-900/60 border border-white/10 rounded-2xl p-4
        md:self-start md:sticky md:top-4
        flex flex-col
        h-48 md:h-auto md:max-h-[80vh]
        overflow-hidden
      ">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Players</p>
            <span className="text-xs text-white/40">{connected}/{entries.length}</span>
          </div>
          {/* Fade container */}
          <div className="relative flex-1 min-h-0">
            <div className="overflow-y-auto h-full space-y-1.5 pr-1">
              {entries
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([nickname, isConnected]) => (
                      <div key={nickname} className="flex items-center gap-2 py-1">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${isConnected ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" : "bg-red-500/60"}`} />
                        <span className={`text-sm truncate ${isConnected ? "text-white/80" : "text-white/30"}`}>
                    {nickname}
                  </span>
                      </div>
                  ))}
            </div>
            {/* Fade overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none rounded-b-xl" />
          </div>
        </div>
    );
  };


  // ── FINISHED PHASE ────────────────────────────────────────────────────────
  if (phase === "finished") {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-lg">

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-yellow-400" size={32} />
            </div>
            <h1 className="text-3xl font-black mb-1">Game Over!</h1>
            <p className="text-white/40">{session.quizTitle}</p>
          </div>

          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 mb-6">
            <h3 className="text-white/40 uppercase tracking-widest text-sm mb-4">Final Leaderboard</h3>
            {finalLeaderboard.length === 0 ? (
              <p className="text-white/30 text-center py-4">No players</p>
            ) : (
              finalLeaderboard.map((entry) => (
                <div key={entry.position} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                  <span className="text-2xl w-8 text-center">
                    {entry.position <= 3 ? MEDAL[entry.position - 1] : <span className="text-white/40 font-black">{entry.position}</span>}
                  </span>
                  <span className="flex-1 font-semibold">{entry.nickname}</span>
                  <span className="text-violet-400 font-bold">{entry.score} pts</span>
                </div>
              ))
            )}
          </div>

          <button
              onClick={() => { localStorage.removeItem(STORAGE_KEY); navigate("/Home"); }}
              className="w-full py-4 rounded-xl font-bold bg-violet-500 hover:bg-violet-400 transition"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  // ── RESULT PHASE ──────────────────────────────────────────────────────────
  if (phase === "result" && questionResult) {
    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col md:flex-row justify-center gap-4 p-8 md:items-start">
          <div className="w-full max-w-3xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-white/40 text-sm uppercase tracking-widest">{session.quizTitle}</p>
              <p className="text-white/60 text-sm">Question {currentQuestion.questionIndex + 1} of {currentQuestion.totalQuestions}</p>
            </div>
            <div className="flex items-center gap-4">
              {muteButton}
              <button onClick={handleEndGame} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition">
                <XCircle size={16} /> End Quiz
              </button>
            </div>
          </div>

          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 mb-6">
            <p className="text-white/40 text-sm mb-2 uppercase tracking-widest">Question {currentQuestion.questionIndex + 1}</p>
            <h2 className="text-xl font-semibold mb-5">{currentQuestion.text}</h2>
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.answers.map((answer, i) => {
                const isCorrect = questionResult.correctAnswerIds.includes(answer.id);
                return (
                    <div key={answer.id} className={`${ANSWER_COLORS[i % 10]} ${isCorrect ? "ring-4 ring-white" : "opacity-40"} rounded-xl px-4 py-4 font-semibold flex items-center gap-2 transition-all`}>
                    {isCorrect && <CheckCircle size={18} />}
                    {answer.text}
                  </div>
                );
              })}
            </div>
          </div>

          {/* temporary result Leaderboard */}
          <AnimatedLeaderboard 
            leaderboard={displayLeaderboard} 
            isUpdating={isUpdating} 
            title="Top Players"
          />


          {currentQuestion.questionIndex + 1 < currentQuestion.totalQuestions ? (
            <button onClick={handleNextQuestion} className="w-full py-4 rounded-xl font-bold bg-violet-500 hover:bg-violet-400 transition flex items-center justify-center gap-2">
              Next Question <ChevronRight />
            </button>
          ) : (
            <button onClick={handleNextQuestion} className="w-full py-4 rounded-xl font-bold bg-green-500 hover:bg-green-400 transition flex items-center justify-center gap-2">
              <Trophy size={18} /> Show Final Results
            </button>
          )}
          </div>
          <PlayerStatusPanel />
        </div>
    );
  }

  // ── PLAYING PHASE

  // ── PLAYING PHASE ─────────────────────────────────────────────────────────
  if (phase === "playing" && currentQuestion) {
    const timerPct = timeLeft !== null ? (timeLeft / currentQuestion.timeLimit) * 100 : 0;
    const timerColor = timeLeft <= 5 ? "text-red-400" : "text-white";

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col md:flex-row justify-center gap-4 p-8 md:items-start">
          <div className="w-full max-w-3xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-white/40 text-sm uppercase tracking-widest">{session.quizTitle}</p>
              <p className="text-white/60 text-sm">Question {currentQuestion.questionIndex + 1} of {currentQuestion.totalQuestions}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-4xl font-black tabular-nums ${timerColor}`}>{timeLeft}s</span>
              {muteButton}
              <button onClick={handleEndGame} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition">
                <XCircle size={16} /> End Quiz
              </button>
            </div>
          </div>

          <div className="w-full h-2 bg-white/10 rounded-full mb-6">
            <div className="h-full bg-violet-500 rounded-full transition-all duration-1000 ease-linear" style={{ width: `${timerPct}%` }} />
          </div>

          <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-6">{currentQuestion.text}</h2>

            {/* Image */}
            {currentQuestion.imageUrl && (
              <div className="w-full flex justify-center mb-8">
                <div className="max-w-2xl w-full rounded-2xl overflow-hidden border-4 border-white/5 bg-black/20 shadow-inner">
                  <img 
                    src={currentQuestion.imageUrl} 
                    alt="Question" 
                    className="w-full h-auto max-h-[40vh] object-contain block mx-auto" 
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.answers.map((answer, i) => (
                  <div key={answer.id} className={`${ANSWER_COLORS[i % 10]} opacity-80 rounded-xl px-4 py-4 font-semibold`}>
                    {answer.text}
                  </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 mb-6 flex items-center gap-4">
            <Users className="text-violet-400" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/60">Answered</span>
                <span className="font-bold">{answerCount.answered} / {answerCount.total}</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full">
                <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: answerCount.total > 0 ? `${(answerCount.answered / answerCount.total) * 100}%` : "0%" }} />
              </div>
            </div>
          </div>

            <button onClick={handleEndQuestion} disabled={questionEndedRef.current} className="w-full py-4 rounded-xl font-bold bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2">
              <Clock size={18} /> End Question
            </button>
          </div>
          <PlayerStatusPanel />
        </div>
    );
  }

  // ── WAITING PHASE ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center p-8">
      <div className="w-full max-w-4xl flex justify-between items-center mb-12">
        <div>
          <h2 className="text-white/40 uppercase tracking-widest text-sm">Quiz Title</h2>
          <h1 className="text-2xl font-bold">{session.quizTitle}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleStart} disabled={gameStarted} className="bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition transform hover:scale-105">
            <Play fill="currentColor" /> {gameStarted ? "Game In Progress" : "Start Game"}
          </button>
          {muteButton}
          <button onClick={handleEndGame} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition">
            <XCircle size={16} /> End Quiz
          </button>
        </div>
      </div>

      <div className="bg-gray-900 border border-white/10 rounded-3xl p-12 text-center mb-12 w-full max-w-md shadow-2xl">
        <p className="text-white/40 mb-2 uppercase font-semibold">Join at <span className="text-violet-400">{window.location.host}/game/{gamePin}</span></p>
        <h1 className="text-7xl font-black tracking-tighter text-white mb-6">{gamePin}</h1>
        <div className="flex justify-center mb-6">
          <div className="bg-white p-3 rounded-2xl">
            <QRCodeSVG value={`${window.location.origin}/game/${gamePin}`} size={160} />
          </div>
        </div>
        <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/game/${gamePin}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className={`flex items-center gap-2 mx-auto px-4 py-2 rounded-lg border text-sm font-medium transition ${
                copied
                    ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                    : "border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
            }`}
        >
          {copied ? "✓ Link copied!" : "Copy join link"}
        </button>
      </div>

      <div className="w-full max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <Users className="text-violet-400" />
          <h3 className="text-xl font-semibold">{players.length} Players Joined</h3>
        </div>
        {players.length === 0 ? (
          <p className="text-white/30 text-center py-10">Waiting for players to join...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {players.map((p, i) => (
              <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl text-center relative group">
                <span className="font-medium text-white/80">{p}</span>
                <button onClick={() => handleKick(p)} className="absolute top-1 right-1 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition text-xs px-1">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HostLobby;
