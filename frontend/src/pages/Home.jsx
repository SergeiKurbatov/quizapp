import { useEffect, useState } from "react";
import { getMyQuizzes } from "../services/quizService";
import { Plus, Play, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await getMyQuizzes();
        setQuizzes(data);
      } catch (err) {
        console.error("Failed to fetch quizzes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">My Quizzes</h1>
            <p className="text-white/40">Select a quiz to host or create a new one</p>
          </div>
          <button className="flex items-center gap-2 bg-violet-500 hover:bg-violet-400 px-6 py-3 rounded-xl font-semibold transition"
            onClick={() => navigate("/HostCreateGame")}
          >
            <Plus size={20} /> Create New Quiz
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-white/20">Loading your quizzes...</div>
        ) : quizzes.length === 0 ? (
          <div className="border-2 border-dashed border-white/5 rounded-3xl py-20 text-center">
            <p className="text-white/30 mb-4">No quizzes found.</p>
            <button className="text-violet-400 hover:underline">Build your first one</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="bg-gray-900 border border-white/10 rounded-2xl p-6 hover:border-violet-500/50 transition group">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full">
                    {quiz.theme || "General"}
                  </span>
                  <span className="text-white/20 text-xs">{quiz.version}</span>
                </div>
                <h3 className="text-xl font-bold mb-6">{quiz.title}</h3>
                
                <div className="flex gap-3">
                  <button className="flex-grow flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-2 rounded-lg text-sm font-medium transition"
                    onClick={() => navigate("/HostCreateGame")}
                 >
                    <Edit3 size={16} /> Edit
                  </button>
                  <button className="flex-grow flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-400 py-2 rounded-lg text-sm font-medium transition">
                    <Play size={16} /> Host
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;